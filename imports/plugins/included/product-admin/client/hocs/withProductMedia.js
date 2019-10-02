import React, { Component } from "react";
import PropTypes from "prop-types";
import Measure from "react-measure";
import { compose } from "recompose";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import _ from "lodash";
import { Reaction } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";

const wrapComponent = (Comp) => (
  class ProductMediaGallery extends Component {
    static propTypes = {
      editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
      id: PropTypes.string,
      media: PropTypes.arrayOf(PropTypes.object),
      placement: PropTypes.string,
      productId: PropTypes.string,
      shopId: PropTypes.string,
      variantId: PropTypes.string
    }

    // Load first image as featuredImage
    constructor(props) {
      super(props);

      this.state = {
        dimensions: {
          width: -1,
          height: -1
        },
        featuredMedia: null
      };
    }

    handleMouseEnterMedia = (event, media) => {
      const { editable } = this.props;

      // It is confusing for an admin to know what the actual featured media is if it
      // changes on hover of the other media.
      if (!editable) {
        this.setState({ featuredMedia: media });
      }
    };

    handleMouseLeaveMedia = () => {
      const { editable } = this.props;

      // It is confusing for an admin to know what the actual featured media is if it
      // changes on hover of the other media.
      if (!editable) {
        this.setState({ featuredMedia: null });
      }
    };

    render() {
      const { width, height } = this.state.dimensions;

      return (
        <Measure
          bounds
          onResize={(contentRect) => {
            this.setState({ dimensions: contentRect.bounds });
          }}
        >
          {({ measureRef }) =>
            <div ref={measureRef}>
              <Comp
                featuredMedia={this.state.featuredMedia}
                onMouseEnterMedia={this.handleMouseEnterMedia}
                onMouseLeaveMedia={this.handleMouseLeaveMedia}
                {...this.props}
                mediaGalleryHeight={height}
                mediaGalleryWidth={width}
              />
            </div>
          }
        </Measure>
      );
    }
  }
);

/**
 * resort the media in
 * @param {Array<Object>} media media to sort by priority
 * @returns {Array<Object>} sorted media
 */
function sortMedia(media) {
  const sortedMedia = _.sortBy(media, (med) => {
    const { priority } = (med && med.metadata) || {};
    if (!priority && priority !== 0) {
      return 1000;
    }
    return priority;
  });
  return sortedMedia;
}

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function composer(props, onData) {
  const { productId, variantId } = props;

  let selector = {
    "metadata.variantId": {
      $in: [variantId]
    }
  };

  // Find images for the top-level product that aren't assigned to
  // a specific variant
  if (productId && !variantId) {
    selector = {
      $and: [
        {
          "metadata.productId": {
            $in: [productId]
          }
        },
        {
          "metadata.variantId": null
        }
      ]
    };
  }

  const media = Media.findLocal(selector, {
    sort: {
      "metadata.priority": 1
    }
  });

  onData(null, {
    editable: Reaction.hasPermission(props.permission || ["createProduct", "product/admin", "product/update"]),
    media: sortMedia(media),
    shopId: Reaction.getShopId(),
    productId,
    variantId
  });
}

export default compose(
  composeWithTracker(composer),
  wrapComponent
);
