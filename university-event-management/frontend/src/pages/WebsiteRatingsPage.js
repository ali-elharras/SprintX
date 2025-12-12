import React from "react";
import WebsiteRatingsAdmin from "../components/WebsiteRatingsAdmin";
import AdminSidebar from "../components/AdminSidebar";

const WebsiteRatingsPage = () => {
  return (
    <div className="flex">
      <AdminSidebar isOpen={true} />
      <div
        className="flex-1"
        style={{
          marginLeft: "260px",
          padding: "2rem",
          minHeight: "100vh",
        }}
      >
        <WebsiteRatingsAdmin />
      </div>
    </div>
  );
};

export default WebsiteRatingsPage;
