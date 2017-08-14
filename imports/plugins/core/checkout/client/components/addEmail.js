import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Orders } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { Components } from "@reactioncommerce/reaction-components";


class AddEmail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasEmail: !!this.props.orderEmail,
      order: this.props.order
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
  }

  handleFieldChange = (event, value, field) => {
    this.setState({
      [field]: value
    });
  };

  handleSubmit(event) {
    event.preventDefault();
    const cartId = Reaction.Router.getQueryParam("_id");

    Meteor.call("orders/addOrderEmail", cartId, this.state.email, (err, results) => {
      if (err) {
        Alerts.toast(i18next.t("mail.alerts.cantSendEmail"), "error");
      } else {
        // we need to re-grab order here so it has the email
        const order = Orders.findOne({
          userId: Meteor.userId(),
          cartId
        });
        Meteor.call("orders/sendNotification", order, (error) => {
          if (!error) {
            Alerts.toast(i18next.t("mail.alerts.emailSent"), "success");
            this.setState({
              hasEmail: true
            });
          } else {
            Alerts.toast(i18next.t("mail.alerts.addOrderEmailFailed"), "error");
          }
        });
      }
      return results;
    });
  }

  render() {
    if (this.state.hasEmail) {
      return (
        <p>
          <Components.Translation defaultValue="Order updates will be sent to" i18nKey={"cartCompleted.trackYourDelivery"} />
          &nbsp;<strong>{this.props.orderEmail}</strong>
        </p>
      );
    }
    return (
      <form onSubmit={this.handleSubmit} className="add-email-input">
        <Components.Translation defaultValue="Hello! Add an email and receive order updates" i18bnKey="{cartCompleted.registerGuest}" />
        <div>
          <Components.TextField
            name="email"
            type="email"
            tabIndex="1"
            value={this.state.email}
            onChange={this.handleFieldChange}
          />
          <Components.Button
            type="submit"
            label="Add Email"
            bezelStyle={"solid"}
            onClick={this.handleSubmit}
          />
        </div>
      </form>
    );
  }
}

AddEmail.propTypes = {
  order: PropTypes.object,
  orderEmail: PropTypes.string
};

export default AddEmail;
