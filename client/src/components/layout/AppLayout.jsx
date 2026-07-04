import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const AppLayout = () => (
  <div className="min-h-screen bg-paper">
    <Navbar />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
