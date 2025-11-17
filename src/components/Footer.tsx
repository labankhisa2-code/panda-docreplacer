import { useEffect, useState } from "react";
import { Mail, Globe, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const [settings, setSettings] = useState({
    contact_email: "",
    website_url: "",
    location: "",
    footer_text: "Fast & Secure Academic Certificate & Document Replacement Services",
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
          contact_email: data.contact_email || "",
          website_url: data.website_url || "",
          location: data.location || "",
          footer_text: data.footer_text || settings.footer_text,
        });
      }
    };
    load();
  }, []);

  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <FileText className="w-6 h-6" />
              <span>5str Documents</span>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              {settings.footer_text}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/request" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Apply Now
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Track Application
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{settings.contact_email || '—'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{settings.website_url || '5str-docs.its-mycardio.co.ke'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/80">
          <p>&copy; {new Date().getFullYear()} 5str Documents. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
