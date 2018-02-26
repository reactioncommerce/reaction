import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Orders } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { Components } from "@reactioncommerce/reaction-components";

/**
 * @file AddEmail React Component allows user to add an email after completing an order
 *
 * @module AddEmail
 * @extends Component
 */

class AddEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasEmail: !!this.props.orderEmail,
      order: this.props.order
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
  }

  /**
   * @name handleFieldChange()
   * @method
   * @summary handle setting state whenever the field on the form change
   * @param {Event} event - the event that fired
   * @param {String} value - the new value for the field
   * @param {String} field - which field to modify it's value
   * @return {null} null
   */
  handleFieldChange = (event, value, field) => {
    this.setState({
      [field]: value
    });
  };

  /**
   * @name handleSubmit()
   * @method
   * @summary Handle submitting the email form
   * @param {Event} event - the event that fired
   * @returns {null} null
   */
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
      <div className="order-details-email-box-container">
        <div className="order-details-email-box">
          <form onSubmit={this.handleSubmit} className="add-email-input">
            <Components.Translation defaultValue="Hello! Add an email and receive order updates" i18nKey="{cartCompleted.registerGuest}" />
            <div>
              <Components.TextField
                name="email"
                type="email"
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
        </div>
        <div className="order-details-email-box-side" />
      </div>
    );
  }
}

/**
 * @name AddEmail propTypes
 * @type {propTypes}
 * @param {Object} props - React PropTypes
 * @property {Object} order - An object representing the order
 * @property {String} orderEmail - a string containing the email attached to the order if it exists
 * @return {Node} React node containing input box when no email has been attached to the order
 */
AddEmail.propTypes = {
  order: PropTypes.object,
  orderEmail: PropTypes.string
};

export default AddEmail;
