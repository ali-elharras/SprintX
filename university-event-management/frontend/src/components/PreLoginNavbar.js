import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import theme from "../theme";

const PreLoginNavbar = ({ align = "center" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    navigate("/");
  };

  const navbarStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: align === "left" ? "flex-start" : "center",
    alignItems: "center",
    padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
    zIndex: 1000,
    background: "transparent",
  };

  const logoStyles = {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  };

  const logoImageStyles = {
    height: "40px",
    width: "auto",
  };

  return (
    <nav style={navbarStyles}>
      <div style={logoStyles} onClick={handleLogoClick}>
        <img
          src={require("../assets/images/SprintXLogoWhite.png")}
          alt="SprintX"
          style={logoImageStyles}
        />
      </div>
    </nav>
  );
};

export default PreLoginNavbar;
