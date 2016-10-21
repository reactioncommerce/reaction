import React, { Component, PropTypes } from "react";

class CircularProgress extends Component {
  renderInderterminateProgress() {
    return (
      <div className="spinner" />
    );
  }

  render() {
    if (this.props.indetermate === true) {
      return this.renderInderterminateProgress();
    }

    return null;
  }
}

CircularProgress.propTypes = {
  indetermate: PropTypes.bool
};

CircularProgress.defaultProps = {
  indetermate: true
};

export default CircularProgress;
