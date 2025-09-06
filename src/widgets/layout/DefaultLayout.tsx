import { ProtectedRoute } from "@/features/auth";
import React from "react";
import SideBar from "../ui/SideBar";

type Props = {
  children: React.ReactNode;
};

const DefaultLayout: React.FC<Props> = ({ children }) => {
  const [isSidebarClosed, setIsSidebarClosed] = React.useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarClosed(!isSidebarClosed);
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <SideBar isClosed={isSidebarClosed} onClose={toggleSidebar} />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
};

export default DefaultLayout;
