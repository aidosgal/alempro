import React from "react";

type Props = {
  children: React.ReactNode;
};

const AuthLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-white">
      <div className="m-auto w-full max-w-md px-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
