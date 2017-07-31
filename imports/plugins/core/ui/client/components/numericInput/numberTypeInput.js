import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Button } from "/imports/plugins/core/ui/client/components";

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
      value: props.value || props.defaultValue,
      minValue: props.minValue || 0,
      maxValue: props.maxValue || undefined,
      className: {}
    };

    this.handleIncrementButton = this.handleIncrementButton.bind(this);
    this.handleDecrementButton = this.handleDecrementButton.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * update state when component receives props
   * @param  {Object} nextProps new props
   * @return {undefined}
   */
  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
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
          <Button
            className="button"
            icon="fa fa-chevron-up"
            onClick={this.handleIncrementButton}
          />
          <br/>
          <Button
            className="button"
            icon="fa fa-chevron-down"
            onClick={this.handleDecrementButton}
          />
        </div>
      </div>
    );
  }
}

export default NumberTypeInput;
