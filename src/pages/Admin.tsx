import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ChatInterface from "@/components/ChatInterface";
import DocumentUpload from "@/components/DocumentUpload";
import StatsCard from "@/components/StatsCard";
import EmailComposer from "@/components/EmailComposer";
import EmailSettings from "@/components/EmailSettings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, Search, Filter, LayoutDashboard, FileText, MessageSquare, Users, Settings, Eye, Upload, Mail, StickyNote } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Application {
  id: string;
  tracking_id: string;
  full_name: string;
  institution_name: string;
  document_type: string;
  phone: string;
  email: string;
  status: string;
  payment_confirmed: boolean;
  created_at: string;
  updated_at: string;
  notes: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customerUsers, setCustomerUsers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    contact_email: "",
    website_url: "",
    location: "",
    footer_text: "",
  });
  const [pageViews, setPageViews] = useState(0);
  const [todayViews, setTodayViews] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchCustomerUsers();
      fetchSettings();
      fetchPageViews();
      fetchUnreadCounts();
      subscribeToRealtime();
    }
  }, [user]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: isAdmin, error: roleErr } = await supabase.rpc('has_role', {
          user_id: session.user.id,
          check_role: 'admin'
        });

        if (roleErr || !isAdmin) {
          navigate("/");
        } else {
          setUser(session.user);
        }
      } else {
        navigate("/auth");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    }
  };

  const fetchPageViews = async () => {
    try {
      const { count: totalCount } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: todayCount } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      setPageViews(totalCount || 0);
      setTodayViews(todayCount || 0);
    } catch (error) {
      console.error("Error fetching page views:", error);
    }
  };

  const fetchUnreadCounts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((msg) => {
        counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
      });
      setUnreadCounts(counts);
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  };

  const subscribeToRealtime = () => {
    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "applications" },
        () => {
          fetchApplications();
          toast({
            title: "New Application",
            description: "A new application has been submitted",
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "page_views" },
        () => {
          fetchPageViews();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new.receiver_id === user?.id) {
            fetchUnreadCounts();
            toast({
              title: "New Message",
              description: "You have a new message from a customer",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setSettings({
          contact_email: data.contact_email || '',
          website_url: data.website_url || '',
          location: data.location || '',
          footer_text: data.footer_text || '',
        });
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  const fetchCustomerUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const adminIds = adminRoles?.map((r) => r.user_id) || [];
      const customers = profiles?.filter((p) => !adminIds.includes(p.user_id)) || [];

      setCustomerUsers(customers);
    } catch (error) {
      console.error("Error fetching customer users:", error);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.phone.includes(searchTerm) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus as any })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully",
      });

      fetchApplications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      received: "secondary",
      under_verification: "default",
      processing_at_institution: "default",
      ready: "outline",
      completed: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Admin <span className="bg-gradient-primary bg-clip-text text-transparent">Dashboard</span>
              </h1>
              <p className="text-muted-foreground">Manage applications and customer support</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="applications" className="gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Applications</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2 relative">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
                {Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger value="email-settings" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Email Settings</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Site Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatsCard
                  title="Total Applications"
                  value={applications.length}
                  icon={FileText}
                />
                <StatsCard
                  title="Pending"
                  value={applications.filter((a) => a.status === "received" || a.status === "under_verification").length}
                  icon={Filter}
                />
                <StatsCard
                  title="Processing"
                  value={applications.filter((a) => a.status === "processing_at_institution").length}
                  icon={Loader2}
                />
                <StatsCard
                  title="Completed"
                  value={applications.filter((a) => a.status === "completed").length}
                  icon={FileText}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatsCard
                  title="Total Page Views"
                  value={pageViews}
                  icon={Eye}
                  description="All time"
                />
                <StatsCard
                  title="Today's Views"
                  value={todayViews}
                  icon={Eye}
                  description="Real-time tracking"
                />
              </div>
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications">
              <Card className="p-6 mb-6 bg-card border-border">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search" className="sr-only">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by tracking ID, name, phone, or email..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-64">
                    <Label htmlFor="status-filter" className="sr-only">Filter by Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status-filter">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="under_verification">Under Verification</SelectItem>
                        <SelectItem value="processing_at_institution">Processing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Applications Table */}
              <Card className="shadow-card bg-card border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                        <TableHead>Upload</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                            No applications found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApplications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-mono font-semibold text-primary">{app.tracking_id}</TableCell>
                            <TableCell>{app.full_name}</TableCell>
                            <TableCell>{app.institution_name}</TableCell>
                            <TableCell className="capitalize">{app.document_type.replace(/_/g, " ")}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{app.phone}</div>
                                <div className="text-muted-foreground">{app.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {app.notes ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <button className="max-w-[200px] text-left hover:bg-muted p-2 rounded-md transition-colors cursor-pointer">
                                      <div className="flex items-center gap-1 text-primary mb-1">
                                        <StickyNote className="w-3 h-3" />
                                        <span className="text-xs font-medium">View Notes</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground truncate">
                                        {app.notes}
                                      </p>
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <StickyNote className="w-5 h-5 text-primary" />
                                        Notes for {app.tracking_id}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="mt-4">
                                      <p className="text-sm text-foreground whitespace-pre-wrap">
                                        {app.notes}
                                      </p>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell className="text-sm">
                              {new Date(app.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={app.status}
                                onValueChange={(value) => updateStatus(app.id, value)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="received">Received</SelectItem>
                                  <SelectItem value="under_verification">Under Verification</SelectItem>
                                  <SelectItem value="processing_at_institution">Processing</SelectItem>
                                  <SelectItem value="ready">Ready</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {app.status === "completed" && (
                                <DocumentUpload
                                  applicationId={app.id}
                                  userId={app.email}
                                  onUploadComplete={fetchApplications}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer List */}
                <Card className="p-4 bg-card border-border lg:col-span-1">
                  <h3 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Customers
                  </h3>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {customerUsers.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        No customers yet
                      </p>
                    ) : (
                      customerUsers.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => {
                            setSelectedCustomer(customer.user_id);
                            // Clear unread count for this customer
                            setUnreadCounts(prev => ({ ...prev, [customer.user_id]: 0 }));
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-all relative ${
                            selectedCustomer === customer.user_id
                              ? "bg-primary-light/30 border-2 border-primary"
                              : "bg-muted hover:bg-muted/80 border border-border"
                          }`}
                        >
                          <p className="font-medium text-foreground">
                            {customer.full_name || "Unknown User"}
                          </p>
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                          {unreadCounts[customer.user_id] > 0 && (
                            <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {unreadCounts[customer.user_id]}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </Card>

                {/* Chat Interface */}
                <div className="lg:col-span-2">
                  {selectedCustomer ? (
                    <ChatInterface
                      currentUserId={user.id}
                      otherUserId={selectedCustomer}
                      otherUserName={
                        customerUsers.find((c) => c.user_id === selectedCustomer)?.full_name ||
                        "Customer"
                      }
                    />
                  ) : (
                    <Card className="p-12 bg-card border-border flex items-center justify-center h-[600px]">
                      <div className="text-center">
                        <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          Select a Customer
                        </h3>
                        <p className="text-muted-foreground">
                          Choose a customer from the list to start chatting
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email">
              <div className="max-w-2xl">
                <EmailComposer />
              </div>
            </TabsContent>

            {/* Email Settings Tab */}
            <TabsContent value="email-settings">
              <div className="max-w-2xl">
                <EmailSettings />
              </div>
            </TabsContent>

            {/* Site Settings Tab */}
            <TabsContent value="settings">
              <Card className="p-6 bg-card border-border max-w-3xl">
                <h2 className="text-2xl font-bold text-foreground mb-6">Site Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                      placeholder="info@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      value={settings.website_url}
                      onChange={(e) => setSettings({ ...settings, website_url: e.target.value })}
                      placeholder="https://yourdomain.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={settings.location}
                      onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="footer_text">Footer Text</Label>
                    <Textarea
                      id="footer_text"
                      value={settings.footer_text}
                      onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                      placeholder="Short tagline for the footer"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={async () => {
                      const { error } = await supabase
                        .from('site_settings')
                        .upsert({ id: 'default', ...settings });
                      if (error) {
                        toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
                      } else {
                        toast({ title: 'Saved', description: 'Settings updated successfully' });
                      }
                    }}
                  >
                    Save Settings
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Admin;
