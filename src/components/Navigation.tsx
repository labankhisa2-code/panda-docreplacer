import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, FileText, LogOut, User, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await checkAdminRole(session.user.id);
    }
  };

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    setIsAdmin(data && data.length > 0);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/request", label: "Apply Now" },
    { to: "/tracking", label: "Track Application" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const authenticatedLinks = user
    ? [
        { to: "/profile", label: "My Profile" },
        ...(isAdmin ? [{ to: "/admin", label: "Admin Dashboard" }] : []),
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary-glow transition-colors">
            <FileText className="w-6 h-6" />
            <span>5str Documents</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary-light/20">
                  {link.label}
                </Button>
              </Link>
            ))}
            {authenticatedLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary-light/20">
                  {link.label}
                </Button>
              </Link>
            ))}
            
            {user ? (
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="ml-2 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="ml-2 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary hover:bg-primary-light/20">
                  {link.label}
                </Button>
              </Link>
            ))}
            {authenticatedLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary hover:bg-primary-light/20">
                  {link.label}
                </Button>
              </Link>
            ))}
            
            {user ? (
              <Button
                variant="outline"
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="w-full justify-start gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
