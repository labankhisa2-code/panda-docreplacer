import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { 
  GraduationCap, 
  School, 
  FileText, 
  Award, 
  IdCard, 
  FileCheck, 
  Mail, 
  DollarSign, 
  Briefcase,
  BadgeCheck
} from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: GraduationCap,
      title: "University Certificates",
      description: "Replacement of lost or damaged university degree certificates, diplomas, and award certificates from all Kenyan universities.",
      requirements: [
        "Valid national ID or passport",
        "Original admission letter (if available)",
        "Police abstract for lost documents",
        "Recent passport photo",
        "Processing fee payment confirmation"
      ],
    },
    {
      icon: School,
      title: "High School Certificates (KCSE/KCPE)",
      description: "Official replacement certificates for Kenya Certificate of Secondary Education and Kenya Certificate of Primary Education.",
      requirements: [
        "Valid national ID or passport",
        "Index number from original certificate",
        "Police abstract (for lost certificates)",
        "Year of examination",
        "School attended details"
      ],
    },
    {
      icon: FileText,
      title: "Academic Transcripts",
      description: "Complete academic transcripts showing all grades and units completed during your course of study.",
      requirements: [
        "Student ID or registration number",
        "Copy of national ID",
        "Completed clearance form",
        "Processing fee payment",
        "Year of completion"
      ],
    },
    {
      icon: Award,
      title: "Graduation Letters",
      description: "Official letters confirming your graduation and degree award from your institution.",
      requirements: [
        "Registration number",
        "Copy of ID",
        "Year of graduation",
        "Degree program details"
      ],
    },
    {
      icon: IdCard,
      title: "Student ID Replacement",
      description: "Replacement of lost, stolen, or damaged student identification cards from colleges and universities.",
      requirements: [
        "Police abstract (for lost ID)",
        "Recent passport photo",
        "Current registration status",
        "Replacement fee payment"
      ],
    },
    {
      icon: FileCheck,
      title: "Recommendation Letters",
      description: "Official recommendation letters from your institution for employment or further studies.",
      requirements: [
        "Student registration number",
        "Purpose of recommendation",
        "Contact details for reference",
        "Completed studies confirmation"
      ],
    },
    {
      icon: Mail,
      title: "Admission Letters",
      description: "Duplicate copies of your original admission letter to the institution.",
      requirements: [
        "Admission number",
        "Year of admission",
        "Program details",
        "Copy of national ID"
      ],
    },
    {
      icon: DollarSign,
      title: "Fee Statements",
      description: "Official statements showing your fee payment history throughout your study period.",
      requirements: [
        "Student registration number",
        "Academic years required",
        "Copy of ID",
        "Current contact information"
      ],
    },
    {
      icon: Briefcase,
      title: "Internship/Attachment Letters",
      description: "Official letters confirming completion of industrial attachment or internship programs.",
      requirements: [
        "Registration number",
        "Internship period details",
        "Company/organization name",
        "Supervisor details"
      ],
    },
    {
      icon: BadgeCheck,
      title: "Professional Certificates",
      description: "Replacement certificates from KNEC, KASNEB, TVET, NITA, and other professional certification bodies.",
      requirements: [
        "Registration/candidate number",
        "Examination year",
        "Copy of national ID",
        "Police abstract for lost certificates",
        "Original receipt (if available)"
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our <span className="bg-gradient-primary bg-clip-text text-transparent">Services</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We help you replace all types of academic and institutional documents. 
              Select your document type below to see requirements and apply.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {services.map((service, idx) => (
              <ServiceCard
                key={idx}
                icon={service.icon}
                title={service.title}
                description={service.description}
                requirements={service.requirements}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
