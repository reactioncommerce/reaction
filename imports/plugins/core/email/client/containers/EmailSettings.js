import React, { Component, Fragment } from "react";
import EmailConfig from "./EmailConfigContainer";
import EmailLogs from "./emailLogs";

export default class EmailSettings extends Component {
  render() {
    return (
      <Fragment>
        <div>
          <EmailConfig />
        </div>
        <div>
          <EmailLogs />
        </div>
      </Fragment>
    );
  }
}
