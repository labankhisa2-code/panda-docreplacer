import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { GraduationCap, Shield, Clock, CheckCircle, FileText, Search } from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "Your documents and personal information are handled with the highest level of security and confidentiality.",
    },
    {
      icon: Clock,
      title: "Fast Processing",
      description: "We work efficiently with institutions to get your replacement documents as quickly as possible.",
    },
    {
      icon: CheckCircle,
      title: "Verified Process",
      description: "All applications go through proper verification channels to ensure authenticity and compliance.",
    },
    {
      icon: Search,
      title: "Easy Tracking",
      description: "Track your application status in real-time with our simple tracking system.",
    },
  ];

  const services = [
    { icon: GraduationCap, title: "University Certificates", count: "50+" },
    { icon: FileText, title: "High School Certificates", count: "100+" },
    { icon: FileText, title: "Academic Transcripts", count: "75+" },
    { icon: FileText, title: "Professional Certificates", count: "30+" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Fast & Secure Academic Certificate{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Replacement Services
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Lost or damaged your academic documents? We help you get official replacements from your institution quickly and securely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/request">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-elegant text-primary-foreground">
                  Request Replacement
                </Button>
              </Link>
              <Link to="/tracking">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Track Application
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Documents We Replace
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <Card key={idx} className="p-6 text-center hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-card border-border">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground">
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{service.title}</h3>
                <p className="text-accent font-bold text-2xl">{service.count}</p>
                <p className="text-muted-foreground text-sm">Processed</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/services">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Why Choose Panda Tech?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4 text-accent-foreground shadow-gold">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Your Documents?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Start your application today and get your replacement documents processed efficiently.
          </p>
          <Link to="/request">
            <Button size="lg" className="bg-accent hover:opacity-90 shadow-gold text-accent-foreground">
              Start Application
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
