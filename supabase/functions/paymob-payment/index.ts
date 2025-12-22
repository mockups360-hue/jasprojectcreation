import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYMOB_API_KEY = Deno.env.get('PAYMOB_API_KEY');
const PAYMOB_INTEGRATION_ID = Deno.env.get('PAYMOB_INTEGRATION_ID');
const PAYMOB_IFRAME_ID = Deno.env.get('PAYMOB_IFRAME_ID');

interface PaymentRequest {
  amount: number;
  orderId: string;
  customerEmail: string;
  customerName: string;
  phone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  billingData: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    phone: string;
    email: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, orderId, customerEmail, customerName, phone, items, billingData }: PaymentRequest = await req.json();
    
    console.log('Starting Paymob payment process for order:', orderId);
    console.log('Amount (in EGP):', amount);

    // Step 1: Authentication - Get auth token
    const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('Auth error:', authError);
      throw new Error('Failed to authenticate with Paymob');
    }

    const authData = await authResponse.json();
    const authToken = authData.token;
    console.log('Auth token obtained successfully');

    // Step 2: Order Registration
    const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: Math.round(amount * 100), // Convert to cents
        currency: 'EGP',
        merchant_order_id: orderId,
        items: items.map(item => ({
          name: item.name,
          amount_cents: Math.round(item.price * 100),
          quantity: item.quantity,
        })),
      }),
    });

    if (!orderResponse.ok) {
      const orderError = await orderResponse.text();
      console.error('Order registration error:', orderError);
      throw new Error('Failed to register order with Paymob');
    }

    const orderData = await orderResponse.json();
    const paymobOrderId = orderData.id;
    console.log('Paymob order registered:', paymobOrderId);

    // Step 3: Payment Key Request
    const paymentKeyResponse = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: Math.round(amount * 100),
        expiration: 3600, // 1 hour
        order_id: paymobOrderId,
        billing_data: {
          apartment: 'NA',
          email: billingData.email,
          floor: 'NA',
          first_name: billingData.firstName,
          street: billingData.address,
          building: 'NA',
          phone_number: billingData.phone,
          shipping_method: 'NA',
          postal_code: 'NA',
          city: billingData.city,
          country: 'EG',
          last_name: billingData.lastName,
          state: 'NA',
        },
        currency: 'EGP',
        integration_id: parseInt(PAYMOB_INTEGRATION_ID || '0'),
      }),
    });

    if (!paymentKeyResponse.ok) {
      const paymentKeyError = await paymentKeyResponse.text();
      console.error('Payment key error:', paymentKeyError);
      throw new Error('Failed to get payment key from Paymob');
    }

    const paymentKeyData = await paymentKeyResponse.json();
    const paymentToken = paymentKeyData.token;
    console.log('Payment token obtained successfully');

    return new Response(
      JSON.stringify({
        success: true,
        paymentToken,
        paymobOrderId,
        iframeId: PAYMOB_IFRAME_ID,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in paymob-payment function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
