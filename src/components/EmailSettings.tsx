import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, Settings, Shield } from "lucide-react";

const EmailSettings = () => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus("idle");

    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: { test: true },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setConnectionStatus("success");
      toast({
        title: "Connection Successful",
        description: "SMTP server connection verified successfully!",
      });
    } catch (error: any) {
      console.error("Connection test failed:", error);
      setConnectionStatus("error");
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to SMTP server",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Email Settings</h2>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">SMTP Configuration</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your SMTP credentials are securely stored as environment variables and are never exposed in the client code.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-background rounded border border-border">
              <p className="text-xs text-muted-foreground mb-1">SMTP Host</p>
              <p className="font-mono text-sm text-foreground">••••••••••••</p>
            </div>
            <div className="p-3 bg-background rounded border border-border">
              <p className="text-xs text-muted-foreground mb-1">SMTP Port</p>
              <p className="font-mono text-sm text-foreground">587 (TLS)</p>
            </div>
            <div className="p-3 bg-background rounded border border-border">
              <p className="text-xs text-muted-foreground mb-1">SMTP Username</p>
              <p className="font-mono text-sm text-foreground">••••••••••••</p>
            </div>
            <div className="p-3 bg-background rounded border border-border">
              <p className="text-xs text-muted-foreground mb-1">SMTP Password</p>
              <p className="font-mono text-sm text-foreground">••••••••••••</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={testConnection}
            disabled={testing}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              "Test SMTP Connection"
            )}
          </Button>

          {connectionStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          )}

          {connectionStatus === "error" && (
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Connection Failed</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <h4 className="font-medium text-foreground mb-2">How to Update SMTP Settings</h4>
          <p className="text-sm text-muted-foreground">
            To update your SMTP credentials, go to your Lovable Cloud settings and update the following secrets:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
            <li>SMTP_HOST - Your mail server hostname</li>
            <li>SMTP_PORT - Usually 587 for TLS or 465 for SSL</li>
            <li>SMTP_USERNAME - Your email address or username</li>
            <li>SMTP_PASSWORD - Your email password or app password</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default EmailSettings;
