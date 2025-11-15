import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, FileText } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/request", label: "Apply Now" },
    { to: "/tracking", label: "Track Application" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary-glow transition-colors">
            <FileText className="w-6 h-6" />
            <span>Panda Tech</span>
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
            <Link to="/admin">
              <Button variant="outline" className="ml-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Admin
              </Button>
            </Link>
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
            <Link to="/admin" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Admin
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
