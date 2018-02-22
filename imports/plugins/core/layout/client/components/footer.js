import React from "react";
import { registerComponent } from "/imports/plugins/core/components/lib";

const Footer = () => (
  <div className="reaction-navigation-footer footer-default">
    <nav className="navbar-bottom">
      <div className="row">
        {/* Footer content */}
      </div>
    </nav>
  </div>
);


registerComponent("Footer", Footer);

export default Footer;
