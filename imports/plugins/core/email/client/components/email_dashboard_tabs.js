import React, { Component } from "react";
import { Router } from "/client/api";

class EmailDashboardTabs extends Component {
  render() {
    return (
      <div>
        <a href={Router.pathFor("email")}>Status</a>
      </div>
    );
  }
}

export default EmailDashboardTabs;
