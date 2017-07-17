import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import TextareaAutosize from "react-textarea-autosize";
import { Translation } from "../translation";
import { i18next } from "/client/api";

class TextField extends Component {
  /**
   * Getter: value
   * @return {String} value for text input
   */
  get value() {
    return this.props.value || "";
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
    if (this.props.onBlur) {
      this.props.onBlur(event, event.target.value, this.props.name);
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
        className="{this.props.name}-edit-input"
        onBlur={this.onBlur}
        onChange={this.onChange}
        placeholder={placeholder}
        ref="input"
        value={this.value}
        style={this.props.style}
        disabled={this.props.disabled}
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
        onKeyDown={this.onKeyDown}
        placeholder={placeholder}
        ref="input"
        type={this.props.type || "text"}
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
        <label>
          <Translation defaultValue={this.props.label} i18nKey={this.props.i18nKeyLabel} />
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
    const message = this.validationMessage;
    let helpText = this.props.helpText;
    let i18nKey = this.props.i18nKeyHelpText;

    if (this.isValid === false && message) {
      helpText = message.message;
      i18nKey = message.i18nKeyMessage;
    }

    if (helpText) {
      return (
        <span className="help-block">
          <Translation defaultValue={helpText} i18nKey={i18nKey} />
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

TextField.defaultProps = {

};

TextField.propTypes = {
  align: PropTypes.oneOf(["left", "center", "right", "justify"]),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  helpText: PropTypes.string,
  i18nKeyHelpText: PropTypes.string,
  i18nKeyLabel: PropTypes.string,
  i18nKeyPlaceholder: PropTypes.string,
  id: PropTypes.string,
  isValid: PropTypes.bool,
  label: PropTypes.string,
  multiline: PropTypes.bool,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  onReturnKeyDown: PropTypes.func,
  placeholder: PropTypes.string,
  style: PropTypes.object,
  textFieldStyle: PropTypes.object,
  type: PropTypes.string,
  validation: PropTypes.object,
  value: PropTypes.any
};

export default TextField;
