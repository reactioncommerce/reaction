import React, { Component } from "react";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import Measure from "react-measure";
import classnames from "classnames";
import { Components } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";

class MediaGallery extends Component {
  static propTypes = {
    editable: PropTypes.bool,
    featuredMedia: PropTypes.object,
    media: PropTypes.arrayOf(PropTypes.object),
    mediaGalleryHeight: PropTypes.number,
    mediaGalleryWidth: PropTypes.number,
    onDrop: PropTypes.func,
    onMouseEnterMedia: PropTypes.func,
    onMouseLeaveMedia: PropTypes.func,
    onMoveMedia: PropTypes.func,
    onRemoveMedia: PropTypes.func,
    uploadProgress: PropTypes.shape({
      bytesUploaded: PropTypes.number.isRequired,
      bytesTotal: PropTypes.number.isRequired,
      percentage: PropTypes.number.isRequired
    })
  };

  static defaultProps = {
    onDrop() {},
    onMouseEnterMedia() {},
    onMouseLeaveMedia() {},
    onMoveMedia() {},
    onRemoveMedia() {}
  };

  constructor() {
    super();

    this.state = {
      dimensions: {
        width: -1,
        height: -1
      }
    };
  }

  get hasMedia() {
    const { media } = this.props;

    return Array.isArray(media) && media.length > 0;
  }

  get featuredMedia() {
    return this.props.featuredMedia || this.props.media[0];
  }

  handleDropClick = () => {
    this.dropzone && this.dropzone.open();
  };

  handleDrop = (files) => {
    if (files.length === 0) return;
    return this.props.onDrop(files);
  };

  renderAddItem() {
    if (this.props.editable) {
      return (
        <Components.Button
          className={{
            // Disable default button class names
            "flat": false,
            "btn": false,
            "btn-default": false,

            // Media gallery class names
            "gallery-image": true,
            "add": true
          }}
          tagName="div"
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
        </Components.Button>
      );
    }

    return null;
  }

  renderProgressItem() {
    // For now, we are not showing actual progress, but we could
    return (
      <div className="gallery-image add">
        <img
          alt=""
          className="img-responsive"
          src={"/resources/placeholder.gif"}
        />
        <div className="rui badge-container">
          <Components.CircularProgress indeterminate={true} />
        </div>
      </div>
    );
  }

  renderFeaturedMedia() {
    const { editable, onMouseEnterMedia, onMoveMedia, onRemoveMedia } = this.props;
    const { width, height } = this.state.dimensions;

    const media = this.featuredMedia;
    if (!media) return <Components.MediaItem />;

    return (
      <Measure
        bounds
        onResize={(contentRect) => {
          const dimensions = { ...contentRect.bounds };

          // We get React warnings in console when the bounds height comes in as zero
          if (dimensions.height === 0) dimensions.height = -1;

          this.setState({ dimensions });
        }}
      >
        {({ measureRef }) =>
          <div ref={measureRef}>
            <Components.MediaItem
              editable={editable}
              index={0} // index prop is required for SortableItem HOC to work
              mediaHeight={height}
              mediaWidth={width}
              onMouseEnter={onMouseEnterMedia}
              onMove={onMoveMedia}
              onRemoveMedia={onRemoveMedia}
              source={this.featuredMedia}
              zoomable
            />
          </div>
        }
      </Measure>
    );
  }

  renderMediaThumbnails() {
    const { editable, media: mediaList, onMouseEnterMedia, onMoveMedia, onRemoveMedia } = this.props;

    return (mediaList || []).map((media, index) => (
      <Components.MediaItem
        editable={editable}
        key={media._id}
        index={index} // index prop is required for SortableItem HOC to work
        onMouseEnter={onMouseEnterMedia}
        onMove={onMoveMedia}
        onRemoveMedia={onRemoveMedia}
        size="small"
        source={media}
      />
    ));
  }

  renderMediaGalleryUploader() {
    const { mediaGalleryWidth: containerWidth, uploadProgress } = this.props;
    const classes = {
      "admin-featuredImage": Reaction.hasAdminAccess(),
      "featuredImage": true
    };

    return (
      <div className="rui media-gallery">
        <Dropzone
          className="rui gallery-drop-pane"
          disableClick
          multiple
          disablePreview
          onDrop={this.handleDrop}
          ref={(inst) => { this.dropzone = inst; }}
          accept="image/jpg, image/png, image/jpeg"
        >
          <div className="rui gallery">
            <div className={classnames(classes)} style={{ height: containerWidth }}>
              {this.featuredMedia ? this.renderFeaturedMedia() : this.renderAddItem()}
            </div>
            <div className="rui gallery-thumbnails">
              {!!this.hasMedia && this.renderMediaThumbnails()}
              {!!uploadProgress && this.renderProgressItem()}
              {this.renderAddItem()}
            </div>
          </div>
        </Dropzone>
      </div>
    );
  }

  renderMediaGallery() {
    const containerWidth = this.props.mediaGalleryWidth;
    const classes = {
      "admin-featuredImage": Reaction.hasAdminAccess(),
      "featuredImage": true
    };

    return (
      <div className="rui media-gallery">
        <div className="rui gallery">
          <div className={classnames(classes)} style={{ height: containerWidth }}>
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
    const { editable } = this.props;

    let gallery;
    if (editable) {
      gallery = this.renderMediaGalleryUploader();
    } else {
      gallery = this.renderMediaGallery();
    }

    // Note that only editable mode actually uses drag-drop, but since both views render
    // MediaItems, which are SortableItems, there is an error if it isn't in the ancester tree
    return (
      <Components.DragDropProvider>
        {gallery}
      </Components.DragDropProvider>
    );
  }
}

export default MediaGallery;
