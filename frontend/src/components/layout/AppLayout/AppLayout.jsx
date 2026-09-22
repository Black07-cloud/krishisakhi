import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import "./AppLayout.css";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-layout-main">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="app-layout-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
