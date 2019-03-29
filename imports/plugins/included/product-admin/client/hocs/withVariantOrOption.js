import React from "react";
import PropTypes from "prop-types";

const wrapComponent = (Comp) => {
  /**
   * The `withVariantOrOptions` HOC redirects the option prop to the variant prop if available.
   * This useful for some blocks like `VariantDetailForm` which expects `variant` prop.
   * With Variants and Options being identical in all ways but their name, this is useful for views
   * that expect a `variant`. Typically used after the `withVariant` HOC to redirect the loaded `option` to `variant`.
   * @example withVariant(withVariantOrOption(MyComponent))
   * @param {Object} props Component props
   * @returns {React.Component} A React component
   */
  function withOptions(props) {
    return <Comp {...props} variant={props.option || props.variant} />;
  }

  withOptions.propTypes = {
    option: PropTypes.object,
    variant: PropTypes.object
  };

  return withOptions;
};

export default wrapComponent;
