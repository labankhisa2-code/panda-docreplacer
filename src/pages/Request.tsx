import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, CheckCircle } from "lucide-react";

const Request = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    institutionName: "",
    documentType: "",
    yearOfStudy: "",
    indexNumber: "",
    idNumber: "",
    phone: "",
    email: "",
    notes: "",
  });

  const documentTypes = [
    { value: "university_certificate", label: "University Certificate" },
    { value: "high_school_certificate", label: "High School Certificate (KCSE/KCPE)" },
    { value: "academic_transcript", label: "Academic Transcript" },
    { value: "graduation_letter", label: "Graduation Letter" },
    { value: "student_id", label: "Student ID Replacement" },
    { value: "recommendation_letter", label: "Recommendation Letter" },
    { value: "admission_letter", label: "Admission Letter" },
    { value: "fee_statement", label: "Fee Statement" },
    { value: "internship_letter", label: "Internship/Attachment Letter" },
    { value: "professional_certificate", label: "Professional Certificate" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("applications")
        .insert([
          {
            tracking_id: "",
            full_name: formData.fullName,
            institution_name: formData.institutionName,
            document_type: formData.documentType as any,
            year_of_study: formData.yearOfStudy,
            index_number: formData.indexNumber,
            id_number: formData.idNumber,
            phone: formData.phone,
            email: formData.email,
            notes: formData.notes,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: `Your tracking ID is: ${data.tracking_id}`,
      });

      // Redirect to tracking page with the tracking ID
      navigate(`/tracking?id=${data.tracking_id}`);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Request <span className="bg-gradient-primary bg-clip-text text-transparent">Document Replacement</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Fill out the form below to start your document replacement process. 
                You'll receive a tracking ID once submitted.
              </p>
            </div>

            <Card className="p-6 md:p-8 shadow-card bg-card border-border">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="idNumber">ID/Passport Number *</Label>
                      <Input
                        id="idNumber"
                        required
                        value={formData.idNumber}
                        onChange={(e) => handleChange("idNumber", e.target.value)}
                        placeholder="Enter your ID/Passport number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="e.g., 0712345678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Information */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Document Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="institutionName">Institution Name *</Label>
                      <Input
                        id="institutionName"
                        required
                        value={formData.institutionName}
                        onChange={(e) => handleChange("institutionName", e.target.value)}
                        placeholder="e.g., University of Nairobi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="documentType">Document Type *</Label>
                      <Select
                        required
                        value={formData.documentType}
                        onValueChange={(value) => handleChange("documentType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="yearOfStudy">Year of Study/Graduation</Label>
                      <Input
                        id="yearOfStudy"
                        value={formData.yearOfStudy}
                        onChange={(e) => handleChange("yearOfStudy", e.target.value)}
                        placeholder="e.g., 2020"
                      />
                    </div>
                    <div>
                      <Label htmlFor="indexNumber">Index/Registration Number</Label>
                      <Input
                        id="indexNumber"
                        value={formData.indexNumber}
                        onChange={(e) => handleChange("indexNumber", e.target.value)}
                        placeholder="Enter your index/reg number"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Any additional information that might help process your request..."
                    className="min-h-24"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-primary-light/20 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> After submitting this form, you'll receive a unique tracking ID. 
                    You'll be contacted via email or phone for document uploads (ID copy, police abstract, etc.) and payment details.
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full bg-gradient-primary hover:opacity-90 shadow-elegant text-primary-foreground"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Request;
