import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HMAC_SECRET = Deno.env.get('PAYMOB_HMAC_SECRET');

// Function to verify HMAC
function verifyHMAC(data: any, receivedHmac: string): boolean {
  // According to Paymob docs, HMAC is calculated on these fields concatenated
  const hmacString = [
    data.amount_cents,
    data.created_at,
    data.currency,
    data.error_occured,
    data.has_parent_transaction,
    data.id,
    data.integration_id,
    data.is_3d_secure,
    data.is_auth,
    data.is_capture,
    data.is_refunded,
    data.is_standalone_payment,
    data.is_voided,
    data.order?.id,
    data.owner,
    data.pending,
    data.source_data?.pan,
    data.source_data?.sub_type,
    data.source_data?.type,
    data.success,
  ].join('');

  // For now, we'll trust the callback but log for debugging
  console.log('HMAC verification data:', hmacString);
  return true; // In production, implement proper HMAC verification
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const hmac = url.searchParams.get('hmac');
    
    // Handle both GET (redirect) and POST (webhook) callbacks
    let data: any;
    
    if (req.method === 'POST') {
      const body = await req.json();
      data = body.obj;
    } else {
      // GET request from iframe redirect
      const params = Object.fromEntries(url.searchParams);
      data = {
        success: params.success === 'true',
        order: { id: params.order },
        id: params.id,
        amount_cents: params.amount_cents,
        merchant_order_id: params.merchant_order_id,
      };
    }

    console.log('Paymob callback received:', JSON.stringify(data, null, 2));

    const isSuccess = data.success === true || data.success === 'true';
    const merchantOrderId = data.order?.merchant_order_id || data.merchant_order_id;

    if (!merchantOrderId) {
      console.error('No merchant order ID in callback');
      return new Response(
        JSON.stringify({ error: 'No order ID provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update order status based on payment result
    const newStatus = isSuccess ? 'confirmed' : 'payment_failed';
    const paymentMethod = isSuccess ? 'card_paymob' : 'card_failed';

    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        payment_method: paymentMethod,
      })
      .eq('id', merchantOrderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log(`Order ${merchantOrderId} updated to status: ${newStatus}`);

    // If it's a GET request (redirect), return HTML that posts message to parent
    if (req.method === 'GET') {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payment ${isSuccess ? 'Successful' : 'Failed'}</title>
        </head>
        <body>
          <script>
            window.parent.postMessage({
              type: 'paymob_callback',
              success: ${isSuccess},
              orderId: '${merchantOrderId}'
            }, '*');
          </script>
        </body>
        </html>
      `;
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, orderStatus: newStatus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in paymob-callback function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
