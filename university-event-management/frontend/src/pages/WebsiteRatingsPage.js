import React, { useContext } from "react";
import WebsiteRatingsAdmin from "../components/WebsiteRatingsAdmin";
import AdminSidebar from "../components/AdminSidebar";
import { SidebarContext } from "../App";

const WebsiteRatingsPage = () => {
  const { isSidebarOpen } = useContext(SidebarContext);

  return (
    <div className="flex">
      <AdminSidebar isOpen={isSidebarOpen} />
      <div
        className="flex-1"
        style={{
          marginLeft: isSidebarOpen ? "260px" : "0",
          padding: "2rem",
          minHeight: "100vh",
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        <WebsiteRatingsAdmin />
      </div>
    </div>
  );
};

export default WebsiteRatingsPage;
