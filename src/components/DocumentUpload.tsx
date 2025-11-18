import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2 } from "lucide-react";

interface DocumentUploadProps {
  applicationId: string;
  userId: string;
  onUploadComplete: () => void;
}

const DocumentUpload = ({ applicationId, userId, onUploadComplete }: DocumentUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a document to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${applicationId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("application-documents")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("application-documents")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("applications")
        .update({ document_url: publicUrl })
        .eq("id", applicationId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      setFile(null);
      onUploadComplete();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="document">Upload Completed Document</Label>
        <Input
          id="document"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          disabled={uploading}
        />
      </div>
      <Button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="bg-gradient-primary hover:opacity-90"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </>
        )}
      </Button>
    </div>
  );
};

export default DocumentUpload;
