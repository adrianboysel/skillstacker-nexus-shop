import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, Plus, Minus } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdminTopNav } from '@/components/admin/AdminTopNav';

interface ProductVariant {
  id: string;
  title: string;
  price: string;
  inventoryItem: {
    id: string;
    tracked: boolean;
  };
  inventoryQuantity: number;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  status: string;
  featuredImage?: {
    url: string;
  };
  variants: {
    edges: Array<{
      node: ProductVariant;
    }>;
  };
}

export default function AdminInventory() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [locationId, setLocationId] = useState<string>('');
  const [updatingVariants, setUpdatingVariants] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkAdminAndLoadProducts();
  }, []);

  const checkAdminAndLoadProducts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Check if user is admin
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      const hasAdminRole = userRoles?.some(r => r.role === 'admin');

      if (roleError || !hasAdminRole) {
        toast.error('Unauthorized: Admin access required');
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await loadProducts();
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      toast.error('Failed to verify admin access');
      navigate('/');
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('shopify-inventory', {
        body: { action: 'getProducts' },
      });

      if (error) throw error;

      console.log('Products data:', data);
      
      if (data.locations?.edges?.length > 0) {
        setLocationId(data.locations.edges[0].node.id);
      }
      
      if (data.products?.edges) {
        setProducts(data.products.edges.map((edge: any) => edge.node));
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const updateInventory = async (variant: ProductVariant, adjustment: number) => {
    const variantId = variant.id;
    setUpdatingVariants(prev => new Set(prev).add(variantId));

    try {
      const { data, error } = await supabase.functions.invoke('shopify-inventory', {
        body: {
          action: 'updateInventory',
          variantId,
          inventoryItemId: variant.inventoryItem.id,
          locationId,
          availableAdjustment: adjustment,
        },
      });

      if (error) throw error;

      toast.success(`Inventory updated: ${adjustment > 0 ? '+' : ''}${adjustment}`);
      await loadProducts(); // Reload to get updated quantities
    } catch (error: any) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
    } finally {
      setUpdatingVariants(prev => {
        const newSet = new Set(prev);
        newSet.delete(variantId);
        return newSet;
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-32">
        <div className="mb-8 flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground mt-2">Manage your product stock levels</p>
          </div>
          <AdminTopNav onLogout={handleLogout} />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No products found</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) =>
                    product.variants.edges.map((variantEdge, idx) => {
                      const variant = variantEdge.node;
                      const isUpdating = updatingVariants.has(variant.id);
                      const isLowStock = variant.inventoryQuantity < 5;
                      
                      return (
                        <TableRow key={variant.id}>
                          {idx === 0 && (
                            <TableCell rowSpan={product.variants.edges.length}>
                              <div className="flex items-center gap-3">
                                {product.featuredImage && (
                                  <img
                                    src={product.featuredImage.url}
                                    alt={product.title}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{product.title}</div>
                                  <div className="text-sm text-muted-foreground">{product.handle}</div>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          <TableCell>{variant.title}</TableCell>
                          <TableCell>${parseFloat(variant.price).toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={isLowStock ? 'text-destructive font-semibold' : ''}>
                                {variant.inventoryQuantity}
                              </span>
                              {isLowStock && <AlertTriangle className="h-4 w-4 text-destructive" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateInventory(variant, -1)}
                                disabled={isUpdating || variant.inventoryQuantity <= 0}
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Minus className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateInventory(variant, 1)}
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
