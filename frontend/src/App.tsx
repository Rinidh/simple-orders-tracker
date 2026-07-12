import { Route, Routes } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { Header } from "./components/Header";
import { NewOrderPage } from "./pages/NewOrderPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ReportsPage } from "./pages/ReportsPage";

export const App = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="pb-20 sm:pb-0">
        <Routes>
          <Route path="/" element={<OrdersPage />} />
          <Route path="/orders/new" element={<NewOrderPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
};
