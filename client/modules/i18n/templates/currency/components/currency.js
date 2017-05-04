import React, { Component } from "react";
import { Button, Divider, DropDownMenu, MenuItem } from "/imports/plugins/core/ui/client/components";

class Currency extends Component {
  state = {
    value: ""
  }

  onChange = (event, value) => {
    this.setState({
      value: value
    });
    this.props.handleChange(this.state.value);
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
        label={this.state.value || this.props.currentCurrency}
      />
    );
  }

  render() {
    return (
      <div>
        {this.props.currencies.length > 1 &&
          <DropDownMenu
            buttonElement={this.buttonElement()}
            onChange={this.onChange}
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
                value={currency.currency}
                // active={currency.currency  === "USD"}
              />
            ))}
          </DropDownMenu>
        }
      </div>
    );
  }
}

export default Currency;
