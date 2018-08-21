import React from "react";
import NavBarAdmin from "../components/navbarAdmin";

const NavBarCheckout = (props, context) => {
  const visibility = {
    hamburger: false,
    brand: true,
    tags: false,
    search: false,
    notifications: false,
    languages: false,
    currency: false,
    mainDropdown: false,
    cartContainer: false
  };
  const newProps = {
    ...props,
    visibility
  };
  return React.createElement(NavBarAdmin, newProps, context);
};

export default NavBarCheckout;
