import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";

const CircularProgress = ({ indeterminate }) => (
  !!indeterminate && <div className="spinner" />
);

CircularProgress.propTypes = {
  indeterminate: PropTypes.bool
};

CircularProgress.defaultProps = {
  indeterminate: true
};

registerComponent("CircularProgress", CircularProgress);

export default CircularProgress;
