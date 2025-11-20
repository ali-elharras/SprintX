import React from "react";
import { useNavigate } from "react-router-dom";
import theme from "../theme";

const PreLoginNavbar = () => {
  const navigate = useNavigate();

  const navbarStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "flex-start",
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
    height: "60px",
    width: "auto",
  };

  return (
    <nav style={navbarStyles}>
      <div style={logoStyles} onClick={() => navigate("/")}>
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
