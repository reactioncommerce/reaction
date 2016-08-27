import React, { Component, PropTypes} from "react";
import classnames from "classnames";
import TextareaAutosize from "react-textarea-autosize";

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
    this.setState({
      value: event.target.value
    });

    if (this.props.onChange) {
      this.props.onChange(event);
    }
  }

  /**
   * onValueChange
   * @summary set the state when the value of the input is changed
   * @param  {Event} event Event object
   * @return {void}
   */
  onValueChange = (event) => {
    this.setState({
      value: event.target.value
    });

    if (this.props.onValueChange) {
      this.props.onValueChange(event);
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
        placeholder={this.props.placeholder}
        value={this.state.value}
        onChange={this.onValueChange}
      />
    );
  }

  /**
   * Render a singleline input
   * @return {JSX} jsx
   */
  renderSingleLineInput() {
    const classes = classnames({
      "form-control": true,
      [`${this.props.name || "text"}-edit-input`]: true
    }, this.props.className);

    return (
      <input
        type="text"
        className="{this.props.name}-edit-input"
        {...this.props}
        value={this.state.value}
        onChange={this.onChange}
        onBlur={this.onValueChange}
        placeholder={this.props.placeholder}

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
   * Render Component
   * @return {JSX} component
   */
  render() {
    const classes = classnames({
      // Base
      rui: true,
      textfield: true,

      // Alignment
      center: this.props.align === "center",
      left: this.props.align === "left",
      right: this.props.align === "right"
    });

    return (
      <div className={classes}>
        {this.renderField()}
        <span className="product-detail-message" id="{{field}}-message"></span>
      </div>
    );
  }
}

TextField.defaultProps = {
  align: "left"
};

TextField.propTypes = {
  align: PropTypes.oneOf(["left", "center", "right", "justify"]),
  name: PropTypes.string
};

export default TextField;
