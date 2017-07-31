import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import moment from "moment";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";

class EmailTableColumn extends Component {
  static propTypes = {
    data: PropTypes.object,
    row: PropTypes.object
  }

  handleAction = () => {
    const { row } = this.props;

    const emailId = row.original._id;
    const emailAddress = row.original.data.to;

    Meteor.call("emails/retryFailed", emailId, (err) => {
      if (err) {
        return Alerts.toast(i18next.t("app.error", { error: err.reason }), "error");
      }
      return Alerts.toast(i18next.t("mail.alerts.resendSuccess", { email: emailAddress }), "success");
    });
  }

  render() {
    const { row } = this.props;

    const renderColumn = row.column.id;

    if (renderColumn === "status") {
      if (row.value === "completed") {
        return (
          <span>
            <Components.Icon icon="fa fa-circle" className="valid" />
            <span onClick={this.handleAction} title={this.props.data}>
              <Components.Icon icon="fa fa-retweet" className="resend-mail" />
            </span>
          </span>
        );
      }
      return (
        <span>
          <Components.Icon icon="fa fa-circle" className="error" />
          <span onClick={this.handleAction} title={this.props.data}>
            <Components.Icon icon="fa fa-retweet" className="resend-mail" />
          </span>
        </span>
      );
    }
    if (renderColumn === "updated") {
      const createdDate = moment(row.value).format("LLL");
      return (
        <span>{createdDate}</span>
      );
    }
    return (
      <span>{row.value}</span>
    );
  }
}

registerComponent("EmailTableColumn", EmailTableColumn);

export default EmailTableColumn;
