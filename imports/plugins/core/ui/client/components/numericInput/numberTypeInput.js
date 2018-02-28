import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class NumberTypeInput extends Component {
  static propTypes = {
    defaultValue: PropTypes.number,
    maxValue: PropTypes.number,
    minValue: PropTypes.number,
    onChange: PropTypes.func,
    value: PropTypes.number
  }

  constructor(props) {
    super(props);

    this.state = {
      value: props.defaultValue,
      minValue: props.minValue || 0,
      maxValue: props.maxValue || undefined,
      className: {}
    };
  }

  handleIncrementButton = (event) => {
    const value = this.state.value + 1;

    if (this.state.maxValue && value <= this.state.maxValue) {
      this.handleChange(event, value);
    }
  }

  handleDecrementButton = (event) => {
    const value = this.state.value - 1;

    if (value >= this.state.minValue) {
      this.handleChange(event, value);
    }
  }

  handleChange = (event, value) => {
    let newValue = parseInt(value, 10);
    const { maxValue, minValue } = this.state;

    // prevent the new value from being
    // greater or less than the min and max values
    if (newValue > maxValue) {
      newValue = maxValue;
    }
    if (newValue < minValue) {
      newValue = minValue;
    }

    // setting the value state
    // if a new value set edited css class
    this.setState({
      value: newValue,
      className: { edited: (newValue !== maxValue) }
    });

    // if props.onChange and the new value is a number
    if (this.props.onChange && !isNaN(newValue)) {
      this.props.onChange(event, newValue);
    }
  }

  handleBlur = (event) => {
    const { maxValue } = this.state;
    // if input is left empty reset
    // it's value to be the max value
    if (isNaN(this.state.value)) {
      this.setState({
        value: maxValue
      });
      this.props.onChange(event, maxValue);
    }
  }

  render() {
    const fieldClassName = classnames({
      "number-input-field": true,
      ...(this.state.className)
    });

    return (
      <div className="rui number-input">
        <Components.TextField
          className={fieldClassName}
          type="number"
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          maxValue={this.state.maxValue}
          minValue={this.state.minValue}
          value={this.state.value}
        />
        <div className="stacked-buttons">
          <Components.Button
            className="button"
            icon="fa fa-chevron-up"
            disabled={this.state.maxValue === this.state.value}
            onClick={this.handleIncrementButton}
          />
          <br/>
          <Components.Button
            className="button"
            icon="fa fa-chevron-down"
            disabled={this.state.minValue === this.state.value}
            onClick={this.handleDecrementButton}
          />
        </div>
      </div>
    );
  }
}

registerComponent("NumberTypeInput", NumberTypeInput);

export default NumberTypeInput;
