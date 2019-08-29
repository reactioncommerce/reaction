import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import TextareaAutosize from "react-textarea-autosize";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";


class TextField extends Component {
  /**
   * Getter: value
   * @returns {String} value for text input
   */
  get value() {
    // if the props.value is not a number
    // return either the value or and empty string
    if (isNaN(this.props.value)) {
      return this.props.value || "";
    }
    return this.props.value;
  }

  /**
   * Getter: isValid
   * @returns {Boolean|undefined} true/false if field is valid from props.isValid or props.validation[this.props.name].isValid
   */
  get isValid() {
    const { isValid } = this.props;

    // Return a boolean if this field is valid, or invalid
    if (typeof isValid === "boolean") {
      return isValid;
    }

    // Return undefined if the field has not yet been validated
    // eslint-disable-next-line consistent-return
    return undefined;
  }

  get isHelpMode() {
    // TODO: add functionality to toggle helpMode on / off.
    // When on, helpText will always show.
    // When off, only validation messages will show.
    // For now, all helpText will show, meaning this doesn't affect how the app currently works.
    // This is here just to lay the foundation for when we add the toggle.

    return true;
  }

  get validationMessage() {
    const { name, validation } = this.props;

    if (typeof validation === "object" && validation.messages && validation.messages[name]) {
      return validation.messages[name];
    }

    // eslint-disable-next-line consistent-return
    return undefined;
  }

  getEventValue(event) {
    if (this.props.type === "number") {
      try {
        return Number(event.target.value);
      } catch (err) {
        return event.target.value;
      }
    }
    return event.target.value;
  }

  /**
   * onValueChange
   * @summary set the state when the value of the input is changed
   * @param  {Event} event Event object
   * @returns {void}
   */
  onChange = (event) => {
    if (this.props.onChange) {
      this.props.onChange(event, this.getEventValue(event), this.props.name);
    }
  }

  /**
   * onBlur
   * @summary set the state when the value of the input is changed
   * @param  {Event} event Event object
   * @returns {void}
   */
  onBlur = (event) => {
    if (this.props.onBlur) {
      this.props.onBlur(event, this.getEventValue(event), this.props.name);
    }
  }

  /**
   * onFocus
   * @summary set the state when the input is focused
   * @param  {Event} event Event object
   * @returns {void}
   */
  onFocus = (event) => {
    if (this.props.onFocus) {
      this.props.onFocus(event, this.getEventValue(event), this.props.name);
    }
  }

  /**
   * onKeyDown
   * @summary set the state when the value of the input is changed
   * @param  {Event} event Event object
   * @returns {void}
   */
  onKeyDown = (event) => {
    if (this.props.onKeyDown) {
      this.props.onKeyDown(event, this.props.name);
    }

    if (this.props.onReturnKeyDown && event.keyCode === 13) {
      this.props.onReturnKeyDown(event, event.target.value, this.props.name);
    }
  }

  /**
   * Render a multiline input (textarea)
   * @returns {JSX} jsx
   */
  renderMultilineInput() {
    const placeholder = i18next.t(this.props.i18nKeyPlaceholder, {
      defaultValue: this.props.placeholder
    });

    return (
      <TextareaAutosize
        className={`${this.props.name}-edit-input`}
        onBlur={this.onBlur}
        onChange={this.onChange}
        onFocus={this.onFocus}
        placeholder={placeholder}
        ref="input"
        value={this.value}
        style={this.props.style}
        disabled={this.props.disabled}
        maxRows={this.props.maxRows}
        id={this.props.id}
      />
    );
  }

  /**
   * Render a singleline input
   * @returns {JSX} jsx
   */
  renderSingleLineInput() {
    const inputClassName = classnames({
      [`${this.props.name || "text"}-edit-input`]: true
    }, this.props.className);

    const placeholder = i18next.t(this.props.i18nKeyPlaceholder, {
      defaultValue: this.props.placeholder
    });

    return (
      <input
        className={inputClassName}
        name={this.props.name}
        onBlur={this.onBlur}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onKeyDown={this.onKeyDown}
        placeholder={placeholder}
        ref="input"
        type={this.props.type || "text"}
        min={this.props.minValue}
        max={this.props.maxValue}
        value={this.value}
        style={this.props.style}
        disabled={this.props.disabled}
        id={this.props.id}
      />
    );
  }

  /**
   * Render either a multiline (textarea) or singleline (input)
   * @returns {JSX} jsx template
   */
  renderField() {
    if (this.props.multiline === true) {
      return this.renderMultilineInput();
    }

    return this.renderSingleLineInput();
  }

  /**
   * Render the label for the text field if one is provided in props
   * @returns {ReactNode|null} react node or null
   */
  renderLabel() {
    if (this.props.label || this.props.i18nKeyLabel) {
      return (
        <label htmlFor={this.props.id}>
          <Components.Translation defaultValue={this.props.label} i18nKey={this.props.i18nKeyLabel} />
        </label>
      );
    }

    return null;
  }

  /**
   * Render help text or validation message
   * @returns {ReactNode|null} react node or null
   */
  renderHelpText() {
    const helpMode = this.isHelpMode;
    const message = this.validationMessage;
    let { helpText } = this.props;
    let i18nKey = this.props.i18nKeyHelpText;

    if (this.isValid === false && message) {
      helpText = message.message;
      i18nKey = message.i18nKeyMessage;
    }

    // If this is a validation message, show even if helpMode is false
    if (this.isValid === false && message) {
      return (
        <span className="help-block">
          <Components.Translation defaultValue={helpText} i18nKey={i18nKey} />
        </span>
      );
    }

    // If this is a non-validation message, only show if helpMode is true
    if (helpMode && (helpText || i18nKey)) {
      return (
        <span className="help-block">
          <Components.Translation defaultValue={helpText} i18nKey={i18nKey} />
        </span>
      );
    }

    return null;
  }

  /**
   * Render Component
   * @returns {JSX} component
   */
  render() {
    const classes = classnames({
      // Base
      "rui": true,
      "textfield": true,
      "form-group": true,
      "has-error": this.isValid === false,
      "has-success": this.isValid === true,

      // Alignment
      "center": this.props.align === "center",
      "left": this.props.align === "left",
      "right": this.props.align === "right"
    });

    return (
      <div className={classes} style={this.props.textFieldStyle}>
        {this.renderLabel()}
        {this.renderField()}
        {this.renderHelpText()}
        <span className="product-detail-message" id="{{field}}-message" />
      </div>
    );
  }
}

TextField.propTypes = {
  align: PropTypes.oneOf(["left", "center", "right", "justify"]),
  className: PropTypes.string,
  disabled: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  helpText: PropTypes.string,
  i18nKeyHelpText: PropTypes.string,
  i18nKeyLabel: PropTypes.string,
  i18nKeyPlaceholder: PropTypes.string,
  id: PropTypes.string,
  isValid: PropTypes.bool,
  label: PropTypes.string,
  maxRows: PropTypes.number,
  maxValue: PropTypes.any,
  minValue: PropTypes.number,
  multiline: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func,
  onReturnKeyDown: PropTypes.func,
  placeholder: PropTypes.string,
  style: PropTypes.object,
  textFieldStyle: PropTypes.object,
  type: PropTypes.string,
  validation: PropTypes.object,
  value: PropTypes.any
};

registerComponent("TextField", TextField);

export default TextField;
