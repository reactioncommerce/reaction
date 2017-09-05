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

    this.handleIncrementButton = this.handleIncrementButton.bind(this);
    this.handleDecrementButton = this.handleDecrementButton.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleIncrementButton = (event) => {
    const value = this.state.value + 1;

    if (this.state.maxValue && value <= this.state.maxValue) {
      this.setState({
        value,
        className: { edited: true }
      });
      this.handleChange(event, value);
    }
  }

  handleDecrementButton = (event) => {
    const value = this.state.value - 1;

    if (value >= this.state.minValue) {
      this.setState({
        value,
        className: { edited: true }
      });
      this.handleChange(event, value);
    }
  }

  handleChange = (event, value) => {
    if (this.props.onChange) {
      this.props.onChange(event, value);
    }
  }

  render() {
    const fieldClassName = classnames({
      "number-input-field": true,
      ...(this.state.className)
    });

    return (
      <div className="rui number-input">
        <input
          className={fieldClassName}
          min={this.state.minValue}
          max={this.state.maxValue}
          value={this.state.value}
          onChange={this.handleChange}
          type="number"
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
            onClick={this.handleDecrementButton}
          />
        </div>
      </div>
    );
  }
}

registerComponent("NumberTypeInput", NumberTypeInput);

export default NumberTypeInput;
