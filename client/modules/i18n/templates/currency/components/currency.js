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
        label={this.props.currentCurrency || this.state.value}
        containerStyle={{ color: "#000", fontWeight: "normal", letterSpacing: 0.8 }}
      >
        &nbsp;<i className="fa fa-caret-down" />
      </Button>
    );
  }

  render() {
    return (
      <div>
        {this.props.currencies.length > 1 &&
          <DropDownMenu
            buttonElement={this.buttonElement()}
            onChange={this.onChange}
            value={this.props.currentCurrency || this.state.value}
            menuStyle={{ maxHeight: 500, overflow: "auto" }}
          >
            <MenuItem
              label="Select Currency"
              i18nKeyLabel="currencies.select"
              disabled={true}
            />

            <Divider />

            {this.props.currencies.map((currency) => (
              <MenuItem
                key={currency.currency}
                label={this.currencyDisplay(currency.currency, currency.symbol)}
                value={this.currencyDisplay(currency.currency, currency.symbol)}
              />
            ))}
          </DropDownMenu>
        }
      </div>
    );
  }
}

export default Currency;
