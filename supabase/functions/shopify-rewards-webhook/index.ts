import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-topic, x-shopify-hmac-sha256, x-shopify-shop-domain',
};

function normalizeShopifyDomain(raw: string): string {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return trimmed;

  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProto);
    return url.hostname;
  } catch {
    return trimmed
      .replace(/^https?:\/\//i, '')
      .split('/')[0]
      .split('?')[0]
      .trim();
  }
}

const SHOPIFY_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN')!;

// Normalize and force permanent *.myshopify.com domain for Admin API calls.
// USER'S ACTUAL STORE - not the Lovable-managed sandbox
const SHOPIFY_STORE_DOMAIN_FALLBACK = 'skillstackershop.myshopify.com';
const SHOPIFY_STORE_DOMAIN_RAW = Deno.env.get('SHOPIFY_STORE_DOMAIN')!;
const SHOPIFY_STORE_DOMAIN_NORMALIZED = normalizeShopifyDomain(SHOPIFY_STORE_DOMAIN_RAW);
const SHOPIFY_STORE_DOMAIN =
  SHOPIFY_STORE_DOMAIN_NORMALIZED && SHOPIFY_STORE_DOMAIN_NORMALIZED.endsWith('.myshopify.com')
    ? SHOPIFY_STORE_DOMAIN_NORMALIZED
    : SHOPIFY_STORE_DOMAIN_FALLBACK;

const SHOPIFY_WEBHOOK_SECRET = Deno.env.get('SHOPIFY_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Metafield definitions
const REWARDS_NAMESPACE = 'rewards';
const PRODUCT_POINTS_KEY = 'points_value';
const CUSTOMER_BALANCE_KEY = 'points_balance';
const CUSTOMER_LIFETIME_KEY = 'lifetime_points';

interface ShopifyLineItem {
  product_id: number;
  variant_id: number;
  quantity: number;
  title: string;
  price: string;
}

interface ShopifyOrder {
  id: number;
  order_number: number;
  customer: {
    id: number;
    email: string;
  } | null;
  line_items: ShopifyLineItem[];
  financial_status: string;
  refunds?: Array<{
    id: number;
    refund_line_items: Array<{
      line_item_id: number;
      quantity: number;
    }>;
  }>;
}

// Verify Shopify webhook HMAC signature
async function verifyShopifyWebhook(hmacHeader: string | null, body: string): Promise<boolean> {
  if (!hmacHeader) {
    console.error('[Webhook] Missing HMAC header');
    return false;
  }

  if (!SHOPIFY_WEBHOOK_SECRET) {
    console.error('[Webhook] Missing SHOPIFY_WEBHOOK_SECRET environment variable');
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SHOPIFY_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(body)
    );

    const hashArray = Array.from(new Uint8Array(signature));
    const hashBase64 = btoa(String.fromCharCode(...hashArray));

    const isValid = hashBase64 === hmacHeader;

    if (!isValid) {
      console.error('[Webhook] HMAC verification failed - signatures do not match');
    } else {
      console.log('[Webhook] HMAC verification successful');
    }

    return isValid;
  } catch (error) {
    console.error('[Webhook] HMAC verification error:', error);
    return false;
  }
}

// Shopify Admin API helper
async function shopifyAdminRequest(endpoint: string, method = 'GET', body?: any) {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/${endpoint}`;
  console.log(`[Shopify API] ${method} ${url}`);
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Shopify API] Error: ${response.status} - ${errorText}`);
    throw new Error(`Shopify API error: ${response.status}`);
  }
  
  return response.json();
}

// Get product points value from metafield
async function getProductPointsValue(productId: number): Promise<number> {
  try {
    const data = await shopifyAdminRequest(
      `products/${productId}/metafields.json?namespace=${REWARDS_NAMESPACE}&key=${PRODUCT_POINTS_KEY}`
    );
    
    const metafield = data.metafields?.[0];
    if (metafield && metafield.value) {
      const points = parseInt(metafield.value, 10);
      console.log(`[Points] Product ${productId} has ${points} points`);
      return isNaN(points) ? 0 : points;
    }
    
    console.log(`[Points] Product ${productId} has no points metafield, defaulting to 0`);
    return 0;
  } catch (error) {
    console.error(`[Points] Error getting points for product ${productId}:`, error);
    return 0;
  }
}

// Get customer metafields
async function getCustomerMetafields(customerId: number): Promise<{ balance: number; lifetime: number }> {
  try {
    const data = await shopifyAdminRequest(
      `customers/${customerId}/metafields.json?namespace=${REWARDS_NAMESPACE}`
    );
    
    let balance = 0;
    let lifetime = 0;
    
    for (const metafield of data.metafields || []) {
      if (metafield.key === CUSTOMER_BALANCE_KEY) {
        balance = parseInt(metafield.value, 10) || 0;
      } else if (metafield.key === CUSTOMER_LIFETIME_KEY) {
        lifetime = parseInt(metafield.value, 10) || 0;
      }
    }
    
    console.log(`[Points] Customer ${customerId} current balance: ${balance}, lifetime: ${lifetime}`);
    return { balance, lifetime };
  } catch (error) {
    console.error(`[Points] Error getting customer metafields:`, error);
    return { balance: 0, lifetime: 0 };
  }
}

// Update or create customer metafield
async function setCustomerMetafield(customerId: number, key: string, value: number): Promise<void> {
  try {
    // First, try to find existing metafield
    const existingData = await shopifyAdminRequest(
      `customers/${customerId}/metafields.json?namespace=${REWARDS_NAMESPACE}&key=${key}`
    );
    
    const existingMetafield = existingData.metafields?.[0];
    
    if (existingMetafield) {
      // Update existing
      await shopifyAdminRequest(
        `customers/${customerId}/metafields/${existingMetafield.id}.json`,
        'PUT',
        {
          metafield: {
            id: existingMetafield.id,
            value: value.toString(),
            type: 'number_integer',
          },
        }
      );
      console.log(`[Points] Updated customer ${customerId} ${key} to ${value}`);
    } else {
      // Create new
      await shopifyAdminRequest(
        `customers/${customerId}/metafields.json`,
        'POST',
        {
          metafield: {
            namespace: REWARDS_NAMESPACE,
            key,
            value: value.toString(),
            type: 'number_integer',
          },
        }
      );
      console.log(`[Points] Created customer ${customerId} ${key} with value ${value}`);
    }
  } catch (error) {
    console.error(`[Points] Error setting customer metafield:`, error);
    throw error;
  }
}

// Calculate total points for an order
async function calculateOrderPoints(lineItems: ShopifyLineItem[]): Promise<{ total: number; breakdown: any[] }> {
  const breakdown: any[] = [];
  let total = 0;
  
  for (const item of lineItems) {
    const pointsPerUnit = await getProductPointsValue(item.product_id);
    const itemPoints = pointsPerUnit * item.quantity;
    
    breakdown.push({
      product_id: item.product_id,
      title: item.title,
      quantity: item.quantity,
      points_per_unit: pointsPerUnit,
      total_points: itemPoints,
    });
    
    total += itemPoints;
  }
  
  console.log(`[Points] Order total: ${total} points`);
  return { total, breakdown };
}

// Process order paid event
async function processOrderPaid(order: ShopifyOrder, supabase: any): Promise<{ success: boolean; message: string; points?: number }> {
  const orderId = `order_${order.id}`;
  
  // Check if already processed (idempotency)
  const { data: existing } = await supabase
    .from('points_transactions')
    .select('id')
    .eq('shopify_order_id', orderId)
    .maybeSingle();
  
  if (existing) {
    console.log(`[Points] Order ${order.id} already processed, skipping`);
    return { success: true, message: 'Order already processed' };
  }
  
  if (!order.customer) {
    console.log(`[Points] Order ${order.id} has no customer, skipping`);
    return { success: true, message: 'No customer associated with order' };
  }
  
  const customerId = order.customer.id;
  const customerEmail = order.customer.email;
  
  // Calculate points
  const { total: pointsEarned, breakdown } = await calculateOrderPoints(order.line_items);
  
  if (pointsEarned === 0) {
    console.log(`[Points] Order ${order.id} earned 0 points, skipping customer update`);
    
    // Still log the transaction for audit
    await supabase.from('points_transactions').insert({
      shopify_order_id: orderId,
      shopify_customer_id: customerId.toString(),
      customer_email: customerEmail,
      points_earned: 0,
      points_type: 'order',
      order_details: { order_number: order.order_number, breakdown },
    });
    
    return { success: true, message: 'Order processed with 0 points', points: 0 };
  }
  
  // Get current customer points
  const { balance, lifetime } = await getCustomerMetafields(customerId);
  
  // Update customer metafields
  const newBalance = balance + pointsEarned;
  const newLifetime = lifetime + pointsEarned;
  
  await setCustomerMetafield(customerId, CUSTOMER_BALANCE_KEY, newBalance);
  await setCustomerMetafield(customerId, CUSTOMER_LIFETIME_KEY, newLifetime);
  
  // Log transaction
  await supabase.from('points_transactions').insert({
    shopify_order_id: orderId,
    shopify_customer_id: customerId.toString(),
    customer_email: customerEmail,
    points_earned: pointsEarned,
    points_type: 'order',
    order_details: {
      order_number: order.order_number,
      breakdown,
      previous_balance: balance,
      new_balance: newBalance,
    },
  });
  
  console.log(`[Points] Customer ${customerId} earned ${pointsEarned} points. New balance: ${newBalance}`);
  
  return { success: true, message: `Awarded ${pointsEarned} points`, points: pointsEarned };
}

// Process refund event
async function processRefund(order: ShopifyOrder, supabase: any): Promise<{ success: boolean; message: string; points?: number }> {
  if (!order.customer || !order.refunds || order.refunds.length === 0) {
    return { success: true, message: 'No refund data to process' };
  }
  
  const customerId = order.customer.id;
  
  // Get the original transaction
  const { data: originalTx } = await supabase
    .from('points_transactions')
    .select('*')
    .eq('shopify_order_id', `order_${order.id}`)
    .eq('points_type', 'order')
    .maybeSingle();
  
  if (!originalTx) {
    console.log(`[Points] No original transaction found for order ${order.id}`);
    return { success: true, message: 'No original points transaction found' };
  }
  
  // Check if refund already processed
  const refundId = `refund_${order.id}_${order.refunds[order.refunds.length - 1].id}`;
  const { data: existingRefund } = await supabase
    .from('points_transactions')
    .select('id')
    .eq('shopify_order_id', refundId)
    .maybeSingle();
  
  if (existingRefund) {
    console.log(`[Points] Refund ${refundId} already processed`);
    return { success: true, message: 'Refund already processed' };
  }
  
  // Calculate points to reverse based on refunded items
  const latestRefund = order.refunds[order.refunds.length - 1];
  let pointsToReverse = 0;
  const refundBreakdown: any[] = [];
  
  for (const refundItem of latestRefund.refund_line_items) {
    // Find the original line item
    const originalItem = order.line_items.find(li => li.variant_id === refundItem.line_item_id);
    if (originalItem) {
      const pointsPerUnit = await getProductPointsValue(originalItem.product_id);
      const itemPoints = pointsPerUnit * refundItem.quantity;
      pointsToReverse += itemPoints;
      
      refundBreakdown.push({
        product_id: originalItem.product_id,
        title: originalItem.title,
        quantity: refundItem.quantity,
        points_reversed: itemPoints,
      });
    }
  }
  
  if (pointsToReverse === 0) {
    return { success: true, message: 'No points to reverse' };
  }
  
  // Get current balance and deduct
  const { balance, lifetime } = await getCustomerMetafields(customerId);
  const newBalance = Math.max(0, balance - pointsToReverse); // Don't go negative
  
  await setCustomerMetafield(customerId, CUSTOMER_BALANCE_KEY, newBalance);
  // Note: We don't reduce lifetime_points as it's historical
  
  // Log the refund transaction
  await supabase.from('points_transactions').insert({
    shopify_order_id: refundId,
    shopify_customer_id: customerId.toString(),
    customer_email: order.customer.email,
    points_earned: -pointsToReverse,
    points_type: 'refund',
    order_details: {
      original_order_id: order.id,
      refund_id: latestRefund.id,
      breakdown: refundBreakdown,
      previous_balance: balance,
      new_balance: newBalance,
    },
  });
  
  console.log(`[Points] Reversed ${pointsToReverse} points for refund. New balance: ${newBalance}`);
  
  return { success: true, message: `Reversed ${pointsToReverse} points`, points: -pointsToReverse };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const topic = req.headers.get('x-shopify-topic');
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    console.log(`[Webhook] Received topic: ${topic}`);
    
    if (!topic) {
      return new Response(JSON.stringify({ error: 'Missing webhook topic' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Read the raw body for HMAC verification
    const bodyText = await req.text();
    
    // Verify HMAC signature
    if (!await verifyShopifyWebhook(hmacHeader, bodyText)) {
      console.error('[Webhook] HMAC verification failed - rejecting request');
      return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Parse the verified body
    const order: ShopifyOrder = JSON.parse(bodyText);
    console.log(`[Webhook] Processing order ${order.id}, customer: ${order.customer?.id}`);
    
    // Initialize Supabase client with service role for RLS bypass
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    let result: { success: boolean; message: string; points?: number };
    
    switch (topic) {
      case 'orders/paid':
        result = await processOrderPaid(order, supabase);
        break;
        
      case 'refunds/create':
        result = await processRefund(order, supabase);
        break;
        
      default:
        console.log(`[Webhook] Unhandled topic: ${topic}`);
        result = { success: true, message: `Unhandled topic: ${topic}` };
    }
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    console.error('[Webhook] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
