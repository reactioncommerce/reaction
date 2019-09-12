import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Select from "react-select";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";

class MultiSelect extends Component {
  static defaultProps = {
    multi: true
  }

  static propTypes = {
    i18nKeyLabel: PropTypes.string,
    i18nKeyPlaceholder: PropTypes.string,
    id: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array,
    placeholder: PropTypes.string,
    value: PropTypes.any
  }

  renderLabel() {
    if (this.props.label) {
      const { id } = this.props;

      return (
        <label htmlFor={id}>
          <Components.Translation defaultValue={this.props.label} i18nKey={this.props.i18nKeyLabel} />
        </label>
      );
    }

    return null;
  }

  handleChange = (value) => {
    const { value: valueProp } = this.props;
    if (typeof this.props.onChange === "function") {
      if (typeof valueProp === "string") {
        this.props.onChange(value.value, this.props.name);
      } else {
        this.props.onChange(value, this.props.name);
      }
    }
  }

  render() {
    const {
      label, i18nKeyLabel, // eslint-disable-line no-unused-vars
      placeholder, i18nKeyPlaceholder,
      value: valueProp,
      options,
      ...selectProps
    } = this.props;

    const classes = classnames({
      // Base
      "rui": true,
      "multiselect": true,
      "form-group": true
    });

    const translatedPlaceholder = i18next.t(i18nKeyPlaceholder, { defaultValue: placeholder });

    let transformedValue = valueProp;
    if (typeof valueProp !== "object") {
      transformedValue = options && options.filter(({ value }) => value === valueProp);
    }

    return (
      <div className={classes}>
        {this.renderLabel()}
        <Select
          {...selectProps}
          placeholder={translatedPlaceholder}
          onChange={this.handleChange}
          options={options}
          value={transformedValue}
        />
      </div>
    );
  }
}

registerComponent("MultiSelect", MultiSelect);

export default MultiSelect;
