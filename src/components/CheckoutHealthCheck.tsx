import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { createStorefrontCheckout } from "@/lib/shopify";

const EXPECTED_DOMAIN = 'skillstackershop.myshopify.com';

interface HealthCheckResult {
  success: boolean;
  checkoutUrl?: string;
  returnedDomain?: string;
  domainMatches?: boolean;
  error?: string;
  timestamp: string;
}

export const CheckoutHealthCheck = () => {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<HealthCheckResult | null>(null);

  const runHealthCheck = async () => {
    setChecking(true);
    const timestamp = new Date().toISOString();
    
    try {
      // Create a minimal test cart with a mock item
      const testItem = {
        product: {
          node: {
            id: 'test',
            title: 'Health Check Test',
            description: 'Test',
            handle: 'test',
            productType: 'test',
            priceRange: {
              minVariantPrice: {
                amount: '1.00',
                currencyCode: 'USD'
              }
            },
            images: { edges: [] },
            variants: {
              edges: [{
                node: {
                  id: 'gid://shopify/ProductVariant/0',
                  title: 'Test',
                  price: { amount: '1.00', currencyCode: 'USD' },
                  availableForSale: true,
                  selectedOptions: []
                }
              }]
            },
            options: []
          }
        },
        variantId: 'gid://shopify/ProductVariant/0',
        variantTitle: 'Test',
        price: { amount: '1.00', currencyCode: 'USD' },
        quantity: 1,
        selectedOptions: []
      };

      console.log('[Health Check] Starting test cart creation...');
      const checkoutUrl = await createStorefrontCheckout([testItem]);
      console.log('[Health Check] Checkout URL received:', checkoutUrl);
      
      const url = new URL(checkoutUrl);
      const returnedDomain = url.hostname;
      const domainMatches = returnedDomain === EXPECTED_DOMAIN;

      const healthResult: HealthCheckResult = {
        success: true,
        checkoutUrl,
        returnedDomain,
        domainMatches,
        timestamp
      };

      setResult(healthResult);

      if (domainMatches) {
        toast.success('Health check passed', {
          description: `Checkout domain is correct: ${returnedDomain}`,
        });
      } else {
        toast.error('Domain mismatch detected', {
          description: `Expected: ${EXPECTED_DOMAIN}, Got: ${returnedDomain}`,
        });
      }
    } catch (error: any) {
      console.error('[Health Check] Failed:', error);
      const healthResult: HealthCheckResult = {
        success: false,
        error: error.message || 'Unknown error',
        timestamp
      };
      setResult(healthResult);
      
      toast.error('Health check failed', {
        description: error.message || 'Could not create test checkout',
      });
    } finally {
      setChecking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    });
  };

  return (
    <Card className="p-4 border-border/50 bg-card/30">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Checkout Health Check</h3>
          <Button 
            onClick={runHealthCheck} 
            disabled={checking}
            size="sm"
            variant="outline"
          >
            {checking ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Run Test'
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-3 text-xs">
            {result.success ? (
              <>
                <div className="flex items-start gap-2">
                  {result.domainMatches ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {result.domainMatches ? 'Domain Correct ✓' : 'Domain Mismatch ⚠️'}
                    </p>
                    <p className="text-muted-foreground break-all">
                      Expected: <span className="font-mono">{EXPECTED_DOMAIN}</span>
                    </p>
                    <p className="text-muted-foreground break-all">
                      Returned: <span className="font-mono">{result.returnedDomain}</span>
                    </p>
                  </div>
                </div>

                {result.checkoutUrl && (
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium mb-1">Full Checkout URL:</p>
                      <div className="flex items-center gap-2">
                        <p className="text-muted-foreground break-all font-mono text-[10px] flex-1">
                          {result.checkoutUrl}
                        </p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => copyToClipboard(result.checkoutUrl!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-500">Test Failed</p>
                  <p className="text-muted-foreground">{result.error}</p>
                </div>
              </div>
            )}

            <p className="text-muted-foreground">
              Last checked: {new Date(result.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground">
          This creates a test cart to verify checkout URLs use the correct Shopify domain.
        </p>
      </div>
    </Card>
  );
};
