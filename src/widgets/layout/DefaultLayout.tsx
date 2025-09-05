import React from "react";

type Props = {
  children: React.ReactNode;
};

const DefaultLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="">
      <div>Layout</div>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default DefaultLayout;
