import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function normalizeShopifyDomain(raw?: string | null): string | null {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return null;

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

const SHOPIFY_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN');

// Normalize and force permanent *.myshopify.com domain for Admin API calls.
const SHOPIFY_STORE_DOMAIN_FALLBACK = 'skillstacker-nexus-shop-4jh39.myshopify.com';
const SHOPIFY_STORE_DOMAIN_RAW = Deno.env.get('SHOPIFY_STORE_DOMAIN');
const SHOPIFY_STORE_DOMAIN_NORMALIZED = normalizeShopifyDomain(SHOPIFY_STORE_DOMAIN_RAW);
const SHOPIFY_STORE_DOMAIN =
  SHOPIFY_STORE_DOMAIN_NORMALIZED && SHOPIFY_STORE_DOMAIN_NORMALIZED.endsWith('.myshopify.com')
    ? SHOPIFY_STORE_DOMAIN_NORMALIZED
    : SHOPIFY_STORE_DOMAIN_FALLBACK;

const SHOPIFY_API_VERSION = '2025-01';

interface InventoryUpdateRequest {
  variantId: string;
  inventoryItemId: string;
  locationId: string;
  availableAdjustment: number;
}

// Validation schema for inventory updates
const inventoryUpdateSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required').max(100, 'Variant ID too long'),
  inventoryItemId: z.string().min(1, 'Inventory Item ID is required').max(100, 'Inventory Item ID too long'),
  locationId: z.string().min(1, 'Location ID is required').max(100, 'Location ID too long'),
  availableAdjustment: z.number().int('Adjustment must be an integer').min(-1000, 'Adjustment too low').max(1000, 'Adjustment too high')
});

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated and is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Check if user is admin
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = userRoles?.some((r: { role: string }) => r.role === 'admin');

    if (roleError || !hasAdminRole) {
      console.error('Admin check failed');
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const { action } = await req.json();

    if (action === 'getProducts') {
      // Fetch products with inventory information
      const query = `
        query GetProductsWithInventory {
          products(first: 100) {
            edges {
              node {
                id
                title
                handle
                status
                featuredImage {
                  url
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price
                      inventoryItem {
                        id
                        tracked
                      }
                      inventoryQuantity
                    }
                  }
                }
              }
            }
          }
          locations(first: 1) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      `;

      console.log('Fetching products from Shopify Admin API...');
      const response = await fetch(
        `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN!,
          },
          body: JSON.stringify({ query }),
        }
      );

      const data = await response.json();
      console.log('Shopify products fetched successfully');

      if (data.errors) {
        console.error('Shopify API returned errors');
        return new Response(
          JSON.stringify({ error: 'Failed to fetch products' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      return new Response(JSON.stringify(data.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'updateInventory') {
      const requestData = await req.json();
      
      // Validate input parameters
      const validationResult = inventoryUpdateSchema.safeParse(requestData);
      if (!validationResult.success) {
        console.error('Invalid inventory update parameters');
        return new Response(
          JSON.stringify({ error: 'Invalid parameters provided' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      const { variantId, inventoryItemId, locationId, availableAdjustment } = validationResult.data;

      console.log('Updating inventory:', { variantId, inventoryItemId, locationId, availableAdjustment });

      const mutation = `
        mutation AdjustInventory($inventoryItemId: ID!, $locationId: ID!, $availableAdjustment: Int!) {
          inventoryAdjustQuantity(
            input: {
              inventoryLevelId: "gid://shopify/InventoryLevel/${inventoryItemId}?inventory_item_id=${inventoryItemId}"
              availableDelta: $availableAdjustment
            }
          ) {
            inventoryLevel {
              id
              available
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const response = await fetch(
        `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN!,
          },
          body: JSON.stringify({
            query: mutation,
            variables: {
              inventoryItemId,
              locationId,
              availableAdjustment,
            },
          }),
        }
      );

      const data = await response.json();
      console.log('Shopify inventory updated successfully');

      if (data.errors || data.data?.inventoryAdjustQuantity?.userErrors?.length > 0) {
        console.error('Shopify API returned errors for inventory update');
        return new Response(
          JSON.stringify({ error: 'Failed to update inventory' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      return new Response(JSON.stringify(data.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.error('Invalid action requested');
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error in shopify-inventory function:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'Operation failed' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
