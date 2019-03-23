import React from "react";
import PropTypes from "prop-types";

const wrapComponent = (Comp) => {
  /**
   * withOptions HOC
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
