import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const REWARDS_NAMESPACE = 'rewards';
const CUSTOMER_BALANCE_KEY = 'points_balance';
const CUSTOMER_LIFETIME_KEY = 'lifetime_points';

interface CustomerRewardsResponse {
  success: boolean;
  customer?: {
    email: string;
    firstName: string;
    lastName: string;
    pointsBalance: number;
    lifetimePoints: number;
  };
  transactions?: Array<{
    id: string;
    orderId: string;
    pointsEarned: number;
    type: string;
    date: string;
    orderDetails: any;
  }>;
  error?: string;
}

// Verify user authentication and email ownership
async function verifyUserAuth(req: Request, requestedEmail: string, supabase: any): Promise<{ authorized: boolean; error?: string }> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return { authorized: false, error: 'Authentication required' };
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    console.error('[Auth] Token verification failed:', userError?.message);
    return { authorized: false, error: 'Invalid or expired token' };
  }
  
  // Verify email ownership - user can only query their own email
  if (user.email?.toLowerCase() !== requestedEmail.toLowerCase()) {
    console.warn(`[Auth] User ${user.email} attempted to access data for ${requestedEmail}`);
    return { authorized: false, error: 'You can only access your own rewards data' };
  }
  
  return { authorized: true };
}

// Shopify Admin API helper
async function shopifyAdminRequest(endpoint: string) {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/${endpoint}`;
  console.log(`[Shopify API] GET ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Shopify API] Error: ${response.status} - ${errorText}`);
    throw new Error(`Shopify API error: ${response.status}`);
  }
  
  return response.json();
}

// Search for customer by email
async function findCustomerByEmail(email: string): Promise<any | null> {
  try {
    const data = await shopifyAdminRequest(
      `customers/search.json?query=email:${encodeURIComponent(email)}`
    );
    
    if (data.customers && data.customers.length > 0) {
      return data.customers[0];
    }
    return null;
  } catch (error) {
    console.error('[Customer] Error searching for customer:', error);
    return null;
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
    
    return { balance, lifetime };
  } catch (error) {
    console.error('[Customer] Error getting metafields:', error);
    return { balance: 0, lifetime: 0 };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { email } = await req.json();
    
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Validate email format and length
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (normalizedEmail.length > 255 || !emailRegex.test(normalizedEmail)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Verify authentication and email ownership
    const authResult = await verifyUserAuth(req, normalizedEmail, supabase);
    
    if (!authResult.authorized) {
      return new Response(
        JSON.stringify({ success: false, error: authResult.error }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[Rewards] Looking up customer: ${normalizedEmail}`);
    
    // Find customer in Shopify
    const customer = await findCustomerByEmail(normalizedEmail);
    
    if (!customer) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No account found with this email. Points are earned when you make a purchase.' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[Rewards] Found customer ${customer.id}: ${customer.first_name} ${customer.last_name}`);
    
    // Get customer points from metafields
    const { balance, lifetime } = await getCustomerMetafields(customer.id);
    
    // Get transaction history from Supabase
    const { data: transactions, error: txError } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('shopify_customer_id', customer.id.toString())
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (txError) {
      console.error('[Rewards] Error fetching transactions:', txError);
    }
    
    const response: CustomerRewardsResponse = {
      success: true,
      customer: {
        email: customer.email,
        firstName: customer.first_name || '',
        lastName: customer.last_name || '',
        pointsBalance: balance,
        lifetimePoints: lifetime,
      },
      transactions: (transactions || []).map((tx: any) => ({
        id: tx.id,
        orderId: tx.shopify_order_id,
        pointsEarned: tx.points_earned,
        type: tx.points_type,
        date: tx.created_at,
        orderDetails: tx.order_details,
      })),
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    console.error('[Rewards] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
