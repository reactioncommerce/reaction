import React, { Component, PropTypes} from "react";
import classnames from "classnames";
import TextareaAutosize from "react-textarea-autosize";
import { Translation } from "../translation";

class TextField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    };
  }

  state = {
    value: ""
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
   * componentWillReceiveProps - Component Lifecycle
   * @param  {Object} props Properties passed from the parent component
   * @return {Void} no return value
   */
  componentWillReceiveProps(props) {
    if (props) {
      this.setState({
        value: props.value
      });
    }
  }

  /**
   * Render a multiline input (textarea)
   * @return {JSX} jsx
   */
  renderMultilineInput() {
    return (
      <TextareaAutosize
        className="{this.props.name}-edit-input"
        onBlur={this.onBlur}
        onChange={this.onChange}
        placeholder={this.props.placeholder}
        ref="input"
        value={this.state.value}
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

    return (
      <input
        className={inputClassName}
        name={this.props.name}
        onBlur={this.onBlur}
        onChange={this.onChange}
        placeholder={this.props.placeholder}
        ref="input"
        type="text"
        value={this.state.value}
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
  i18nKeyLabel: PropTypes.string,
  label: PropTypes.string,
  multiline: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string
};

export default TextField;
