import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import accounting from "accounting-js";
import { registerComponent } from "@reactioncommerce/reaction-components";


class NumericInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      isEditing: false
    };
  }

  /**
   * update state when component receives props
   * @param  {Object} nextProps new props
   * @return {undefined}
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== undefined && !this.state.isEditing) {
      const value = this.format(nextProps.value);
      this.setState({
        value
      });
    }
  }

  /**
   * Gets the displayed value. If in edit mode,
   * the field's value is not formatted. If not in
   * edit mode, the field gets formatted according to chosen locale.
   * @returns {*}
   */
  get displayValue() {
    const { value } = this.state;
    if (this.state.isEditing) {
      return value;
    }
    return this.format(value);
  }

  /**
   * Format this inputs value to a numeric string
   * @return {String} Formatted numeric string
   */
  format(value) {
    const moneyFormat = Object.assign({}, this.props.format);
    if (this.state.isEditing) {
      moneyFormat.symbol = ""; // No currency sign in edit mode
    }
    const unformattedValue = this.unformat(value);
    const formatted = accounting.formatMoney(unformattedValue, moneyFormat).trim();
    return formatted;
  }

  /**
   * Get the field's value as rational number
   * @param { Number } the field's value
   */
  unformat(value) {
    const unformattedValue = accounting.unformat(value, this.props.format.decimal);
    return unformattedValue;
  }

  /**
   * onBlur
   * @summary set the state when the value of the input is changed
   * @param  {Event} event Event object
   * @return {void}
   */
  onBlur = () => {
    let { value } = this.state;
    if (value > this.props.maxValue) {
      value = this.props.maxValue;
    }
    this.setState({
      isEditing: false,
      value
    });
  }

  /**
   * Selects the text of the passed input field
   * @param ctrl
   */
  selectAll(ctrl) {
    if (ctrl.setSelectionRange) {
      ctrl.setSelectionRange(0, ctrl.value.length);
    }
  }

  /**
   * onFocus
   * @summary set the state when the input is focused
   * @param  {Event} event Event object
   * @return {void}
   */
  onFocus = (event) => {
    const { currentTarget } = event;
    this.setState({
      isEditing: true
    }, () => {
      this.setState({
        value: this.format(this.state.value)
      }, () => {
        this.selectAll(currentTarget);
      });
    });
  }

  /**
   * Handle change event from text input
   * @param  {SyntheticEvent} event Change event
   * @return {undefined}
   */
  handleChange = (event) => {
    const { value } = event.currentTarget;
    this.setState({
      value
    });

    if (this.props.onChange) {
      const numberValue = this.unformat(value);
      this.props.onChange(event, { value, numberValue });
    }
  }

  /**
   * render
   * @return {ReactElement} markup
   */
  render() {
    const { classNames } = this.props;

    if (this.props.isEditing === false) {
      const textValueClassName = classnames({
        rui: true,
        text: true,
        ...(classNames.text || {})
      });

      return (
        <span className={textValueClassName}>
          {this.displayValue}
        </span>
      );
    }

    const fieldClassName = classnames({
      "form-control": true, // eslint-disable-line: quote-props
      ...(classNames.input || {})
    });

    return (
      <div className="rui control numeric-input">
        <input
          className={fieldClassName}
          disabled={this.props.disabled}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onChange={this.handleChange}
          value={this.displayValue}
        />
      </div>
    );
  }
}

NumericInput.defaultProps = {
  disabled: false,
  isEditing: true,
  classNames: {}
};

NumericInput.propTypes = {
  classNames: PropTypes.shape({}),
  disabled: PropTypes.bool,
  format: PropTypes.shape({
    decimal: PropTypes.number
  }),
  isEditing: PropTypes.bool,
  maxValue: PropTypes.number,
  onChange: PropTypes.func,
  value: PropTypes.number
};

registerComponent("NumericInput", NumericInput);

export default NumericInput;
