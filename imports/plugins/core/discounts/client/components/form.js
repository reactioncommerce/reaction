import React, { Component } from "react";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";
import { Translation } from "/imports/plugins/core/ui/client/components";
import { Components } from "@reactioncommerce/reaction-components";

export default class DiscountForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discount: this.props.discount,
      validationMessage: null,
      validatedInput: this.props.validatedInput || false,
      attempts: 0,
      discountApplied: false
    };
    // debounce helper so to wait on user input
    this.debounceDiscounts = debounce(() => {
      this.setState({ validationMessage: "" });
      const { discount } = this.state;
      // handle discount code validation messages after attempt to apply
      Meteor.call("discounts/codes/apply", this.props.id, discount, this.props.collection, (error, result) => {
        if (error) {
          Alerts.toast(i18next.t(error.reason), "error");
        }

        if (typeof result === "object") {
          this.setState({ validationMessage: result });
        } else if (result !== 1) {
          // if validationMessage isn't an object with i18n
          // we will display an elliptical that's not
          // actually done here though, just bit of foolery
          this.timerId = Meteor.setTimeout(() => {
            this.setState({ validationMessage: "..." });
          }, 2000);
        }
      });
    }, 800);

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillUnmount() {
    if (this.timerId) Meteor.clearInterval(this.timerId);
  }

  // handle apply
  renderApplied() {
    return (
      <Components.Button
        className={{
          "btn": false,
          "btn-default": false
        }}
        tagName="span"
        label="Discount submitted."
        i18nKeyLabel="discounts.submitted"
        onClick={this.handleClick}
      />
    );
  }

  // handle keydown and change events
  handleChange(event) {
    const { attempts } = this.state;
    // ensure we don't submit on enter
    if (event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();
    }
    // clear input if user hits escape key
    if (event.keyCode === 27) {
      return this.setState({ discount: "", validatedInput: false, attempts: 0, discountApplied: false, validationMessage: null });
    }
    this.setState({
      discount: event.target.value,
      attempts: attempts + 1
    });
    // TODO: this.debounce doesn't always need to exec we should add some logic to determine based on attempts or some other
    // cleverness if now is a good time to apply the code.
    this.debounceDiscounts();
  }

  // handle display or not
  handleClick(event) {
    event.preventDefault();
    this.setState({ validatedInput: true });
  }

  // loader button
  loader() {
    const { attempts, discount, validationMessage } = this.state;
    let loader;
    if (validationMessage && validationMessage.i18nKeyLabel && attempts > 3) {
      loader = <Translation defaultValue={validationMessage.i18nKeyLabel} i18nKey={validationMessage.i18nKey}/>;
    } else if (validationMessage) {
      loader = <i className="fa fa-ellipsis-h fa-fw"/>;
    } else if (discount && discount.length >= 10 && attempts >= 12) {
      loader = <i className="fa fa-stop-circle fa-fw"/>;
    } else if (discount && discount.length >= 2 && attempts >= 2) {
      loader = <i className="fa fa-circle-o-notch fa-spin fa-fw"/>;
    } else {
      loader = <i className="fa fa-search fa-fw"/>;
    }

    return loader;
  }

  // render discount form
  renderDiscountForm() {
    return (
      <form>
        <label htmlFor="discount-url">
          <Translation defaultValue="Discount Code" i18nKey="discounts.discountLabel"/>
        </label>
        <div className="input-group">
          <input
            onChange={this.handleChange}
            onKeyDown={this.handleChange}
            className="form-control"
            id="discount-input"
            aria-describedby="discount-input-addon"
          />
          <span className="input-group-addon" id="discount-input-addon">
            {this.loader()}
          </span>
        </div>
      </form>
    );
  }
  // have a code link
  renderDiscountLink() {
    return (
      <Components.Button
        className={{
          "btn": false,
          "btn-default": false
        }}
        tagName="span"
        label="Have a code? Enter it here."
        i18nKeyLabel="discounts.enterItHere"
        onClick={this.handleClick}
      />
    );
  }

  // render discount code input form
  render() {
    const { discountApplied, validatedInput } = this.state;
    if (discountApplied === true && validatedInput === true) {
      return this.renderApplied();
    } else if (validatedInput === true) {
      return this.renderDiscountForm();
    }
    return this.renderDiscountLink();
  }
}

DiscountForm.propTypes = {
  collection: PropTypes.string,
  discount: PropTypes.string,
  id: PropTypes.string,
  validatedInput: PropTypes.bool
};
