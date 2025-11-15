import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Shield, Users, Target, Award } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your documents and personal information are handled with the highest level of security and confidentiality.",
    },
    {
      icon: Users,
      title: "Customer First",
      description: "We prioritize your needs and work tirelessly to ensure a smooth document replacement experience.",
    },
    {
      icon: Target,
      title: "Efficiency",
      description: "We streamline the replacement process to get your documents back to you as quickly as possible.",
    },
    {
      icon: Award,
      title: "Quality Service",
      description: "We maintain high standards in all our processes to ensure authentic and properly verified documents.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                About <span className="bg-gradient-primary bg-clip-text text-transparent">5str Documents</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Your trusted partner for academic document replacement services in Kenya
              </p>
            </div>

            <Card className="p-8 shadow-card bg-card border-border mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                At 5str Documents, we understand the stress and frustration that comes with 
                losing important academic documents. Our mission is to simplify and expedite the replacement 
                process, providing a reliable bridge between you and your educational institutions.
              </p>
              <p className="text-muted-foreground">
                We work closely with universities, colleges, KNEC, KASNEB, and other certification bodies 
                to ensure that your replacement documents are processed efficiently and securely. With years 
                of experience in document management and institutional liaison, we've helped hundreds of 
                students and professionals recover their vital academic credentials.
              </p>
            </Card>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Core Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {values.map((value, idx) => (
                  <Card key={idx} className="p-6 hover:shadow-elegant transition-all duration-300 bg-card border-border">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-primary rounded-lg text-primary-foreground">
                        <value.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-2">{value.title}</h3>
                        <p className="text-muted-foreground text-sm">{value.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="p-8 shadow-card bg-gradient-primary text-primary-foreground">
              <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
              <ul className="space-y-3 text-primary-foreground/90">
                <li className="flex items-start gap-2">
                  <span className="text-accent-foreground font-bold">•</span>
                  <span>Direct relationships with educational institutions across Kenya</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-foreground font-bold">•</span>
                  <span>Experienced team with deep understanding of institutional procedures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-foreground font-bold">•</span>
                  <span>Transparent process with real-time application tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-foreground font-bold">•</span>
                  <span>Secure handling of personal information and documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-foreground font-bold">•</span>
                  <span>Competitive pricing with no hidden fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-foreground font-bold">•</span>
                  <span>Dedicated customer support throughout the process</span>
                </li>
              </ul>
            </Card>

            <div className="mt-12 text-center">
              <Card className="p-8 bg-accent-light/20 border-accent/20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Privacy & Confidentiality</h2>
                <p className="text-muted-foreground">
                  We take your privacy seriously. All personal information and documents are handled with 
                  strict confidentiality and in compliance with data protection regulations. Your information 
                  is only shared with relevant institutions for the sole purpose of processing your document 
                  replacement request.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
