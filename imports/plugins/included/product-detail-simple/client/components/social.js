import React, { Component, PropTypes } from "react";
import MediaGallery from "./mediaGallery";
import NumericInput from "/imports/plugins/core/ui/client/components/"

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
