import * as React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { renderAsync } from "docx-preview";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

const DocumentViewerPage = () => {
  const [searchParams] = useSearchParams();
  const docPath = searchParams.get("path");
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (docPath && viewerRef.current) {
      setIsLoading(true);
      setError(null);
      const container = viewerRef.current;
      container.innerHTML = "";

      fetch(docPath)
        .then(response => {
          if (!response.ok) throw new Error("Không thể tải tài liệu.");
          return response.arrayBuffer();
        })
        .then(buffer => {
          const lowerDocPath = docPath.toLowerCase();
          if (lowerDocPath.endsWith(".docx") || lowerDocPath.endsWith(".doc")) {
            renderAsync(buffer, container, undefined, { className: "docx-wrapper" })
              .finally(() => setIsLoading(false));
          } else if (lowerDocPath.endsWith(".xlsx") || lowerDocPath.endsWith(".xls")) {
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const html = XLSX.utils.sheet_to_html(worksheet);
            container.innerHTML = html;
            const table = container.querySelector('table');
            if (table) table.classList.add('table-auto', 'w-full', 'border-collapse', 'border', 'border-gray-300');
            setIsLoading(false);
          } else {
            throw new Error("Định dạng file không được hỗ trợ để xem trực tuyến.");
          }
        })
        .catch(err => {
          console.error(err);
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [docPath]);

  const docName = docPath?.split('/').pop() || "Tài liệu";

  return (
    <div className="w-full px-4 flex justify-center items-start min-h-screen pt-8 pb-8">
      <Card className="w-full max-w-4xl bg-card/95 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">{docName}</CardTitle>
          <Button asChild variant="outline">
            <Link to="/documents"><ArrowLeft className="mr-2 h-4 w-4" /> Quay lại</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin" />
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          <div ref={viewerRef} className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-4 rounded-md"></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentViewerPage;