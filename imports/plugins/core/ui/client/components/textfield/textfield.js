import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import TextareaAutosize from "react-textarea-autosize";
import { unformat } from "accounting-js";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { i18next, formatPriceString } from "/client/api";


class TextField extends Component {
  constructor(props) {
    super(props);
    if (props.isCurrency) {
      this.state = {
        value: formatPriceString(props.value),
        isEditing: false
      };
    } else {
      this.state = {};
    }
  }

  /**
   * Getter: value
   * @return {String} value for text input
   */
  get value() {
    if (this.props.isCurrency && !this.state.isEditing) {
      return (this.state && this.state.value) || this.props.value || "";
    }
    // if the props.value is not a number
    // return ether the value or and empty string
    if (isNaN(this.props.value)) {
      return this.props.value || "";
    }
    return this.props.value;
  }

  /**
   * Getter: isValid
   * @return {Boolean} true/false if field is valid from props.isValid or props.valitation[this.props.name].isValid
   */
  get isValid() {
    const { isValid } = this.props;

    if (typeof isValid === "boolean") {
      return isValid;
    } else if (this.validationMessage) {
      return false;
    }

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

    return undefined;
  }

  /**
   * onValueChange
   * @summary set the state when the value of the input is changed
   * @param  {Event} event Event object
   * @return {void}
   */
  onChange = (event) => {
    if (this.props.onChange) {
      this.props.onChange(event, event.target.value, this.props.name);
    }
  }

  /**
   * onBlur
   * @summary set the state when the value of the input is changed
   * @param  {Event} event Event object
   * @return {void}
   */
  onBlur = (event) => {
    if (this.props.isCurrency) {
      this.setState({
        value: formatPriceString(event.target.value),
        isEditing: false
      });
    }
    if (this.props.onBlur) {
      this.props.onBlur(event, event.target.value, this.props.name);
    }
  }

  /**
   * onFocus
   * @summary set the state when the input is focused
   * @param  {Event} event Event object
   * @return {void}
   */
  onFocus = (event) => {
    if (this.props.isCurrency) {
      event.target.value = unformat(event.target.value);
      this.setState({
        value: event.target.value,
        isEditing: true
      });
    }
    if (this.props.onFocus) {
      this.props.onFocus(event, event.target.value, this.props.name);
    }
  }

  /**
   * onKeyDown
   * @summary set the state when the value of the input is changed
   * @param  {Event} event Event object
   * @return {void}
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
   * @return {JSX} jsx
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
   * @return {JSX} jsx
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
   * @return {JSX} jsx template
   */
  renderField() {
    if (this.props.multiline === true) {
      return this.renderMultilineInput();
    }

    return this.renderSingleLineInput();
  }

  /**
   * Render the label for the text field if one is provided in props
   * @return {ReactNode|null} react node or null
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
   * Render help text or validation message
   * @return {ReactNode|null} react node or null
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
    if (helpText && helpMode) {
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
   * @return {JSX} component
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
  disabled: PropTypes.bool,
  helpText: PropTypes.string,
  i18nKeyHelpText: PropTypes.string,
  i18nKeyLabel: PropTypes.string,
  i18nKeyPlaceholder: PropTypes.string,
  id: PropTypes.string,
  isCurrency: PropTypes.bool,
  isValid: PropTypes.bool,
  label: PropTypes.string,
  maxRows: PropTypes.number,
  maxValue: PropTypes.any,
  minValue: PropTypes.number,
  multiline: PropTypes.bool,
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
