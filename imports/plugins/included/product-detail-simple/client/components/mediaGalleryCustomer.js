import React, { Component } from "react";
// import PropTypes from "prop-types";
import Measure from "react-measure";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
// import { Router } from "@reactioncommerce/reaction-router";

class MediaGalleryCustomer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dimensions: {
        width: -1,
        height: -1
      },
      featuredMedia: null,
      media: null
    };
  }

  render() {
    return (
      <div className="rui media-gallery">
        <div className="rui gallery" />
      </div>
    );
  }
}

// ProductTagsCustomer.propTypes = {
//   tags: PropTypes.arrayOf(PropTypes.object)
// };

export default MediaGalleryCustomer;

registerComponent("MediaGalleryCustomer", MediaGalleryCustomer);
