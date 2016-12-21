import React, { Component, PropTypes } from "react";
import debounce from "lodash/debounce";
import { Meteor } from "meteor/meteor";
import { Translation } from "/imports/plugins/core/ui/client/components";

export default class DiscountForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discount: this.props.discount,
      validatedInput: false,
      attempts: 0,
      discountApplied: false
    };

    // debounce helper so to wait on user input
    this.debounceDiscounts = debounce(() => {
      const { discount } = this.state;
      // TODO discounts/codes/apply input error handling, validation.
      Meteor.call("discounts/codes/apply", this.props.id, discount, this.props.collection);
    }, 500);

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  // handle apply
  renderApplied() {
    return (
      <a onClick={this.handleClick}>
        <Translation defaultValue="Discount submitted." i18nKey="discounts.submitted"/>
      </a>
    );
  }

  // handle keydown and change events
  handleChange(event) {
    const { attempts } = this.state;
    // clear input if user hits escape key
    if (event.keyCode === 27) {
      return this.setState({
        discount: "",
        validatedInput: false,
        attempts: 0,
        discountApplied: false
      });
    }
    this.setState({ discount: event.target.value, attempts: attempts + 1 });
    // TODO: this.debounce doesn't always need to exec
    // we should add some logic to determine based on attempts
    // or some other cleverness if now is a good time to apply the code.
    return this.debounceDiscounts();
  }

  // handle display or not
  handleClick(event) {
    event.preventDefault();
    this.setState({ validatedInput: true });
  }

  // loader button
  loader() {
    const { attempts, discount } = this.state;
    let loader;
    if (discount && discount.length >= 10 && attempts >= 12) {
      loader = <i className="fa fa-circle fa-fw warning"/>;
    } else if (discount && discount.length >= 2 && attempts >= 2) {
      loader = <i className="fa fa-circle-o-notch fa-spin fa-fw"/>;
    } else {
      loader = <i className="fa fa-search"/>;
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
          <input autoFocus
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
      <a onClick={this.handleClick}>
        <Translation defaultValue="Have a code? Enter it here." i18nKey="discounts.enterItHere" />
      </a>
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
  id: PropTypes.string
};
