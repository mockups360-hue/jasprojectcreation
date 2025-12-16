import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  newStatus: string;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

const getStatusMessage = (status: string): { subject: string; heading: string; message: string } => {
  switch (status) {
    case "out_for_delivery":
      return {
        subject: "Your JASPROJECT Order is Out for Delivery! 🚚",
        heading: "Your Order is On Its Way!",
        message: "Great news! Your order has been dispatched and is currently out for delivery. Please ensure someone is available to receive the package."
      };
    case "delivered":
      return {
        subject: "Your JASPROJECT Order Has Been Delivered! ✅",
        heading: "Order Delivered Successfully!",
        message: "Your order has been delivered! We hope you love your new JASPROJECT items. Thank you for shopping with us!"
      };
    case "cancelled":
      return {
        subject: "Your JASPROJECT Order Has Been Cancelled",
        heading: "Order Cancelled",
        message: "We're sorry to inform you that your order has been cancelled. If you have any questions, please contact us at jasproject.co@gmail.com."
      };
    default:
      return {
        subject: "JASPROJECT Order Status Update",
        heading: "Order Status Updated",
        message: `Your order status has been updated to: ${status.replace(/_/g, ' ')}.`
      };
  }
};

const generateOrderItemsHtml = (items: StatusUpdateRequest["items"]) => {
  return items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${item.name} (${item.size})</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">LE ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join("");
};

const generateStatusEmailHtml = (data: StatusUpdateRequest, statusInfo: { heading: string; message: string }) => `
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
        <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">Order Status Update</p>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #2d2d2d; font-size: 20px; margin: 0 0 15px 0; font-weight: 500;">${statusInfo.heading}</h2>
        <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">Dear ${data.customerName.split(' ')[0]},</p>
        <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">${statusInfo.message}</p>
        
        <div style="background-color: #f5f5f0; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
          <p style="margin: 0; color: #666666; font-size: 13px;">Order ID</p>
          <p style="margin: 5px 0 0 0; color: #2d2d2d; font-weight: 600; font-size: 14px;">#${data.orderId.slice(0, 8).toUpperCase()}</p>
        </div>
        
        <h3 style="color: #2d2d2d; font-size: 16px; margin: 0 0 15px 0; font-weight: 500;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f5f5f0;">
              <th style="padding: 12px; text-align: left; font-weight: 500; color: #2d2d2d;">Item</th>
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
              <td style="padding: 5px 0; color: #666666;">Payment:</td>
              <td style="padding: 5px 0; text-align: right; color: #2d2d2d;">Cash on Delivery</td>
            </tr>
            <tr>
              <td style="padding: 10px 0 0 0; color: #2d2d2d; font-weight: 600; font-size: 18px; border-top: 2px solid #e5e5e5;">Total:</td>
              <td style="padding: 10px 0 0 0; text-align: right; color: #2d2d2d; font-weight: 600; font-size: 18px; border-top: 2px solid #e5e5e5;">LE ${data.total.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
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
    const data: StatusUpdateRequest = await req.json();
    console.log("Received status update request:", data);

    const statusInfo = getStatusMessage(data.newStatus);

    const emailResponse = await sendEmail(
      [data.customerEmail],
      "JASPROJECT <orders@jasproject.store>",
      statusInfo.subject,
      generateStatusEmailHtml(data, statusInfo)
    );
    console.log("Status update email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-status-update-email:", error);
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
