import React from "react";

const LogoSvg = ({ size = "100%", color = "#4B5563", className = "" }) => {
  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Building Icon"
        role="img"
      >

      </svg>
    </>
  );
};

export default LogoSvg;
