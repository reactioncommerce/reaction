import React, { Component, PropTypes } from "react";

class Social extends Component {


  get product() {
    return this.props.product || {};
  }

  render() {
    return (
      <div className="social">
        Social
      </div>
    );
  }
}

export default Social;
