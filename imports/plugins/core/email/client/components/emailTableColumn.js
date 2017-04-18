import React, { Component, PropTypes } from "react";
import moment from "moment";
import { Icon } from "/imports/plugins/core/ui/client/components";
import { i18next } from "/client/api";

class EmailTableColumn extends Component {
  static propTypes = {
    data: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]),
    metadata: PropTypes.object,
    rowData: PropTypes.object
  }

  handleAction = () => {
    const emailId = this.props.rowData._id;
    const emailAddress = this.props.rowData.data.to;

    Meteor.call("emails/retryFailed", emailId, (err) => {
      if (err) {
        return Alerts.toast(i18next.t("app.error", { error: err.reason }), "error");
      }
      return Alerts.toast(i18next.t("mail.alerts.resendSuccess", { email: emailAddress }), "success");
    });
  }

  render() {
    const renderColumn = this.props.metadata.columnName;

    if (renderColumn === "status") {
      if (this.props.data === "completed") {
        return (
          <span>
            <Icon icon="fa fa-circle" className="pull-left valid" />
          </span>
        );
      }
      return (
        <span>
          <Icon icon="fa fa-circle" className="pull-left error" />
          <span onClick={this.handleAction} title={this.props.data}>
            <Icon icon="fa fa-share" className="pull-right" />
          </span>
        </span>
      );
    }
    if (renderColumn === "updated") {
      const createdDate = moment(this.props.data).format("LLL");
      return (
        <span>{createdDate}</span>
      );
    }
    return (
      <span>{this.props.data}</span>
    );
  }
}

export default EmailTableColumn;
