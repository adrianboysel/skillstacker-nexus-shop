import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Plus,
  Save, 
  Loader2, 
  Gift,
  RefreshCw,
  Calendar,
  Users,
  Star,
  Eye,
  Edit,
  Trash2,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminTopNav } from "@/components/admin/AdminTopNav";

interface Giveaway {
  id: string;
  title: string;
  description: string | null;
  prize_description: string | null;
  points_per_entry: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  max_entries_per_customer: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface GiveawayEntry {
  id: string;
  giveaway_id: string;
  shopify_customer_id: string;
  customer_email: string;
  entry_count: number;
  points_spent: number;
  created_at: string;
}

interface GiveawayFormData {
  title: string;
  description: string;
  prize_description: string;
  points_per_entry: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  max_entries_per_customer: number | null;
  image_url: string;
}

const emptyFormData: GiveawayFormData = {
  title: "",
  description: "",
  prize_description: "",
  points_per_entry: 100,
  start_date: new Date().toISOString().slice(0, 16),
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  is_active: true,
  max_entries_per_customer: null,
  image_url: "",
};

const AdminGiveaways = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEntriesDialog, setShowEntriesDialog] = useState(false);
  const [editingGiveaway, setEditingGiveaway] = useState<Giveaway | null>(null);
  const [viewingEntries, setViewingEntries] = useState<Giveaway | null>(null);
  const [entries, setEntries] = useState<GiveawayEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Giveaway | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<GiveawayFormData>(emptyFormData);

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

    await loadGiveaways();
  };

  const loadGiveaways = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("giveaways")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGiveaways(data || []);
    } catch (error: any) {
      console.error("Error loading giveaways:", error);
      toast.error("Failed to load giveaways");
    } finally {
      setIsLoading(false);
    }
  };

  const loadEntries = async (giveawayId: string) => {
    setLoadingEntries(true);
    try {
      const { data, error } = await supabase
        .from("giveaway_entries")
        .select("*")
        .eq("giveaway_id", giveawayId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      console.error("Error loading entries:", error);
      toast.error("Failed to load entries");
    } finally {
      setLoadingEntries(false);
    }
  };

  const getGiveawayStatus = (giveaway: Giveaway) => {
    const now = new Date();
    const start = new Date(giveaway.start_date);
    const end = new Date(giveaway.end_date);

    if (!giveaway.is_active) {
      return { label: "Inactive", variant: "secondary" as const };
    }
    if (now < start) {
      return { label: "Scheduled", variant: "outline" as const };
    }
    if (now > end) {
      return { label: "Ended", variant: "destructive" as const };
    }
    return { label: "Active", variant: "default" as const };
  };

  const handleOpenCreate = () => {
    setFormData(emptyFormData);
    setEditingGiveaway(null);
    setShowCreateDialog(true);
  };

  const handleOpenEdit = (giveaway: Giveaway) => {
    const status = getGiveawayStatus(giveaway);
    if (status.label === "Ended") {
      toast.error("Cannot edit ended giveaways");
      return;
    }
    
    setFormData({
      title: giveaway.title,
      description: giveaway.description || "",
      prize_description: giveaway.prize_description || "",
      points_per_entry: giveaway.points_per_entry,
      start_date: new Date(giveaway.start_date).toISOString().slice(0, 16),
      end_date: new Date(giveaway.end_date).toISOString().slice(0, 16),
      is_active: giveaway.is_active,
      max_entries_per_customer: giveaway.max_entries_per_customer,
      image_url: giveaway.image_url || "",
    });
    setEditingGiveaway(giveaway);
    setShowCreateDialog(true);
  };

  const handleViewEntries = async (giveaway: Giveaway) => {
    setViewingEntries(giveaway);
    setShowEntriesDialog(true);
    await loadEntries(giveaway.id);
  };

  const handleToggleActive = async (giveaway: Giveaway) => {
    try {
      const { error } = await supabase
        .from("giveaways")
        .update({ is_active: !giveaway.is_active })
        .eq("id", giveaway.id);

      if (error) throw error;
      
      toast.success(`Giveaway ${!giveaway.is_active ? "activated" : "deactivated"}`);
      await loadGiveaways();
    } catch (error: any) {
      console.error("Error toggling giveaway:", error);
      toast.error("Failed to update giveaway");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      // Check if there are entries
      const { count } = await supabase
        .from("giveaway_entries")
        .select("*", { count: "exact", head: true })
        .eq("giveaway_id", deleteConfirm.id);

      if (count && count > 0) {
        toast.error("Cannot delete giveaway with existing entries");
        setDeleteConfirm(null);
        return;
      }

      const { error } = await supabase
        .from("giveaways")
        .delete()
        .eq("id", deleteConfirm.id);

      if (error) throw error;
      
      toast.success("Giveaway deleted");
      setDeleteConfirm(null);
      await loadGiveaways();
    } catch (error: any) {
      console.error("Error deleting giveaway:", error);
      toast.error("Failed to delete giveaway");
    }
  };

  const handleSaveGiveaway = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (formData.points_per_entry < 1) {
      toast.error("Points per entry must be at least 1");
      return;
    }
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsSaving(true);
    try {
      const giveawayData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        prize_description: formData.prize_description.trim() || null,
        points_per_entry: formData.points_per_entry,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        is_active: formData.is_active,
        max_entries_per_customer: formData.max_entries_per_customer || null,
        image_url: formData.image_url.trim() || null,
      };

      if (editingGiveaway) {
        const { error } = await supabase
          .from("giveaways")
          .update(giveawayData)
          .eq("id", editingGiveaway.id);
        
        if (error) throw error;
        toast.success("Giveaway updated");
      } else {
        const { error } = await supabase
          .from("giveaways")
          .insert(giveawayData);
        
        if (error) throw error;
        toast.success("Giveaway created");
      }

      setShowCreateDialog(false);
      setEditingGiveaway(null);
      await loadGiveaways();
    } catch (error: any) {
      console.error("Error saving giveaway:", error);
      toast.error("Failed to save giveaway");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalEntries = (giveawayId: string) => {
    // We'll need to fetch this - for now show a view button
    return null;
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <AdminTopNav onLogout={handleLogout} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Giveaway Management</h1>
            <p className="text-muted-foreground">Create and manage giveaways</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadGiveaways} disabled={isLoading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              New Giveaway
            </Button>
          </div>
        </div>

        {/* Giveaways List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : giveaways.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No giveaways created yet</p>
              <Button onClick={handleOpenCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Giveaway
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {giveaways.map((giveaway) => {
              const status = getGiveawayStatus(giveaway);
              const isEnded = status.label === "Ended";
              
              return (
                <Card key={giveaway.id} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{giveaway.title}</h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        {giveaway.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {giveaway.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {giveaway.points_per_entry} pts/entry
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(giveaway.start_date)} - {formatDate(giveaway.end_date)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEntries(giveaway)}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View Entries
                        </Button>
                        {!isEnded && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(giveaway)}
                              className="gap-1"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant={giveaway.is_active ? "secondary" : "default"}
                              size="sm"
                              onClick={() => handleToggleActive(giveaway)}
                            >
                              {giveaway.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(giveaway)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingGiveaway ? "Edit Giveaway" : "Create Giveaway"}
            </DialogTitle>
            <DialogDescription>
              {editingGiveaway 
                ? "Update giveaway details. Changes only affect future entries."
                : "Set up a new giveaway for customers to enter with points."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Holiday Giveaway 2025"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter to win amazing prizes..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prize">Prize Description</Label>
              <Textarea
                id="prize"
                value={formData.prize_description}
                onChange={(e) => setFormData({ ...formData, prize_description: e.target.value })}
                placeholder="$500 store credit, exclusive merch bundle..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points">Points per Entry *</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={formData.points_per_entry}
                  onChange={(e) => setFormData({ ...formData, points_per_entry: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_entries">Max Entries per Customer</Label>
                <Input
                  id="max_entries"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={formData.max_entries_per_customer || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    max_entries_per_customer: e.target.value ? parseInt(e.target.value) : null 
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGiveaway} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editingGiveaway ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Entries Dialog */}
      <Dialog open={showEntriesDialog} onOpenChange={setShowEntriesDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Entries for {viewingEntries?.title}
            </DialogTitle>
            <DialogDescription>
              Read-only view of all customer entries
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[50vh]">
            {loadingEntries ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No entries yet
              </div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                  <span className="font-medium">Total Entries</span>
                  <span className="text-lg font-bold">
                    {entries.reduce((sum, e) => sum + e.entry_count, 0)}
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Entries</TableHead>
                      <TableHead className="text-right">Points Spent</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {entry.customer_email}
                        </TableCell>
                        <TableCell className="text-right">{entry.entry_count}</TableCell>
                        <TableCell className="text-right">{entry.points_spent}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatDate(entry.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Giveaway?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Giveaways with existing entries cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGiveaways;
