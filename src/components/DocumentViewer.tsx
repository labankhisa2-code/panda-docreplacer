import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

interface Document {
  id: string;
  tracking_id: string;
  institution_name: string;
  document_type: string;
  status: string;
  document_url: string | null;
  created_at: string;
}

interface DocumentViewerProps {
  documents: Document[];
}

const DocumentViewer = ({ documents }: DocumentViewerProps) => {
  const completedDocs = documents.filter(
    (doc) => doc.status === "completed" && doc.document_url
  );

  if (completedDocs.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <p className="text-muted-foreground text-center">
          No completed documents available yet. Your documents will appear here once they are ready.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {completedDocs.map((doc) => (
        <Card key={doc.id} className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">{doc.institution_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {doc.document_type.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tracking ID: {doc.tracking_id}
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.open(doc.document_url!, "_blank")}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DocumentViewer;
