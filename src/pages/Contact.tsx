import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Globe, MapPin, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  const [settings, setSettings] = useState({
    contact_email: "",
    website_url: "",
    location: "",
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();
      if (data) {
        setSettings({
          contact_email: data.contact_email || '',
          website_url: data.website_url || '',
          location: data.location || '',
        });
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Get In <span className="bg-gradient-primary bg-clip-text text-transparent">Touch</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Have questions? We're here to help. Reach out to us through any of the channels below.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Contact Information */}
              <div className="space-y-6">
                <Card className="p-6 shadow-card bg-card border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
                  <div className="space-y-6">
                    {[{
                      icon: Mail,
                      title: 'Email',
                      details: [settings.contact_email || '—'],
                      link: settings.contact_email ? `mailto:${settings.contact_email}` : null,
                    },{
                      icon: Globe,
                      title: 'Website',
                      details: [settings.website_url || '5str-docs.its-mycardio.co.ke'],
                      link: settings.website_url || 'https://5str-docs.its-mycardio.co.ke',
                    },{
                      icon: MapPin,
                      title: 'Location',
                      details: [settings.location || 'Nairobi, Kenya'],
                      link: null,
                    }].map((info, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-primary rounded-lg text-primary-foreground">
                          <info.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                          {info.details.map((detail, didx) => (
                            <p key={didx} className="text-muted-foreground text-sm">
                              {info.link ? (
                                <a href={info.link} className="hover:text-primary transition-colors">
                                  {detail}
                                </a>
                              ) : (
                                detail
                              )}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-gold text-accent-foreground shadow-gold">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-6 h-6" />
                    <h3 className="text-xl font-bold">WhatsApp Support</h3>
                  </div>
                  <p className="mb-4 text-accent-foreground/90">
                    Sign in to your account to chat directly with our support team through the messaging system.
                  </p>
                  <Link to="/auth">
                    <Button className="w-full bg-accent-foreground text-accent hover:bg-accent-foreground/90">
                      Sign In to Chat
                    </Button>
                  </Link>
                </Card>
              </div>

              {/* Contact Form */}
              <Card className="p-6 shadow-card bg-card border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help you?"
                      rows={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:opacity-90 shadow-elegant text-primary-foreground"
                  >
                    Send Message
                  </Button>
                </form>
              </Card>
            </div>

            {/* Office Hours */}
            <Card className="p-6 text-center bg-primary-light/20 border-primary/20">
              <h3 className="font-semibold text-lg text-foreground mb-2">Office Hours</h3>
              <p className="text-muted-foreground">
                Monday - Friday: 8:00 AM - 6:00 PM
                <br />
                Saturday: 9:00 AM - 2:00 PM
                <br />
                Sunday: Closed
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
