import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Translation } from "/imports/plugins/core/ui/client/components";

class Switch extends Component {
  static defaultProps = {
    checked: false
  }

  static propTypes = {
    checked: PropTypes.bool,
    i18nKeyLabel: PropTypes.string,
    i18nKeyOnLabel: PropTypes.string,
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
        <Translation defaultValue={this.props.label} i18nKey={this.props.i18nKeyLabel} />
      );
    } else if (this.props.checked === true && this.props.onLabel) {
      labelElement = (
        <Translation defaultValue={this.props.onLabel} i18nKey={this.props.i18nKeyOnLabel} />
      );
    } else if (this.props.label) {
      labelElement = (
        <Translation defaultValue={this.props.label} i18nKey={this.props.i18nKeyLabel} />
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

  checkboxRef = (ref) => {
    this._checkbox = ref;
  }

  render() {
    const baseClassName = classnames({
      rui: true,
      switch: true
    });

    const switchControlClassName = classnames({
      "switch-control": true,
      "active": this.props.checked
    });

    return (
      <label className={baseClassName}>
        <input
          checked={this.props.checked}
          onChange={this.handleChange}
          ref={this.checkboxRef}
          type="checkbox"
        />
        <div className={switchControlClassName} />
        {this.renderLabel()}
      </label>
    );
  }
}

export default Switch;
