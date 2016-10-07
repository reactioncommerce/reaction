import React, { Component, PropTypes} from "react";
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
        placeholder={placeholder}
        ref="input"
        type="text"
        value={this.value}
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

  renderHelpText() {
    if (this.props.helpText) {
      return (
        <span className="help-block">
          <Translation defaultValue={this.props.helpText} i18nKey={this.props.i18nKeyHelpText} />
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

      // Alignment
      "center": this.props.align === "center",
      "left": this.props.align === "left",
      "right": this.props.align === "right"
    });

    return (
      <div className={classes}>
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
  helpText: PropTypes.string,
  i18nKeyHelpText: PropTypes.string,
  i18nKeyLabel: PropTypes.string,
  i18nKeyPlaceholder: PropTypes.string,
  label: PropTypes.string,
  multiline: PropTypes.bool,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string
};

export default TextField;
