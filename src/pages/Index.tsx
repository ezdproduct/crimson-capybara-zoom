import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Chào mừng bạn
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Sẵn sàng để bắt đầu check-in.
        </p>
        <Link to="/checkin">
          <Button size="lg">Đi đến trang Check-in</Button>
        </Link>
      </div>
      <div className="absolute bottom-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;