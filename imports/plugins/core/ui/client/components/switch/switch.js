import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class Switch extends Component {
  static defaultProps = {
    checked: false
  }

  static propTypes = {
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    helpText: PropTypes.string,
    i18nKeyHelpText: PropTypes.string,
    i18nKeyLabel: PropTypes.string,
    i18nKeyOnLabel: PropTypes.string,
    id: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
    onLabel: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      checked: false
    };
  }

  get isHelpMode() {
    // TODO: add functionality to toggle helpMode on / off.
    // When on, helpText will always show.
    // When off, only validation messages will show.
    // For now, all helpText will show, meaning this doesn't affect how the app currently works.
    // This is here just to lay the foundation for when we add the toggle.

    return true;
  }

  handleChange = (event) => {
    if (this.props.onChange) {
      const isInputChecked = !this.props.checked;
      this.props.onChange(event, isInputChecked, this.props.name);
    }
  }

  renderLabel() {
    let labelElement;

    if (this.props.checked === false && this.props.label) {
      labelElement = (
        <Components.Translation defaultValue={this.props.label} i18nKey={this.props.i18nKeyLabel} />
      );
    } else if (this.props.checked === true && this.props.onLabel) {
      labelElement = (
        <Components.Translation defaultValue={this.props.onLabel} i18nKey={this.props.i18nKeyOnLabel} />
      );
    } else if (this.props.label) {
      labelElement = (
        <Components.Translation defaultValue={this.props.label} i18nKey={this.props.i18nKeyLabel} />
      );
    }

    if (labelElement) {
      return (
        <div className="control-label">
          {labelElement}
        </div>
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
    const { helpText } = this.props;
    const i18nKey = this.props.i18nKeyHelpText;

    // Show if helpMode is true
    if (helpText && helpMode) {
      return (
        <span className="help-block">
          <Components.Translation defaultValue={helpText} i18nKey={i18nKey} />
        </span>
      );
    }

    return null;
  }

  checkboxRef = (ref) => {
    this._checkbox = ref;
  }

  render() {
    const { id } = this.props;

    const baseClassName = classnames({
      rui: true,
      switch: true,
      disabled: this.props.disabled
    });

    const switchControlClassName = classnames({
      "switch-control": true,
      "active": this.props.checked
    });

    return (
      <span>
        <label className={baseClassName} htmlFor={id}>
          <input
            id={id}
            checked={this.props.checked}
            onChange={this.handleChange}
            ref={this.checkboxRef}
            type="checkbox"
          />
          <div className={switchControlClassName} />
          {this.renderLabel()}
        </label>
        {this.renderHelpText()}
      </span>
    );
  }
}

registerComponent("Switch", Switch);

export default Switch;
