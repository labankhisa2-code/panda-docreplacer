import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, CheckCircle, Clock, AlertCircle, Package } from "lucide-react";

interface Application {
  id: string;
  tracking_id: string;
  full_name: string;
  institution_name: string;
  document_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Tracking = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trackingInput, setTrackingInput] = useState(searchParams.get("id") || "");
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      handleTrack(id);
    }
  }, [searchParams]);

  const handleTrack = async (trackingId?: string) => {
    const id = trackingId || trackingInput;
    if (!id) {
      toast({
        title: "Error",
        description: "Please enter a tracking ID or phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .or(`tracking_id.eq.${id},phone.eq.${id}`)
        .single();

      if (error || !data) {
        toast({
          title: "Not Found",
          description: "No application found with that tracking ID or phone number",
          variant: "destructive",
        });
        setApplication(null);
      } else {
        setApplication(data);
      }
    } catch (error) {
      console.error("Error tracking application:", error);
      toast({
        title: "Error",
        description: "Failed to track application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <AlertCircle className="w-5 h-5 text-accent" />;
      case "under_verification":
        return <Search className="w-5 h-5 text-primary" />;
      case "processing_at_institution":
        return <Clock className="w-5 h-5 text-primary-glow" />;
      case "ready":
        return <Package className="w-5 h-5 text-accent" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const statuses = [
    { value: "received", label: "Received" },
    { value: "under_verification", label: "Under Verification" },
    { value: "processing_at_institution", label: "Processing at Institution" },
    { value: "ready", label: "Ready" },
    { value: "completed", label: "Completed/Delivered" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Track Your <span className="bg-gradient-primary bg-clip-text text-transparent">Application</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Enter your tracking ID or phone number to check the status of your document replacement request.
              </p>
            </div>

            <Card className="p-6 md:p-8 shadow-card bg-card border-border mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="tracking">Tracking ID or Phone Number</Label>
                  <Input
                    id="tracking"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="e.g., PT123456 or 0712345678"
                    onKeyPress={(e) => e.key === "Enter" && handleTrack()}
                  />
                </div>
                <Button
                  onClick={() => handleTrack()}
                  disabled={loading}
                  className="bg-gradient-primary hover:opacity-90 mt-6 md:mt-6 text-primary-foreground"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Track
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {application && (
              <Card className="p-6 md:p-8 shadow-card bg-card border-border">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{application.full_name}</h2>
                      <p className="text-muted-foreground">{application.institution_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Tracking ID</p>
                      <p className="font-mono font-bold text-primary text-lg">{application.tracking_id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Document Type</p>
                      <p className="font-medium text-foreground">{getStatusLabel(application.document_type)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted On</p>
                      <p className="font-medium text-foreground">
                        {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-4">Application Status</h3>
                    <div className="space-y-3">
                      {statuses.map((status, idx) => {
                        const isActive = application.status === status.value;
                        const isPast = statuses.findIndex((s) => s.value === application.status) > idx;
                        return (
                          <div
                            key={status.value}
                            className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                              isActive
                                ? "bg-primary-light/30 border-2 border-primary"
                                : isPast
                                ? "bg-green-50 border border-green-200"
                                : "bg-muted/30 border border-border"
                            }`}
                          >
                            {getStatusIcon(status.value)}
                            <div className="flex-1">
                              <p className={`font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                                {status.label}
                              </p>
                            </div>
                            {isPast && <CheckCircle className="w-5 h-5 text-green-600" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-accent-light/20 border border-accent/20 rounded-lg p-4 mt-6">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Last Updated:</strong>{" "}
                      {new Date(application.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Tracking;
