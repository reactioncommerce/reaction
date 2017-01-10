import React, { Component, PropTypes } from "react";
import classnames from "classnames"
import { Translation } from "/imports/plugins/core/ui/client/components";

class Switch extends Component {
  static defaultProps = {
    checked: false
  }

  static propTypes = {
    checked: PropTypes.bool,
    i18nKeyLabel: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func
  }

  constructor(props) {
    super(props);

    this.state = {
      checked: false
    }
  }

  componentWillReceivePrps

  handleClick = () => {
    if (this.props.onChange) {
      const isInputChecked = !this.props.checked;
      this.props.onChange(event, isInputChecked, this.props.name);
    }
  }

  handleChange = (event) => {
    if (this.props.onChange) {
      const isInputChecked = !this.props.checked;
      this.props.onChange(event, isInputChecked, this.props.name);
    }
  }

  renderLabel() {
    if (this.props.checked === false && this.props.label) {
      return (
        <Translation defaultValue={this.props.label} i18nKey={this.props.i18nKeyLabel} />
      );
    } else if (this.props.checked === true && this.props.onLabel) {
      return (
        <Translation defaultValue={this.props.onLabel} i18nKey={this.props.i18nKeyOnLabel} />
      );
    }

    return (
      <Translation defaultValue={this.props.label} i18nKey={this.props.i18nKeyLabel} />
    )
  }

  checkboxRef = (ref) => {
    this._checkbox = ref
  }

  render() {
    const baseClassName = classnames({
      "rui": true,
      "switch": true
    })

    return (
      <label className={baseClassName} onClick={this.handleClick}>
        <input
          checked={this.props.checked}
          onChange={this.handleChange}
          ref={this.checkboxRef}
          type="checkbox"
        />
        <div className="switch-control"></div>
        {this.renderLabel()}
      </label>
    );
  }
}

export default Switch;
