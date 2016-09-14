import React, { Component } from "react";
import { Router } from "/client/api";

class EmailDashboardTabs extends Component {
  render() {
    return (
      <div>
        <a href={Router.pathFor("Email Status")}>Status</a>
      </div>
    );
  }
}

export default EmailDashboardTabs;
