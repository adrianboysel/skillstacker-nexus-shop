import { toast } from 'sonner';
import type { CartItem } from '@/stores/cartStore';

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'skillstacker-nexus-shop-4jh39.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = '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';

export async function storefrontApiRequest(query: string, variables: any = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description: "Shopify API access requires an active Shopify billing plan. Visit https://admin.shopify.com to upgrade.",
    });
    throw new Error('Payment required');
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('[Shopify] Storefront API error response:', response.status, text);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    console.error('[Shopify] GraphQL errors:', data.errors);
    throw new Error(`Error calling Shopify: ${data.errors.map((e: any) => e.message).join(', ')}`);
  }

  return data;
}

export const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
          rewardPoints: metafield(namespace: "rewards", key: "points_value") {
            value
            type
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createStorefrontCheckout(items: CartItem[]): Promise<string> {
  try {
    const lines = items.map(item => ({
      quantity: item.quantity,
      merchandiseId: item.variantId,
    }));

    const cartData = await storefrontApiRequest(CART_CREATE_MUTATION, {
      input: {
        lines,
      },
    });

    if (cartData.data.cartCreate.userErrors.length > 0) {
      throw new Error(`Cart creation failed: ${cartData.data.cartCreate.userErrors.map((e: any) => e.message).join(', ')}`);
    }

    const cart = cartData.data.cartCreate.cart;
    
    if (!cart.checkoutUrl) {
      throw new Error('No checkout URL returned from Shopify');
    }

    const url = new URL(cart.checkoutUrl);
    // Use checkout URL as returned by Shopify; ensure required params
    url.searchParams.set('channel', 'online_store');

    // If Shopify returned a custom domain that causes 404s, force permanent domain
    if (url.hostname !== SHOPIFY_STORE_PERMANENT_DOMAIN) {
      console.warn('[Shopify] Rewriting checkout hostname to permanent domain:', SHOPIFY_STORE_PERMANENT_DOMAIN);
      url.hostname = SHOPIFY_STORE_PERMANENT_DOMAIN;
    }

    // Log the exact URL we will open for easier debugging
    const finalUrl = url.toString();
    console.log('[Shopify] Checkout URL generated:', finalUrl);
    return finalUrl;
  } catch (error) {
    console.error('Error creating storefront checkout:', error);
    // Surface a toast for visibility
    toast.error('Could not create checkout', {
      description: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
