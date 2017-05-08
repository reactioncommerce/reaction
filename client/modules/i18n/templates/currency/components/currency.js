import React, { Component, PropTypes } from "react";
import { Button, Divider, DropDownMenu, MenuItem } from "/imports/plugins/core/ui/client/components";

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
      value: value
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
      <Button
        icon="fa fa-caret-down"
        iconAfter={true}
        label={this.props.currentCurrency || this.state.value}
      />
    );
  }

  render() {
    return (
      <div>
        <DropDownMenu
          buttonElement={this.buttonElement()}
          onChange={this.onChange}
          value={this.props.currentCurrency || this.state.value}
        >
          <MenuItem
            label="Select Currency"
            i18nKeyLabel="currencies.select"
            disabled={true}
          />

          <Divider />

          {this.props.currencies.length > 1 && this.props.currencies.map((currency) => (
            <MenuItem
              key={currency.currency}
              label={this.currencyDisplay(currency.currency, currency.symbol)}
              value={this.currencyDisplay(currency.currency, currency.symbol)}
            />
          ))}
        </DropDownMenu>
      </div>
    );
  }
}

export default Currency;
