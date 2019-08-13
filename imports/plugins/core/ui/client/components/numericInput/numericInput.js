import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import accounting from "accounting-js";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

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
   * @returns {undefined}
   */
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
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
   * @returns {*} display value
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
   * @param {*} value input value
   * @returns {String} Formatted numeric string
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
   * @param {Number} value field's value
   * @returns {Number} unformatted value
   */
  unformat(value) {
    const unformattedValue = accounting.unformat(value, this.props.format.decimal);
    return unformattedValue;
  }

  /**
   * onBlur
   * @summary set the state when the value of the input is changed
   * @param  {Event} event Event object
   * @returns {void}
   */
  onBlur = (event) => {
    let { value } = this.state;
    if (value > this.props.maxValue) {
      value = this.props.maxValue;
    }
    this.setState({
      isEditing: false,
      value
    });
    if (this.props.onBlur) {
      const numberValue = this.unformat(value);
      this.props.onBlur(event, numberValue, this.props.name);
    }
  }

  /**
   * onKeyDown
   * @summary set the state when the value of the input is changed
   * @param  {Event} event Event object
   * @returns {void}
   */
  onKeyDown(event) {
    if (this.props.onKeyDown) {
      this.props.onKeyDown(event, this.props.name);
    }

    if (this.props.onReturnKeyDown && event.keyCode === 13) {
      const numberValue = this.unformat(event.target.value);
      this.props.onReturnKeyDown(event, numberValue, this.props.name);
    }
  }

  /**
   * Selects the text of the passed input field
   * @param {Object} ctrl input field
   * @returns {undefined}
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
   * @returns {void}
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
   * @returns {undefined}
   */
  handleChange = (event) => {
    const { value } = event.currentTarget;
    this.setState({
      value
    });

    if (this.props.onChange) {
      const numberValue = this.unformat(value);
      this.props.onChange(event, numberValue, this.props.name);
    }
  }

  /**
   * renderLabel
   * @summary Render the label for the field if one is provided in props
   * @returns {ReactNode|null} react node or null
   */
  renderLabel() {
    if (this.props.label) {
      return (
        <label htmlFor={this.props.id}>
          <Components.Translation defaultValue={this.props.label} i18nKey={this.props.i18nKeyLabel} />
        </label>
      );
    }

    return null;
  }

  /**
   * renderField
   * @summary Render input box or field
   * @returns {JSX} jsx template
   */
  renderField() {
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
      <div className="rui control numeric-input-field">
        <input
          className={fieldClassName}
          disabled={this.props.disabled}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          ref="input"
          onChange={this.handleChange}
          value={this.displayValue}
        />
      </div>
    );
  }

  /**
   * render
   * @returns {ReactElement} markup
   */
  render() {
    return (
      <div className="numeric-input">
        {this.renderLabel()}
        {this.renderField()}
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
  disabled: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  format: PropTypes.shape({
    decimal: PropTypes.string
  }),
  i18nKeyLabel: PropTypes.string,
  id: PropTypes.string,
  isEditing: PropTypes.bool,
  label: PropTypes.string,
  maxValue: PropTypes.number,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  onReturnKeyDown: PropTypes.func,
  value: PropTypes.number
};

registerComponent("NumericInput", NumericInput);

export default NumericInput;
