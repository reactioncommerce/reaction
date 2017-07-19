import React from "react";
import PropTypes from "prop-types";
import { pure } from "recompose";
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

registerComponent("CircularProgress", CircularProgress, pure);

export default CircularProgress;
