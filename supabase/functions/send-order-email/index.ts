import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  customerEmail: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
}

const generateOrderItemsHtml = (items: OrderEmailRequest["items"]) => {
  return items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${item.size}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">LE ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join("");
};

const generateOwnerEmailHtml = (data: OrderEmailRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background-color: #2d2d2d; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">JASPROJECT</h1>
        <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">New Order Received</p>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #2d2d2d; font-size: 18px; margin: 0 0 20px 0; font-weight: 500;">Customer Information</h2>
        <table style="width: 100%; margin-bottom: 30px;">
          <tr>
            <td style="padding: 8px 0; color: #666666; width: 120px;">Name:</td>
            <td style="padding: 8px 0; color: #2d2d2d; font-weight: 500;">${data.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666;">Email:</td>
            <td style="padding: 8px 0; color: #2d2d2d;">${data.customerEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666;">Phone:</td>
            <td style="padding: 8px 0; color: #2d2d2d;">${data.phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666666;">Address:</td>
            <td style="padding: 8px 0; color: #2d2d2d;">${data.address}, ${data.city}</td>
          </tr>
        </table>
        
        <h2 style="color: #2d2d2d; font-size: 18px; margin: 0 0 20px 0; font-weight: 500;">Order Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f0;">
              <th style="padding: 12px; text-align: left; font-weight: 500; color: #2d2d2d;">Product</th>
              <th style="padding: 12px; text-align: left; font-weight: 500; color: #2d2d2d;">Size</th>
              <th style="padding: 12px; text-align: center; font-weight: 500; color: #2d2d2d;">Qty</th>
              <th style="padding: 12px; text-align: right; font-weight: 500; color: #2d2d2d;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${generateOrderItemsHtml(data.items)}
          </tbody>
        </table>
        
        <div style="background-color: #f5f5f0; padding: 20px; border-radius: 6px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 5px 0; color: #666666;">Subtotal:</td>
              <td style="padding: 5px 0; text-align: right; color: #2d2d2d;">LE ${data.subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #666666;">Shipping:</td>
              <td style="padding: 5px 0; text-align: right; color: #2d2d2d;">${data.shipping === 0 ? 'Free' : `LE ${data.shipping}`}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0 0 0; color: #2d2d2d; font-weight: 600; font-size: 18px; border-top: 2px solid #e5e5e5;">Total:</td>
              <td style="padding: 10px 0 0 0; text-align: right; color: #2d2d2d; font-weight: 600; font-size: 18px; border-top: 2px solid #e5e5e5;">LE ${data.total.toLocaleString()}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

const generateCustomerEmailHtml = (data: OrderEmailRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background-color: #2d2d2d; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">JASPROJECT</h1>
        <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">Order Confirmation</p>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #2d2d2d; font-size: 20px; margin: 0 0 15px 0; font-weight: 500;">Thank you for your order, ${data.customerName.split(' ')[0]}!</h2>
        <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0;">We've received your order and will begin processing it shortly. You'll receive another email when your order ships.</p>
        
        <h3 style="color: #2d2d2d; font-size: 16px; margin: 0 0 15px 0; font-weight: 500;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f0;">
              <th style="padding: 12px; text-align: left; font-weight: 500; color: #2d2d2d;">Product</th>
              <th style="padding: 12px; text-align: left; font-weight: 500; color: #2d2d2d;">Size</th>
              <th style="padding: 12px; text-align: center; font-weight: 500; color: #2d2d2d;">Qty</th>
              <th style="padding: 12px; text-align: right; font-weight: 500; color: #2d2d2d;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${generateOrderItemsHtml(data.items)}
          </tbody>
        </table>
        
        <div style="background-color: #f5f5f0; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 5px 0; color: #666666;">Subtotal:</td>
              <td style="padding: 5px 0; text-align: right; color: #2d2d2d;">LE ${data.subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #666666;">Shipping:</td>
              <td style="padding: 5px 0; text-align: right; color: #2d2d2d;">${data.shipping === 0 ? 'Free' : `LE ${data.shipping}`}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0 0 0; color: #2d2d2d; font-weight: 600; font-size: 18px; border-top: 2px solid #e5e5e5;">Total:</td>
              <td style="padding: 10px 0 0 0; text-align: right; color: #2d2d2d; font-weight: 600; font-size: 18px; border-top: 2px solid #e5e5e5;">LE ${data.total.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <h3 style="color: #2d2d2d; font-size: 16px; margin: 0 0 15px 0; font-weight: 500;">Shipping Address</h3>
        <p style="color: #666666; line-height: 1.6; margin: 0 0 30px 0;">
          ${data.customerName}<br>
          ${data.address}<br>
          ${data.city}<br>
          ${data.phone}
        </p>
        
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e5e5;">
          <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">Questions about your order?</p>
          <p style="margin: 0;">
            <a href="mailto:jasproject.co@gmail.com" style="color: #2d2d2d; text-decoration: none;">jasproject.co@gmail.com</a>
          </p>
          <p style="margin: 15px 0 0 0;">
            <a href="https://instagram.com/jas__project" style="color: #666666; text-decoration: none; font-size: 13px;">@jas__project</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

const sendEmail = async (to: string[], from: string, subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
  
  return response.json();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderEmailRequest = await req.json();
    console.log("Received order data:", orderData);

    // Send notification to owner
    const ownerEmailResponse = await sendEmail(
      ["jasproject.co@gmail.com"],
      "JASPROJECT Orders <onboarding@resend.dev>",
      `New Order from ${orderData.customerName} - LE ${orderData.total.toLocaleString()}`,
      generateOwnerEmailHtml(orderData)
    );
    console.log("Owner email sent:", ownerEmailResponse);

    // Send confirmation to customer
    const customerEmailResponse = await sendEmail(
      [orderData.customerEmail],
      "JASPROJECT <onboarding@resend.dev>",
      "Your JASPROJECT Order Confirmation",
      generateCustomerEmailHtml(orderData)
    );
    console.log("Customer email sent:", customerEmailResponse);

    return new Response(
      JSON.stringify({ success: true, ownerEmail: ownerEmailResponse, customerEmail: customerEmailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
