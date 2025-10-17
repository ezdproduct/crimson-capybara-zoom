import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";

const documents = [
  { name: "0. Nội quy đại hội", path: "/documents/00_noi_quy_dai_hoi.docx" },
  { name: "1. Chương trình đại hội", path: "/documents/01_chuong_trinh_dai_hoi.docx" },
  { name: "2. Báo cáo chính trị", path: "/documents/02_bao_cao_chinh_tri.docx" },
  { name: "3. Báo cáo kiểm điểm NK 2024 - 2029", path: "/documents/03_bao_cao_kiem_diem.docx" },
  { name: "4. Báo cáo tham luận của Bà Lâm Thị Sáu", path: "/documents/04_tham_luan_lam_thi_sau.docx" },
  { name: "5. Báo cáo tham luận Chuyển đổi số", path: "/documents/05_tham_luan_chuyen_doi_so.docx" },
  { name: "6. Nghị quyết đại hội", path: "/documents/06_nghi_quyet_dai_hoi.docx" },
  { name: "7. Đề án nhân sự", path: "/documents/07_de_an_nhan_su.doc" },
  { name: "8. Danh sách 59 vị uỷ viên", path: "/documents/08_danh_sach_uy_vien.xls" },
  { name: "9. Đề án đại biểu tham dự ĐH cấp trên", path: "/documents/09_de_an_dai_bieu_cap_tren.docx" },
  { name: "10. Danh sách đại biểu dự cấp TP", path: "/documents/10_danh_sach_dai_bieu_cap_tp.xlsx" },
];

const DocumentsPage = () => {
  return (
    <div className="w-full px-4 flex justify-center items-start min-h-screen pt-16 md:pt-24">
      <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-3xl">Tra cứu tài liệu</CardTitle>
          <CardDescription className="text-lg pt-1">
            Các tài liệu, văn kiện của Đại hội
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {documents.map((doc, index) => (
              <li key={index}>
                <a
                  href={doc.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 mr-4 text-primary" />
                    <span className="text-lg">{doc.name}</span>
                  </div>
                  <Download className="h-6 w-6 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;