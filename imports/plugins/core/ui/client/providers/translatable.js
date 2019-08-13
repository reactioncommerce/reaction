import React from "react";
import PropTypes from "prop-types";

/**
 * @returns {Component} translatable component
 */
export default function Translatable() {
  return (Component) => {
    const TranslatableComponent = (props, context) => {
      const { translations } = context;

      return <Component translations={translations} {...props} />;
    };

    TranslatableComponent.contextTypes = {
      translations: PropTypes.object.isRequired
    };

    return TranslatableComponent;
  };
}
