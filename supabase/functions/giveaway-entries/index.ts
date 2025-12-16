import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN')!;
const SHOPIFY_STORE_DOMAIN = Deno.env.get('SHOPIFY_STORE_DOMAIN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const REWARDS_NAMESPACE = 'rewards';
const CUSTOMER_BALANCE_KEY = 'points_balance';

interface EntryRequest {
  action: 'get_giveaways' | 'get_customer_entries' | 'enter_giveaway';
  email?: string;
  giveawayId?: string;
  entryCount?: number;
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
    return { authorized: false, error: 'You can only access your own giveaway data' };
  }
  
  return { authorized: true };
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

// Find customer by email
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
    console.error('[Customer] Error searching:', error);
    return null;
  }
}

// Get customer points balance
async function getCustomerPointsBalance(customerId: number): Promise<number> {
  try {
    const data = await shopifyAdminRequest(
      `customers/${customerId}/metafields.json?namespace=${REWARDS_NAMESPACE}&key=${CUSTOMER_BALANCE_KEY}`
    );
    
    const metafield = data.metafields?.[0];
    if (metafield && metafield.value) {
      return parseInt(metafield.value, 10) || 0;
    }
    return 0;
  } catch (error) {
    console.error('[Points] Error getting balance:', error);
    return 0;
  }
}

// Update customer points balance
async function updateCustomerPointsBalance(customerId: number, newBalance: number): Promise<void> {
  try {
    const existingData = await shopifyAdminRequest(
      `customers/${customerId}/metafields.json?namespace=${REWARDS_NAMESPACE}&key=${CUSTOMER_BALANCE_KEY}`
    );
    
    const existingMetafield = existingData.metafields?.[0];
    
    if (existingMetafield) {
      await shopifyAdminRequest(
        `customers/${customerId}/metafields/${existingMetafield.id}.json`,
        'PUT',
        {
          metafield: {
            id: existingMetafield.id,
            value: newBalance.toString(),
            type: 'number_integer',
          },
        }
      );
    } else {
      await shopifyAdminRequest(
        `customers/${customerId}/metafields.json`,
        'POST',
        {
          metafield: {
            namespace: REWARDS_NAMESPACE,
            key: CUSTOMER_BALANCE_KEY,
            value: newBalance.toString(),
            type: 'number_integer',
          },
        }
      );
    }
    
    console.log(`[Points] Updated customer ${customerId} balance to ${newBalance}`);
  } catch (error) {
    console.error('[Points] Error updating balance:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const body: EntryRequest = await req.json();
    const { action, email, giveawayId, entryCount } = body;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    switch (action) {
      case 'get_giveaways': {
        // Get all active giveaways - public endpoint
        // Giveaways without end_date are considered ongoing
        const now = new Date().toISOString();
        const { data: giveaways, error } = await supabase
          .from('giveaways')
          .select('*')
          .eq('is_active', true)
          .lte('start_date', now)
          .or(`end_date.is.null,end_date.gt.${now}`)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // If email provided, verify auth and get customer entries
        let customerEntries: Record<string, number> = {};
        let customerBalance = 0;
        
        if (email) {
          // Verify user auth for email-specific data
          const authResult = await verifyUserAuth(req, email, supabase);
          
          if (!authResult.authorized) {
            return new Response(
              JSON.stringify({ success: false, error: authResult.error }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          const customer = await findCustomerByEmail(email);
          if (customer) {
            customerBalance = await getCustomerPointsBalance(customer.id);
            
            const { data: entries } = await supabase
              .from('giveaway_entries')
              .select('giveaway_id, entry_count')
              .eq('shopify_customer_id', customer.id.toString());
            
            if (entries) {
              entries.forEach((e: any) => {
                customerEntries[e.giveaway_id] = (customerEntries[e.giveaway_id] || 0) + e.entry_count;
              });
            }
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            giveaways,
            customerEntries,
            customerBalance,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'get_customer_entries': {
        if (!email) {
          return new Response(
            JSON.stringify({ success: false, error: 'Email required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Verify user auth - users can only see their own entries
        const authResult = await verifyUserAuth(req, email, supabase);
        
        if (!authResult.authorized) {
          return new Response(
            JSON.stringify({ success: false, error: authResult.error }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const customer = await findCustomerByEmail(email);
        if (!customer) {
          return new Response(
            JSON.stringify({ success: false, error: 'Customer not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data: entries, error } = await supabase
          .from('giveaway_entries')
          .select(`
            *,
            giveaway:giveaways(title, prize_description, end_date)
          `)
          .eq('shopify_customer_id', customer.id.toString())
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const balance = await getCustomerPointsBalance(customer.id);
        
        return new Response(
          JSON.stringify({ success: true, entries, balance }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'enter_giveaway': {
        if (!email || !giveawayId || !entryCount || entryCount < 1) {
          return new Response(
            JSON.stringify({ success: false, error: 'Email, giveaway ID, and entry count required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Validate entry count to prevent abuse
        if (entryCount > 100) {
          return new Response(
            JSON.stringify({ success: false, error: 'Entry count cannot exceed 100 per request' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Verify user auth - users can only enter for themselves
        const authResult = await verifyUserAuth(req, email, supabase);
        
        if (!authResult.authorized) {
          return new Response(
            JSON.stringify({ success: false, error: authResult.error }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Get customer
        const customer = await findCustomerByEmail(email);
        if (!customer) {
          return new Response(
            JSON.stringify({ success: false, error: 'Customer not found. Make sure you have an account with this email.' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Get giveaway details
        const { data: giveaway, error: giveawayError } = await supabase
          .from('giveaways')
          .select('*')
          .eq('id', giveawayId)
          .single();
        
        if (giveawayError || !giveaway) {
          return new Response(
            JSON.stringify({ success: false, error: 'Giveaway not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Validate giveaway is active
        const now = new Date();
        if (!giveaway.is_active) {
          return new Response(
            JSON.stringify({ success: false, error: 'This giveaway is no longer active' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Only check end date if it's set
        if (giveaway.end_date && new Date(giveaway.end_date) < now) {
          return new Response(
            JSON.stringify({ success: false, error: 'This giveaway has ended' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (new Date(giveaway.start_date) > now) {
          return new Response(
            JSON.stringify({ success: false, error: 'This giveaway has not started yet' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Check max entries per customer if set
        if (giveaway.max_entries_per_customer) {
          const { data: existingEntries } = await supabase
            .from('giveaway_entries')
            .select('entry_count')
            .eq('giveaway_id', giveawayId)
            .eq('shopify_customer_id', customer.id.toString());
          
          const currentEntries = existingEntries?.reduce((sum, e) => sum + e.entry_count, 0) || 0;
          
          if (currentEntries + entryCount > giveaway.max_entries_per_customer) {
            const remaining = giveaway.max_entries_per_customer - currentEntries;
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: remaining > 0 
                  ? `You can only add ${remaining} more entries to this giveaway`
                  : 'You have reached the maximum entries for this giveaway'
              }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        // Calculate points needed
        const pointsNeeded = giveaway.points_per_entry * entryCount;
        
        // Get current balance
        const currentBalance = await getCustomerPointsBalance(customer.id);
        
        if (currentBalance < pointsNeeded) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Insufficient points. You need ${pointsNeeded.toLocaleString()} points but have ${currentBalance.toLocaleString()}.`
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Deduct points
        const newBalance = currentBalance - pointsNeeded;
        await updateCustomerPointsBalance(customer.id, newBalance);
        
        // Create entry record
        const { data: entry, error: entryError } = await supabase
          .from('giveaway_entries')
          .insert({
            giveaway_id: giveawayId,
            shopify_customer_id: customer.id.toString(),
            customer_email: email,
            entry_count: entryCount,
            points_spent: pointsNeeded,
          })
          .select()
          .single();
        
        if (entryError) {
          // Refund points on error
          await updateCustomerPointsBalance(customer.id, currentBalance);
          throw entryError;
        }
        
        // Log to points_transactions
        await supabase.from('points_transactions').insert({
          shopify_order_id: `giveaway_${giveawayId}_${entry.id}`,
          shopify_customer_id: customer.id.toString(),
          customer_email: email,
          points_earned: -pointsNeeded,
          points_type: 'giveaway',
          order_details: {
            giveaway_id: giveawayId,
            giveaway_title: giveaway.title,
            entry_count: entryCount,
            entry_id: entry.id,
            previous_balance: currentBalance,
            new_balance: newBalance,
          },
        });
        
        console.log(`[Giveaway] Customer ${customer.id} entered ${giveaway.title} with ${entryCount} entries (${pointsNeeded} points)`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            entry,
            pointsSpent: pointsNeeded,
            newBalance,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    console.error('[Giveaway] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
