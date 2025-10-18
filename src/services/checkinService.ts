// Định nghĩa kiểu dữ liệu User
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  note: string;
  checkin: boolean; // Thêm trạng thái check-in
}

// Kiểu dữ liệu cho người dùng mới
export interface NewUser {
  name: string;
  position: string;
  gender: string;
}

// Hàm API để lấy danh sách người dùng
export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch("https://n8n.probase.tech/webhook/checkin");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  
  // Lọc và ánh xạ dữ liệu
  return data
    .filter((user: any) => user["Họ và tên"])
    .map((user: any) => ({
      id: user.row_number ? String(user.row_number) : user["Họ và tên"],
      name: user["Họ và tên"],
      email: user.email || "",
      phone: user.phone || "N/A",
      position: user.position || user["Chức vụ"] || "N/A",
      department: user.department || "N/A",
      note: user.note || "",
      checkin: user.Checkin || false, // Lấy trạng thái check-in từ API
    }));
};

// Hàm API để thực hiện check-in
export const performCheckin = async (user: User): Promise<Response> => {
  const response = await fetch("https://n8n.probase.tech/webhook/xac-nhan-check-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error("Điểm danh thất bại");
  }
  return response;
};

// Hàm API để đăng ký người dùng mới
export const registerUser = async (newUser: NewUser): Promise<Response> => {
  const response = await fetch("https://n8n.probase.tech/webhook/dang-ky", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  });

  if (!response.ok) {
    throw new Error("Đăng ký thất bại");
  }
  return response;
};