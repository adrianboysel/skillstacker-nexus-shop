import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Star, 
  Save, 
  Loader2, 
  History, 
  Package,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  handle: string;
  image: string | null;
  price: string;
  pointsValue: number;
  calculatedPoints: number;
}

interface ChangeLogEntry {
  id: string;
  shopify_product_id: string;
  product_title: string;
  old_points_value: number;
  new_points_value: number;
  changed_by_email: string;
  created_at: string;
}

const AdminProductPoints = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editedPoints, setEditedPoints] = useState<Record<string, number>>({});
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkPointsValue, setBulkPointsValue] = useState<string>("");
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please log in to access this page");
      navigate("/auth");
      return;
    }

    setCurrentUser(session.user);

    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    const hasAdminRole = userRoles?.some((r) => r.role === "admin") || false;
    setIsAdmin(hasAdminRole);

    if (!hasAdminRole) {
      toast.error("Admin access required");
      navigate("/");
      return;
    }

    // Load products and change log
    await Promise.all([loadProducts(), loadChangeLog()]);
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-product-points", {
        body: { action: "get" },
      });

      if (error) throw error;

      if (data.success) {
        setProducts(data.products);
        // Initialize edited points with current values
        const initialPoints: Record<string, number> = {};
        data.products.forEach((p: Product) => {
          initialPoints[p.id] = p.pointsValue;
        });
        setEditedPoints(initialPoints);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products", {
        description: error?.message ? String(error.message) : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadChangeLog = async () => {
    try {
      const { data, error } = await supabase
        .from("points_change_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setChangeLog(data || []);
    } catch (error) {
      console.error("Error loading change log:", error);
    }
  };

  const handlePointsChange = (productId: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (value === "" || (Number.isInteger(numValue) && numValue >= 0)) {
      setEditedPoints((prev) => ({
        ...prev,
        [productId]: value === "" ? 0 : numValue,
      }));
    }
  };

  const handleSaveProduct = async (product: Product) => {
    const newPoints = editedPoints[product.id];
    if (newPoints === product.pointsValue) {
      toast.info("No changes to save");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-product-points", {
        body: {
          action: "update",
          products: [
            {
              productId: product.id,
              productTitle: product.title,
              pointsValue: newPoints,
            },
          ],
          adminEmail: currentUser?.email,
          adminUserId: currentUser?.id,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Updated ${product.title} to ${newPoints} entries`);
        // Update local state
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, pointsValue: newPoints } : p
          )
        );
        await loadChangeLog();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(`Failed to update ${product.title}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkUpdate = async () => {
    const bulkValue = parseInt(bulkPointsValue, 10);
    if (!Number.isInteger(bulkValue) || bulkValue < 0) {
      toast.error("Please enter a valid non-negative number");
      return;
    }

    if (selectedProducts.size === 0) {
      toast.error("Please select at least one product");
      return;
    }

    setIsSaving(true);
    try {
      const productsToUpdate = products
        .filter((p) => selectedProducts.has(p.id))
        .map((p) => ({
          productId: p.id,
          productTitle: p.title,
          pointsValue: bulkValue,
        }));

      const { data, error } = await supabase.functions.invoke("admin-product-points", {
        body: {
          action: "bulk_update",
          products: productsToUpdate,
          adminEmail: currentUser?.email,
          adminUserId: currentUser?.id,
        },
      });

      if (error) throw error;

      if (data.success) {
        const successCount = data.results.filter((r: any) => r.success).length;
        toast.success(`Updated ${successCount} products to ${bulkValue} entries`);
        
        // Update local state
        setProducts((prev) =>
          prev.map((p) =>
            selectedProducts.has(p.id) ? { ...p, pointsValue: bulkValue } : p
          )
        );
        setEditedPoints((prev) => {
          const updated = { ...prev };
          selectedProducts.forEach((id) => {
            updated[id] = bulkValue;
          });
          return updated;
        });
        setSelectedProducts(new Set());
        setBulkPointsValue("");
        await loadChangeLog();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error bulk updating:", error);
      toast.error("Failed to bulk update products");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecalculateAll = async () => {
    if (!confirm("This will recalculate entries for ALL products based on their current price (100 entries per $1, rounded to nearest 10). Continue?")) {
      return;
    }

    setIsRecalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-product-points", {
        body: { action: "recalculate_all" },
      });

      if (error) throw error;

      if (data.success) {
        const successCount = data.results.filter((r: any) => r.success).length;
        toast.success(`Recalculated entries for ${successCount} products`);
        await Promise.all([loadProducts(), loadChangeLog()]);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error recalculating points:", error);
      toast.error("Failed to recalculate entries");
    } finally {
      setIsRecalculating(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasChanges = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product && editedPoints[productId] !== product.pointsValue;
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/inventory")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Product Entries</h1>
              <p className="text-muted-foreground">
                Manage reward entries for each product (100 entries per $1)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              onClick={handleRecalculateAll}
              disabled={isRecalculating || isLoading}
              className="gap-2"
            >
              {isRecalculating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Star className="h-4 w-4" />
              )}
              Recalculate All
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLog(!showLog)}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              {showLog ? "Hide Log" : "Change Log"}
            </Button>
            <Button
              variant="outline"
              onClick={loadProducts}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Products List */}
          <div className={showLog ? "lg:col-span-2" : "lg:col-span-3"}>
            {/* Bulk Edit Card */}
            <Card className="mb-6 bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Bulk Edit</CardTitle>
                <CardDescription>
                  Select products and set a single entries value for all
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedProducts.size === products.length && products.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                      Select All ({selectedProducts.size}/{products.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Entries value"
                      value={bulkPointsValue}
                      onChange={(e) => setBulkPointsValue(e.target.value)}
                      className="w-32"
                    />
                    <Button
                      onClick={handleBulkUpdate}
                      disabled={isSaving || selectedProducts.size === 0 || !bulkPointsValue}
                      className="gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Apply to Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No products found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className={`bg-card border-border transition-all ${
                      selectedProducts.has(product.id)
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {product.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ${parseFloat(product.price || '0').toFixed(2)} → {product.calculatedPoints.toLocaleString()} entries (auto)
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Current: {product.pointsValue.toLocaleString()} entries
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 flex-1">
                              <Star className="h-4 w-4 text-primary" />
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                value={editedPoints[product.id] ?? product.pointsValue}
                                onChange={(e) =>
                                  handlePointsChange(product.id, e.target.value)
                                }
                                className="h-8 w-20 text-center"
                              />
                              <span className="text-xs text-muted-foreground">
                                entries
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant={hasChanges(product.id) ? "default" : "outline"}
                              onClick={() => handleSaveProduct(product)}
                              disabled={isSaving || !hasChanges(product.id)}
                              className="h-8"
                            >
                              {hasChanges(product.id) ? (
                                <>
                                  <Save className="h-3 w-3 mr-1" />
                                  Save
                                </>
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Change Log Sidebar */}
          {showLog && (
            <div className="lg:col-span-1">
              <Card className="bg-card border-border sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent Changes
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  {changeLog.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No changes recorded yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {changeLog.map((entry, index) => (
                        <div key={entry.id}>
                          {index > 0 && <Separator className="my-3" />}
                          <div className="space-y-1">
                            <p className="text-sm font-medium truncate">
                              {entry.product_title}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="outline" className="font-mono">
                                {entry.old_points_value ?? 0}
                              </Badge>
                              <span className="text-muted-foreground">→</span>
                              <Badge className="bg-primary/20 text-primary font-mono">
                                {entry.new_points_value}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(entry.created_at)} by {entry.changed_by_email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductPoints;
