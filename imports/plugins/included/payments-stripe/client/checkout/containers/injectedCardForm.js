import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement
} from "react-stripe-elements";

import { Router } from "/client/api";

class CardForm extends Component {
  static propTypes = {
    cartId: PropTypes.string,
    postal: PropTypes.string,
    stripe: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      errorMessage: "",
      submitMessage: "Complete your order",
      postal: props.postal,
      submitting: false
    };
  }

  handleSubmit = (ev) => {
    const resubmitMessage = "Resubmit payment";
    ev.preventDefault();

    if (this.state.cardNumberErrorMessage || this.state.expDateErrorMessage || this.state.CVVErrorMessage || this.state.postalErrorMessage) {
      return;
    }

    this.setState({
      submitMessage: "Submitting...",
      submitting: true
    });
    if (this.props.stripe) {
      this.props.stripe.createToken().then((payload) => {
        if (payload.error) {
          this.setState({
            errorMessage: "",
            submitMessage: resubmitMessage,
            submitting: false
          });
          // Do not duplicate field validation errors
          if (payload.error.type !== "validation_error") {
            this.setState({ errorMessage: payload.error.message });
          }
          return;
        }
        Meteor.apply("stripe/payment/createCharges", ["authorize", payload.token, this.props.cartId], {
          onResultReceived: (error, result) => {
            if (error || (result && result.error)) {
              this.setState({
                errorMessage: result.error.message,
                submitMessage: resubmitMessage,
                submitting: false
              });
            } else {
              Meteor.call("cart/submitPayment", result.paymentMethods);
              Router.go("cart/completed", {}, {
                _id: this.props.cartId
              });
            }
          }
        });
        return;
      }).catch(() => {
        this.setState({
          errorMessage: "Something went wrong. Please try again.",
          submitMessage: resubmitMessage,
          submitting: false
        });
        return;
      });
    }
    return;
  };

  handleCardNumberChange = (change) => {
    if (change && change.error) {
      this.setState({ cardNumberErrorMessage: change.error.message });
    } else {
      this.setState({ cardNumberErrorMessage: "" });
    }
  }

  handleExpDateChange = (change) => {
    if (change && change.error) {
      this.setState({ expDateErrorMessage: change.error.message });
    } else {
      this.setState({ expDateErrorMessage: "" });
    }
  }

  handleCVVChange = (change) => {
    if (change && change.error) {
      this.setState({ CVVErrorMessage: change.error.message });
    } else {
      this.setState({ CVVErrorMessage: "" });
    }
  }

  handlePostalChange = (change) => {
    if (change && change.value !== undefined) {
      this.setState({ postal: change.value });
    }
    if (change && change.error) {
      this.setState({ postalErrorMessage: change.error.message });
    } else {
      this.setState({ postalErrorMessage: "" });
    }
  }

  render() {
    const style = {
      base: {
        "fontSize": "14px",
        "color": "#595959",
        "fontFamily": "'Source Sans Pro', sans-serif",
        "fontWeight": "400",
        "lineHeight": "1.42857143",
        "::placeholder": {
          color: "#999999"
        }
      },
      invalid: {
        color: "#eb4d5c"
      }
    };

    let errorMessageDiv = null;
    if (this.state.errorMessage) {
      errorMessageDiv = (<div className="alert alert-danger">{this.state.errorMessage}</div>);
    }

    return (
      <form onSubmit={this.handleSubmit}>
        {/* eslint-disable jsx-a11y/label-has-for */}
        <div className="row">
          <div className="form-group">
            <label>Card number</label>
            <CardNumberElement
              style={style}
              placeholder="XXXX XXXX XXXX XXXX"
              className="stripe-card-element"
              onChange={this.handleCardNumberChange}
            />
            <span className="help-block stripe-help-block">{this.state.cardNumberErrorMessage}</span>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-6 stripe-exp-date-col">
            <div className="form-group">
              <label>Expiry date</label>
              <CardExpiryElement
                style={style}
                className="stripe-card-element"
                onChange={this.handleExpDateChange}
              />
              <span className="help-block stripe-help-block">{this.state.expDateErrorMessage}</span>
            </div>
          </div>
          <div className="col-xs-6 stripe-cvv-col">
            <div className="form-group">
              <label>CVV</label>
              <CardCVCElement
                style={style}
                placeholder="CVV"
                className="stripe-card-element"
                onChange={this.handleCVVChange}
              />
              <span className="help-block stripe-help-block">{this.state.CVVErrorMessage}</span>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="form-group">
            <label>Postal code</label>
            <PostalCodeElement
              style={style}
              className="stripe-card-element"
              onChange={this.handlePostalChange}
              value={this.state.postal}
            />
            <span className="help-block stripe-help-block">{this.state.postalErrorMessage}</span>
          </div>
        </div>
        <div className="row">
          { errorMessageDiv }
        </div>
        <div className="row">
          <button className="rui btn btn-lg btn-cta btn-block btn-complete-order" disabled={this.state.submitting}>
            { this.state.submitMessage }
          </button>
        </div>
      </form>
    );
  }
}

export default injectStripe(CardForm);
