import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement
} from "react-stripe-elements";

class CardForm extends Component {
  static propTypes = {
    errorCodes: PropTypes.object,
    onSubmit: PropTypes.func,
    postal: PropTypes.string,
    stripe: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      cardNumberErrorMessage: "",
      CVVErrorMessage: "",
      errorMessage: "",
      expDateErrorMessage: "",
      postal: props.postal,
      postalErrorMessage: "",
      submitMessage: "Complete your order",
      submitting: false
    };
  }

  handleSubmit = (ev) => {
    const { cardNumberErrorMessage, expDateErrorMessage, CVVErrorMessage, postalErrorMessage } = this.state;
    const { onSubmit, stripe } = this.props;
    const resubmitMessage = "Resubmit payment";
    ev.preventDefault();

    if (cardNumberErrorMessage || expDateErrorMessage || CVVErrorMessage || postalErrorMessage) {
      return;
    }

    this.setState({
      submitMessage: "Submitting...",
      submitting: true
    });
    if (stripe) {
      stripe.createToken()
        .then((payload) => {
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
            return null;
          }

          return onSubmit(payload.token.id);
        })
        .catch((error) => {
          this.setState({
            errorMessage: error.message || "Something went wrong. Please try again.",
            submitMessage: resubmitMessage,
            submitting: false
          });
        });
    }
    return;
  };

  changeHasError = (change) => (change && change.error);

  handleCardNumberChange = (change) => {
    const { errorCodes } = this.props;
    if (this.changeHasError(change)) {
      this.setState({ cardNumberErrorMessage: errorCodes[change.error.code] ? errorCodes[change.error.code] : change.error.message });
    } else {
      this.setState({ cardNumberErrorMessage: "" });
    }
  }

  handleExpDateChange = (change) => {
    const { errorCodes } = this.props;
    if (this.changeHasError(change)) {
      this.setState({ expDateErrorMessage: errorCodes[change.error.code] ? errorCodes[change.error.code] : change.error.message });
    } else {
      this.setState({ expDateErrorMessage: "" });
    }
  }

  handleCVVChange = (change) => {
    const { errorCodes } = this.props;
    if (this.changeHasError(change)) {
      this.setState({ CVVErrorMessage: errorCodes[change.error.code] ? errorCodes[change.error.code] : change.error.message });
    } else {
      this.setState({ CVVErrorMessage: "" });
    }
  }

  handlePostalChange = (change) => {
    const { errorCodes } = this.props;
    if (change && change.value !== undefined) {
      this.setState({ postal: change.value });
    }
    if (this.changeHasError(change)) {
      this.setState({ postalErrorMessage: errorCodes[change.error.code] ? errorCodes[change.error.code] : change.error.message });
    } else {
      this.setState({ postalErrorMessage: "" });
    }
  }

  displayErrorMessage = () => {
    const { errorMessage } = this.state;
    if (errorMessage) {
      return (<div className="alert alert-danger">{errorMessage}</div>);
    }
    return null;
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
    const {
      cardNumberErrorMessage,
      expDateErrorMessage,
      CVVErrorMessage,
      postal,
      postalErrorMessage,
      submitMessage,
      submitting
    } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label
                className={cardNumberErrorMessage ? "stripe-label-error" : ""}
                data-i18n="checkout.formLabels.cardNumber"
                htmlFor="injected-stripe-card-number-element"
              >
                Card number
              </label>
              <CardNumberElement
                style={style}
                placeholder="XXXX XXXX XXXX XXXX"
                className="stripe-card-element"
                onChange={this.handleCardNumberChange}
                id="injected-stripe-card-number-element"
              />
              <span className="help-block stripe-help-block">{cardNumberErrorMessage}</span>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-6">
            <div className="form-group">
              <label
                className={expDateErrorMessage ? "stripe-label-error" : ""}
                data-i18n="checkout.formLabels.expDate"
                htmlFor="injected-stripe-card-expiry-element"
              >
                Expiry date
              </label>
              <CardExpiryElement
                style={style}
                className="stripe-card-element"
                onChange={this.handleExpDateChange}
                id="injected-stripe-card-expiry-element"
              />
              <span className="help-block stripe-help-block">{expDateErrorMessage}</span>
            </div>
          </div>
          <div className="col-xs-6">
            <div className="form-group">
              <label
                className={CVVErrorMessage ? "stripe-label-error" : ""}
                data-i18n="checkout.formLabels.CVV"
                htmlFor="injected-stripe-card-cvv-element"
              >
                CVV
              </label>
              <CardCVCElement
                style={style}
                placeholder="CVV"
                className="stripe-card-element"
                onChange={this.handleCVVChange}
                id="injected-stripe-card-cvv-element"
              />
              <span className="help-block stripe-help-block">{CVVErrorMessage}</span>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label
                className={postalErrorMessage ? "stripe-label-error" : ""}
                data-i18n="checkout.formLabels.postalCode"
                htmlFor="injected-stripe-card-postal-element"
              >
                Postal code
              </label>
              <PostalCodeElement
                style={style}
                className="stripe-card-element"
                onChange={this.handlePostalChange}
                value={postal}
                id="injected-stripe-card-cvv-element"
              />
              <span className="help-block stripe-help-block">{postalErrorMessage}</span>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            { this.displayErrorMessage() }
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <button className="rui btn btn-lg btn-cta btn-block btn-complete-order" disabled={submitting}>
              { submitMessage }
            </button>
          </div>
        </div>
      </form>
    );
  }
}

export default injectStripe(CardForm);
