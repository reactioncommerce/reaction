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
      value: props.value,
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

  handleIncrementButton = () => {
    const newValue = this.state.value + 1;

    if (newValue <= this.props.maxValue) {
      this.setState({
        value: newValue,
        className: { edited: true }
      });
    }
  }

  handleDecrementButton = () => {
    const newValue = this.state.value - 1;

    if (newValue >= this.props.minValue) {
      this.setState({
        value: newValue,
        className: { edited: true }
      });
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
          min={this.props.minValue || 0}
          max={this.props.maxValue || undefined}
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
