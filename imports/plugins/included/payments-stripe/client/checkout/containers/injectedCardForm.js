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
    stripe: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      errorMessage: "",
      submitMessage: "Confirm your order"
    };
  }

  handleSubmit = (ev) => {
    const resubmitMessage = "Resubmit payment";
    ev.preventDefault();
    this.setState({ submitMessage: "Submitting..." });
    if (this.props.stripe) {
      this.props.stripe.createToken().then((payload) => {
        if (payload.error) {
          this.setState({
            errorMessage: payload.error.message,
            submitMessage: resubmitMessage
          });
          return;
        }
        Meteor.apply("stripe/payment/createCharges", ["authorize", payload.token, this.props.cartId], {
          onResultReceived: (error, result) => {
            if (error) {
              this.setState({
                errorMessage: error,
                submitMessage: resubmitMessage
              });
            } else if (result.success) {
              Router.go("cart/completed", {}, {
                _id: this.props.cartId
              });
            } else {
              this.setState({
                errorMessage: result.error,
                submitMessage: resubmitMessage
              });
            }
          }
        });
        return;
      }).catch(() => {
        this.setState({
          errorMessage: "Something went wrong. Please try again.",
          submitMessage: resubmitMessage
        });
        return;
      });
    }
    return;
  };

  render() {
    const style = {
      base: {
        fontSize: "14px",
        color: "#595959",
        fontFamily: "'Source Sans Pro', Roboto, 'Helvetica Neue', Helvetica, sans-serif",
        lineHeight: "20px",
        height: "34px"
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
          <label>Card number</label>
          <CardNumberElement
            style={style}
            placeholder="XXXX XXXX XXXX XXXX"
            className="card-element"
          />
        </div>
        <div className="row">
          <div className="col-xs-6">
            <label>Expiry date</label>
            <CardExpiryElement
              style={style}
              className="card-element"
            />
          </div>
          <div className="col-xs-6">
            <label>CVV</label>
            <CardCVCElement
              style={style}
              placeholder="CVV"
              className="card-element"
            />
          </div>
        </div>
        <div className="row">
          <label>Postal code</label>
          <PostalCodeElement
            style={style}
            className="card-element"
          />
        </div>
        { errorMessageDiv }
        <button className="rui btn btn-lg btn-cta btn-block btn-complete-order">
          { this.state.submitMessage }
        </button>
      </form>
    );
  }
}

export default injectStripe(CardForm);
