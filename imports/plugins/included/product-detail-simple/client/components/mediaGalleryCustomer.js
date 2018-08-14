import React, { Component } from "react";
import PropTypes from "prop-types";
import Measure from "react-measure";
import { registerComponent } from "@reactioncommerce/reaction-components";
import MediaItemCustomer from "./mediaItemCustomer";

class MediaGalleryCustomer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dimensions: {
        width: -1,
        height: -1
      }
    };
  }

  getMedia() {
    const { product, selectedOptionId, selectedVariantId } = this.props;
    if (product && selectedVariantId) {
      const selectedVariant = product.variants.find((variant) => variant._id === selectedVariantId);
      if (selectedVariant.primaryImage) {
        let featuredImage = selectedVariant.primaryImage;
        let mediaList = selectedVariant.media;
        if (selectedOptionId) {
          const selectedOption = selectedVariant.options.find((option) => option._id === selectedOptionId);
          if (selectedOption.primaryImage) {
            featuredImage = selectedOption.primaryImage;
            mediaList = selectedOption.media;
          }
        }
        return { media: mediaList, featuredImage };
      }
    }
    return {};
  }
  renderFeaturedMedia(featuredImage) {
    if (!featuredImage) {
      return <MediaItemCustomer />;
    }
    return <MediaItemCustomer source={featuredImage} size="large" isZoomable />;
  }

  renderMediaThumbnails(media) {
    return (media || []).map((mediaItem) => (
      <MediaItemCustomer
        key={mediaItem._id}
        size="small"
        source={mediaItem}
      />
    ));
  }

  render() {
    const { dimensions: { height, width } } = this.state;
    const { featuredImage, media } = this.getMedia();
    return (
      <Measure
        bounds
        onResize={(contentRect) => {
          this.setState({ dimensions: contentRect.bounds });
        }}
      >
        {({ measureRef }) =>
          <div ref={measureRef}>
            <div className="rui media-gallery">
              <div className="rui gallery">
                <div className="featuredImage" style={{ height: width }}>
                  {this.renderFeaturedMedia(featuredImage)}
                </div>
                <div className="rui gallery-thumbnails">
                  {this.renderMediaThumbnails(media)}
                </div>
              </div>
            </div>
          </div>
        }
      </Measure>
    );
  }
}

MediaGalleryCustomer.propTypes = {
  product: PropTypes.object,
  selectedOptionId: PropTypes.string,
  selectedVariantId: PropTypes.string
};

export default MediaGalleryCustomer;

registerComponent("MediaGalleryCustomer", MediaGalleryCustomer);
