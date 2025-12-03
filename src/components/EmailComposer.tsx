import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, Mail } from "lucide-react";

const EmailComposer = () => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    message: "",
  });

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.to || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: formData.to,
          subject: formData.subject,
          html: formData.message.replace(/\n/g, "<br />"),
          text: formData.message,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Email Successfully Sent",
        description: `Email sent to ${formData.to}`,
      });

      setFormData({ to: "", subject: "", message: "" });
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Email Failed — Check SMTP Settings",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Send Email</h2>
      </div>

      <form onSubmit={handleSendEmail} className="space-y-4">
        <div>
          <Label htmlFor="to">Recipient (TO)</Label>
          <Input
            id="to"
            type="email"
            value={formData.to}
            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
            placeholder="recipient@example.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Email subject"
            required
          />
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Write your message here..."
            className="min-h-[200px]"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            HTML tags are supported for rich formatting
          </p>
        </div>

        <Button
          type="submit"
          disabled={sending}
          className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default EmailComposer;
