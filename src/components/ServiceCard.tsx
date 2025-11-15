import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  requirements?: string[];
}

const ServiceCard = ({ icon: Icon, title, description, requirements }: ServiceCardProps) => {
  return (
    <Card className="p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-card border-border">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-primary rounded-lg text-primary-foreground">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm mb-4">{description}</p>
          
          {requirements && requirements.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-foreground mb-2">Requirements:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link to="/request">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-glow hover:bg-primary-light/20 gap-1">
              Apply Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
