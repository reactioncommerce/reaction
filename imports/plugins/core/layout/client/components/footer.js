import React from "react";

import { registerComponent } from "/imports/plugins/core/components/lib";
import { Reaction } from "/client/api";

const Footer = () => (
  <div className="reaction-navigation-footer footer-default">
    <nav className="navbar-bottom" role="navigation">
      <div className="row">
        <a href={Reaction.Router.pathFor("/")}>Home</a>
      </div>
    </nav>
  </div>
);


registerComponent("Footer", Footer);

export default Footer;

