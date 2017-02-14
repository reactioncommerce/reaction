import React, { Component, PropTypes } from "react";
import Dropzone from "react-dropzone";
import Measure from "react-measure";
import MediaItem from "./media";

class MediaGallery extends Component {
  state = {
    dimensions: {
      width: -1,
      height: -1
    }
  };

  get hasMedia() {
    return Array.isArray(this.props.media) && this.props.media.length > 0;
  }

  get allowFeaturedMediaHover() {
    if (this.props.allowFeaturedMediaHover && this.props.featuredMedia) {
      return true;
    }

    return false;
  }

  get featuredMedia() {
    return this.props.featuredMedia || this.props.media[0];
  }

  handleDropClick = () => {
    this.refs.dropzone.open();
  }

  renderAddItem() {
    if (this.props.editable) {
      return (
        <div
          className="gallery-image add"
          onClick={this.handleDropClick}
        >
          <img
            alt=""
            className="img-responsive"
            src={"/resources/placeholder.gif"}
          />
          <div className="rui badge-container">
            <i className="fa fa-plus fa-2x" />
          </div>
        </div>
      );
    }

    return null;
  }

  renderFeaturedMedia() {
    const { width, height } = this.state.dimensions;

    if (this.hasMedia) {
      return this.props.media.map((media, index) => {
        if (index === 0) {
          return (
            <Measure
              key={index}
              onMeasure={(dimensions) => {
                this.setState({ dimensions });
              }}
            >
              <MediaItem
                editable={this.props.editable}
                index={index}
                key={index}
                revision={this.featuredMedia.revision}
                metadata={this.featuredMedia.metadata}
                onMouseEnter={this.props.onMouseEnterMedia}
                onMove={this.props.onMoveMedia}
                onRemoveMedia={this.props.onRemoveMedia}
                source={this.featuredMedia}
                mediaHeight={height}
                mediaWidth={width}
                isFeatured={true}
                {...this.props}
              />
            </Measure>
          );
        }
      });
    }

    return (
      <MediaItem />
    );
  }

  renderMediaThumbnails() {
    if (this.hasMedia) {
      return this.props.media.map((media, index) => {
        return (
          <MediaItem
            editable={this.props.editable}
            index={index}
            key={index}
            revision={media.revision}
            metadata={media.metadata}
            onMouseEnter={this.props.onMouseEnterMedia}
            onMove={this.props.onMoveMedia}
            onRemoveMedia={this.props.onRemoveMedia}
            source={media}
          />
        );
      });
    }
    return null;
  }

  renderMediaGalleryUploader() {
    const containerWidth = this.props.mediaGalleryWidth;
    let featured = this.renderAddItem();
    let gallery;

    // Only render media only if there is any
    if (this.hasMedia) {
      featured = this.renderFeaturedMedia();
      gallery = this.renderMediaThumbnails();
    }

    return (
      <div className="rui media-gallery">
        <Dropzone
          className="rui gallery-drop-pane"
          disableClick={true}
          multiple={true}
          onDrop={this.props.onDrop}
          ref="dropzone"
        >
          <div className="rui gallery">
            <div className="featuredImage" style={{ height: containerWidth + "px" }}>
              {featured}
            </div>
            <div className="rui gallery-thumbnails">
              {gallery}
              {this.renderAddItem()}
            </div>
          </div>
        </Dropzone>
      </div>
    );
  }

  renderMediaGallery() {
    const containerWidth = this.props.mediaGalleryWidth;

    return (
      <div className="rui media-gallery">
        <div className="rui gallery">
          <div className="featuredImage" style={{ height: containerWidth + "px" }}>
            {this.renderFeaturedMedia()}
          </div>
          <div className="rui gallery-thumbnails">
            {this.renderMediaThumbnails()}
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.props.editable) {
      return this.renderMediaGalleryUploader();
    }

    return this.renderMediaGallery();
  }
}

MediaGallery.propTypes = {
  allowFeaturedMediaHover: PropTypes.bool,
  editable: PropTypes.bool,
  featuredMedia: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  media: PropTypes.arrayOf(PropTypes.object),
  mediaGalleryHeight: PropTypes.number,
  mediaGalleryWidth: PropTypes.number,
  onDrop: PropTypes.func,
  onMouseEnterMedia: PropTypes.func,
  onMouseLeaveMedia: PropTypes.func,
  onMoveMedia: PropTypes.func,
  onRemoveMedia: PropTypes.func
};

export default MediaGallery;
