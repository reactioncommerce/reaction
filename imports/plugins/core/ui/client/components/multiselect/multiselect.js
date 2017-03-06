import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import Select from "react-select";
import { Translation } from "../translation";
import { i18next } from "/client/api";

class MultiSelect extends Component {
  static defaultProps = {
    multi: true,
    simpleValue: true
  }

  static propTypes = {
    i18nKeyLabel: PropTypes.string,
    i18nKeyPlaceholder: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.array, PropTypes.string])
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

  handleChange = (value) => {
    if (typeof this.props.onChange === "function") {
      this.props.onChange(value, this.props.name);
    }
  }

  render() {
    const {
      label, i18nKeyLabel, // eslint-disable-line no-unused-vars
      placeholder, i18nKeyPlaceholder,
      ...selectProps
    } = this.props;

    const classes = classnames({
      // Base
      "rui": true,
      "multiselect": true,
      "form-group": true
    });

    const translatedPlaceholder = i18next.t(i18nKeyPlaceholder, { defaultValue: placeholder });

    return (
      <div className={classes}>
        {this.renderLabel()}
        <Select
          {...selectProps}
          placeholder={translatedPlaceholder}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default MultiSelect;
