import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Button } from "/imports/plugins/core/ui/client/components";


class NumberTypeInput extends Component {
  static propTypes = {
    defaultValue: PropTypes.number,
    maxValue: PropTypes.number,
    minValue: PropTypes.number
  }

  state = {
    inputValue: this.props.defaultValue || 4,
    inputClassNames: classnames({ "number-field": true })
  }
  incrementButton = () => {
    const { maxValue } = this.props;
    const { inputValue } = this.state;
    const newValue = Number(inputValue) + 1;
    if (newValue <= maxValue) {
      this.edited();
      return this.setState({ inputValue: newValue });
    }
  }

  decrementButton = () => {
    const { minValue } = this.props;
    const { inputValue } = this.state;
    const newValue = Number(inputValue) - 1;
    if (newValue >= minValue) {
      this.edited();
      return this.setState({ inputValue: newValue.toString() });
    }
  }

  edited() {
    this.setState({ inputClassNames: classnames({ "number-field": true, "edited": true }) });
  }

  handleChange = (e) => {
    const value = Number(e.target.value);
    this.edited();
    return this.setState({ inputValue: value });
  }

  render() {
    const { minValue, maxValue } = this.props;
    const { inputValue, inputClassNames } = this.state;
    return (
      <div className="number-input">
        <input
          className={inputClassNames}
          min={minValue.toString() || ""}
          max={maxValue.toString() || ""}
          value={inputValue.toString()}
          onChange={this.handleChange}
          type="number"
        />
        <div className="stacked-buttons">
          <Button
            className="button"
            icon="fa fa-chevron-up"
            onClick={() => this.incrementButton()}
          />
          <br/>
          <Button
            className="button"
            icon="fa fa-chevron-down"
            onClick={() => this.decrementButton()}
          />
        </div>
      </div>
    );
  }
}

export default NumberTypeInput;
