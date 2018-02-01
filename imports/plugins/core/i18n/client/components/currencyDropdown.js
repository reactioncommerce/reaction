import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class Currency extends Component {
  static propTypes = {
    currencies: PropTypes.array,
    currentCurrency: PropTypes.string,
    handleChange: PropTypes.func
  }

  state = {
    value: ""
  }

  onChange = (event, value) => {
    this.setState({
      value
    });

    this.props.handleChange(value);
  }

  currencyDisplay(value, symbol) {
    return (
      `${value} ${symbol}`
    );
  }

  buttonElement() {
    return (
      <Components.Button
        label={this.props.currentCurrency || this.state.value}
        containerStyle={{ color: "#000", fontWeight: "normal", letterSpacing: 0.8 }}
      >
        &nbsp;<i className="fa fa-caret-down" />
      </Components.Button>
    );
  }

  render() {
    return (
      <div>
        {this.props.currencies.length > 1 &&
          <Components.DropDownMenu
            buttonElement={this.buttonElement()}
            onChange={this.onChange}
            value={this.props.currentCurrency || this.state.value}
            menuStyle={{ maxHeight: 500, overflow: "auto" }}
          >
            <Components.MenuItem
              label="Select Currency"
              i18nKeyLabel="currencies.select"
              disabled={true}
            />

            <Components.Divider />

            {this.props.currencies.map((currency) => (
              <Components.MenuItem
                key={currency.currency}
                label={this.currencyDisplay(currency.currency, currency.symbol)}
                value={this.currencyDisplay(currency.currency, currency.symbol)}
              />
            ))}
          </Components.DropDownMenu>
        }
      </div>
    );
  }
}

export default Currency;
