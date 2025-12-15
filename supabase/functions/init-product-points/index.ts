import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_ACCESS_TOKEN = Deno.env.get('SHOPIFY_ACCESS_TOKEN')!;
const SHOPIFY_STORE_DOMAIN = Deno.env.get('SHOPIFY_STORE_DOMAIN')!;

const REWARDS_NAMESPACE = 'rewards';
const PRODUCT_POINTS_KEY = 'points_value';

// Calculate points from price: 100 points per $1, rounded to nearest 10
function calculatePointsFromPrice(priceAmount: string): number {
  const price = parseFloat(priceAmount);
  if (isNaN(price) || price <= 0) return 0;
  const rawPoints = Math.round(price * 100);
  // Round to nearest 10
  return Math.round(rawPoints / 10) * 10;
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
async function getProductPointsValue(productId: string): Promise<number> {
  try {
    const data = await shopifyAdminRequest(
      `products/${productId}/metafields.json?namespace=${REWARDS_NAMESPACE}&key=${PRODUCT_POINTS_KEY}`
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

// Update product points value
async function updateProductPoints(productId: string, pointsValue: number): Promise<boolean> {
  try {
    const existingData = await shopifyAdminRequest(
      `products/${productId}/metafields.json?namespace=${REWARDS_NAMESPACE}&key=${PRODUCT_POINTS_KEY}`
    );
    
    const existingMetafield = existingData.metafields?.[0];
    
    if (existingMetafield) {
      await shopifyAdminRequest(
        `products/${productId}/metafields/${existingMetafield.id}.json`,
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
      await shopifyAdminRequest(
        `products/${productId}/metafields.json`,
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
    
    console.log(`[Points] Updated product ${productId} to ${pointsValue} points`);
    return true;
  } catch (error) {
    console.error(`[Points] Error updating product ${productId}:`, error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('[Init Points] Starting product points initialization...');
    
    // Get all products
    const productsData = await shopifyAdminRequest('products.json?limit=250');
    const products = productsData.products || [];
    
    console.log(`[Init Points] Found ${products.length} products`);
    
    const results = [];
    
    for (const product of products) {
      const price = product.variants?.[0]?.price || '0';
      const calculatedPoints = calculatePointsFromPrice(price);
      const currentPoints = await getProductPointsValue(product.id.toString());
      
      const updated = await updateProductPoints(product.id.toString(), calculatedPoints);
      
      results.push({
        id: product.id.toString(),
        title: product.title,
        price: price,
        oldPoints: currentPoints,
        newPoints: calculatedPoints,
        success: updated,
      });
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`[Init Points] Completed: ${successCount}/${results.length} products updated`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated ${successCount} products`,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('[Init Points] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});