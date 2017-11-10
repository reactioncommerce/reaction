import React, { Component } from "react";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import Measure from "react-measure";
import classnames from "classnames";
import { Components } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";

class MediaGallery extends Component {
  constructor() {
    super();
    this.state = {
      dimensions: {
        width: -1,
        height: -1
      }
    };
    this.onDrop = this.onDrop.bind(this);
  }

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

  onDrop(files) {
    if (files.length === 0) {
      return;
    }
    return this.props.onDrop(files);
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
              bounds
              onResize={(contentRect) => {
                this.setState({ dimensions: contentRect.bounds });
              }}
            >
              {({ measureRef }) =>
                <div ref={measureRef}>
                  <Components.MediaItem
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
                </div>
              }
            </Measure>
          );
        }
      });
    }

    return (
      <Components.MediaItem />
    );
  }

  renderMediaThumbnails() {
    if (this.hasMedia) {
      return this.props.media.map((media, index) => {
        return (
          <Components.MediaItem
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
    const classes = { "admin-featuredImage": Reaction.hasAdminAccess() };
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
          disablePreview={true}
          onDrop={this.onDrop}
          ref="dropzone"
          accept="image/jpg, image/png, image/jpeg"
        >
          <div className="rui gallery">
            <div className={classnames(classes)} style={{ height: containerWidth + "px" }}>
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
    const classes = { "admin-featuredImage": Reaction.hasAdminAccess() };

    return (
      <div className="rui media-gallery">
        <div className="rui gallery">
          <div className={classnames(classes)} style={{ height: containerWidth + "px" }}>
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
