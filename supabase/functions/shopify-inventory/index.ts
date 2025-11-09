import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
const SHOPIFY_STORE_DOMAIN = Deno.env.get('SHOPIFY_STORE_DOMAIN');
const SHOPIFY_API_VERSION = '2025-01';

interface InventoryUpdateRequest {
  variantId: string;
  inventoryItemId: string;
  locationId: string;
  availableAdjustment: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated and is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = userRoles?.some((r: { role: string }) => r.role === 'admin');

    if (roleError || !hasAdminRole) {
      console.error('Admin check failed:', roleError);
      throw new Error('Unauthorized: Admin access required');
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
      console.log('Shopify response:', JSON.stringify(data, null, 2));

      if (data.errors) {
        throw new Error(`Shopify API error: ${JSON.stringify(data.errors)}`);
      }

      return new Response(JSON.stringify(data.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'updateInventory') {
      const { variantId, inventoryItemId, locationId, availableAdjustment }: InventoryUpdateRequest = await req.json();

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
      console.log('Inventory update response:', JSON.stringify(data, null, 2));

      if (data.errors || data.data?.inventoryAdjustQuantity?.userErrors?.length > 0) {
        throw new Error(`Failed to update inventory: ${JSON.stringify(data.errors || data.data.inventoryAdjustQuantity.userErrors)}`);
      }

      return new Response(JSON.stringify(data.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error in shopify-inventory function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
