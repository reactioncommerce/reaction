import React, { Component } from "react";
import { Router } from "/client/api";

class EmailDashboardTabs extends Component {
  render() {
    return (
      <div>
        <a href={Router.pathFor("Email Status")} data-i18n="mail.headers.status">Status</a>
      </div>
    );
  }
}

export default EmailDashboardTabs;
