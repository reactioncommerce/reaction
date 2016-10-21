import React, { PropTypes } from "react";

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
