import React from "react";
import NavBar from "../components/navbar";

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
  return React.createElement(NavBar, newProps, context);
};

export default NavBarCheckout;
