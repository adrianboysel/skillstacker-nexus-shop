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
const PRODUCT_POINTS_KEY = 'points_value';

interface ProductPointsUpdate {
  productId: string; // Shopify product ID (numeric string or gid)
  productTitle: string;
  pointsValue: number;
}

interface RequestBody {
  action: 'get' | 'update' | 'bulk_update';
  products?: ProductPointsUpdate[];
  productId?: string;
  adminEmail?: string;
  adminUserId?: string;
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

// Extract numeric product ID from various formats
function extractProductId(id: string): string {
  // Handle gid://shopify/Product/123456 format
  if (id.includes('gid://')) {
    const match = id.match(/\/(\d+)$/);
    return match ? match[1] : id;
  }
  return id;
}

// Get product points value from metafield
async function getProductPointsValue(productId: string): Promise<number> {
  try {
    const numericId = extractProductId(productId);
    const data = await shopifyAdminRequest(
      `products/${numericId}/metafields.json?namespace=${REWARDS_NAMESPACE}&key=${PRODUCT_POINTS_KEY}`
    );
    
    const metafield = data.metafields?.[0];
    if (metafield && metafield.value) {
      return parseInt(metafield.value, 10) || 0;
    }
    return 0;
  } catch (error) {
    console.error(`[Points] Error getting points for product ${productId}:`, error);
    return 0;
  }
}

// Get all products with their points values
async function getAllProductsWithPoints(): Promise<any[]> {
  try {
    // Get all products
    const productsData = await shopifyAdminRequest('products.json?limit=250');
    const products = productsData.products || [];
    
    // Get points for each product
    const productsWithPoints = await Promise.all(
      products.map(async (product: any) => {
        const points = await getProductPointsValue(product.id.toString());
        return {
          id: product.id.toString(),
          title: product.title,
          handle: product.handle,
          image: product.images?.[0]?.src || null,
          pointsValue: points,
        };
      })
    );
    
    return productsWithPoints;
  } catch (error) {
    console.error('[Products] Error fetching products:', error);
    throw error;
  }
}

// Update product points value
async function updateProductPoints(
  productId: string, 
  pointsValue: number,
  productTitle: string,
  adminEmail: string,
  adminUserId: string,
  supabase: any
): Promise<{ success: boolean; oldValue: number; newValue: number }> {
  const numericId = extractProductId(productId);
  
  // Validate points value
  if (!Number.isInteger(pointsValue) || pointsValue < 0) {
    throw new Error('Points value must be a non-negative integer');
  }
  
  // Get current value for logging
  const oldValue = await getProductPointsValue(numericId);
  
  // Find existing metafield
  const existingData = await shopifyAdminRequest(
    `products/${numericId}/metafields.json?namespace=${REWARDS_NAMESPACE}&key=${PRODUCT_POINTS_KEY}`
  );
  
  const existingMetafield = existingData.metafields?.[0];
  
  if (existingMetafield) {
    // Update existing
    await shopifyAdminRequest(
      `products/${numericId}/metafields/${existingMetafield.id}.json`,
      'PUT',
      {
        metafield: {
          id: existingMetafield.id,
          value: pointsValue.toString(),
          type: 'number_integer',
        },
      }
    );
  } else {
    // Create new
    await shopifyAdminRequest(
      `products/${numericId}/metafields.json`,
      'POST',
      {
        metafield: {
          namespace: REWARDS_NAMESPACE,
          key: PRODUCT_POINTS_KEY,
          value: pointsValue.toString(),
          type: 'number_integer',
        },
      }
    );
  }
  
  // Log the change
  await supabase.from('points_change_log').insert({
    shopify_product_id: numericId,
    product_title: productTitle,
    old_points_value: oldValue,
    new_points_value: pointsValue,
    changed_by_email: adminEmail,
    changed_by_user_id: adminUserId || null,
  });
  
  console.log(`[Points] Updated product ${numericId} from ${oldValue} to ${pointsValue} points by ${adminEmail}`);
  
  return { success: true, oldValue, newValue: pointsValue };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const body: RequestBody = await req.json();
    const { action, products, productId, adminEmail, adminUserId } = body;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    switch (action) {
      case 'get': {
        // Get all products with points
        const productsWithPoints = await getAllProductsWithPoints();
        return new Response(
          JSON.stringify({ success: true, products: productsWithPoints }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'update': {
        // Single product update
        if (!products || products.length !== 1) {
          return new Response(
            JSON.stringify({ success: false, error: 'Single product required for update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const product = products[0];
        const result = await updateProductPoints(
          product.productId,
          product.pointsValue,
          product.productTitle,
          adminEmail || 'unknown',
          adminUserId || '',
          supabase
        );
        
        return new Response(
          JSON.stringify({ success: true, result }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'bulk_update': {
        // Bulk update multiple products
        if (!products || products.length === 0) {
          return new Response(
            JSON.stringify({ success: false, error: 'Products array required for bulk update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const results = await Promise.all(
          products.map(async (product) => {
            try {
              const result = await updateProductPoints(
                product.productId,
                product.pointsValue,
                product.productTitle,
                adminEmail || 'unknown',
                adminUserId || '',
                supabase
              );
              return { productId: product.productId, ...result };
            } catch (error: any) {
              return { 
                productId: product.productId, 
                success: false, 
                error: error.message 
              };
            }
          })
        );
        
        return new Response(
          JSON.stringify({ success: true, results }),
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
    console.error('[Admin Points] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
