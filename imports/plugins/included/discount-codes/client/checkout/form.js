import React, { Component, PropTypes } from "react";
import debounce from "lodash/debounce";

export default class DiscountForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discount: this.props.discount,
      validatedInput: false,
      discountApplied: false
    };

    // debounce helper so to wait on user input
    this.debounceDiscounts = debounce(() => {
      const { discount } = this.state;
      // this.setState({ discountApplied: true });
      Meteor.call("discounts/codes/apply", this.props.cartId, discount, (error, results) => {
        if (results) {
          this.setState({ discountApplied: results, discount: "" });
        } else {
          this.setState({ discountApplied: false });
        }
      });
    }, 500);

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  // handle form input
  handleChange(event) {
    this.setState({ discount: event.target.value });
    this.debounceDiscounts();
  }
  // handle display or not
  handleClick(event) {
    event.preventDefault();
    this.setState({ validatedInput: true });
  }
  // render discount applied
  renderApplied() {
    return (
      <div>
        <span data-i18n="discounts.saved">Discount applied.</span>
      </div>
    );
  }
  // render discount form
  renderDiscountForm() {
    return (
      <form>
        <label>
          <span data-i18n="discounts.discountLabel">Discount Code</span>
        </label>
        <input autoFocus value={this.state.value} onChange={this.handleChange}/>
      </form>
    );
  }
  renderDiscountLink() {
    return (
      <a onClick={this.handleClick}>
        <span data-i18n="discounts.enterItHere">Have a code? Enter it here.</span>
      </a>
    );
  }
  // render discount code input form
  render() {
    const { discountApplied, validatedInput } = this.state;
    if (discountApplied === true && validatedInput === true) {
      this.renderApplied();
    } else if (validatedInput === true) {
      this.renderDiscountForm();
    }
    this.renderDiscountLink();
  }
}

DiscountForm.propTypes = {
  cartId: PropTypes.string,
  discount: PropTypes.string
};
