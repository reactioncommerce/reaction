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
    const { maxValue, minValue } = this.state;
    console.log("handle change", event, value)

    let newValue = parseInt(value, 10);
    console.log("new val", newValue)
    if (newValue > maxValue) newValue = maxValue;
    if (newValue < minValue) newValue = minValue;


    // TODO: comment on this handler
    this.setState({
      value: newValue,
      className: { edited: (newValue !== maxValue) }
    });

    if (this.props.onChange && !isNaN(newValue)) {
      console.log("passing back value", newValue)
      this.props.onChange(event, newValue);
    }
  }

  handleBlur = () => {
    if (isNaN(this.state.value)) {
      this.setState({
        value: this.state.maxValue
      });
    }
  }

  render() {
    console.log("state value", this.state.value)
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
