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
      },
      featuredMediaDimensions: {
        width: -1,
        height: -1
      }
    };
  }

  renderFeaturedMedia(featuredMedia) {
    const { featuredMediaDimensions: { width, height } } = this.state;
    if (!featuredMedia) {
      return <MediaItemCustomer />;
    }
    return (
      <Measure
        bounds
        onResize={(contentRect) => {
          const dimensions = { ...contentRect.bounds };
          // We get React warnings in console when the bounds height comes in as zero
          if (dimensions.height === 0) dimensions.height = -1;
          this.setState({
            featuredMediaDimensions: {
              height: dimensions.height,
              width: dimensions.width
            }
          });
        }}
      >
        {({ measureRef }) =>
          <div ref={measureRef}>
            <MediaItemCustomer
              mediaHeight={height}
              mediaWidth={width}
              source={this.featuredMedia}
              size="large"
              isZoomable
            />
          </div>
        }
      </Measure>
    );
  }

  renderMediaThumbnails(media) {
    const { onSelectFeaturedMedia } = this.props;
    return (media || []).map((mediaItem) => (
      <MediaItemCustomer
        key={mediaItem.priority}
        size="small"
        source={mediaItem}
        onSelectFeaturedMedia={onSelectFeaturedMedia}
      />
    ));
  }

  get featuredMedia() {
    const { featuredMedia, media } = this.props;
    if (!featuredMedia && media && media.length > 0) {
      return media[0];
    }
    return featuredMedia;
  }

  handleMouseLeave = () => {
    this.props.onSelectFeaturedMedia(null);
  }
  render() {
    const { dimensions: { width } } = this.state;
    const { media } = this.props;
    return (
      <Measure
        bounds
        onResize={(contentRect) => {
          this.setState({ dimensions: contentRect.bounds });
        }}
      >
        {({ measureRef }) =>
          <div ref={measureRef} onMouseLeave={this.handleMouseLeave}>
            <div className="rui media-gallery">
              <div className="rui gallery">
                <div className="featuredImage" style={{ height: width }}>
                  {this.renderFeaturedMedia(this.featuredMedia)}
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
  featuredMedia: PropTypes.object,
  media: PropTypes.arrayOf(PropTypes.object),
  onSelectFeaturedMedia: PropTypes.func,
  product: PropTypes.object,
  selectedOptionId: PropTypes.string,
  selectedVariantId: PropTypes.string
};

export default MediaGalleryCustomer;

registerComponent("MediaGalleryCustomer", MediaGalleryCustomer);
