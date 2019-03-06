import React, { Component } from "react";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import { Components } from "@reactioncommerce/reaction-components";
import withProductMedia from "../hocs/withProductMedia";

class ProductMediaGallery extends Component {
  static propTypes = {
    editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    media: PropTypes.arrayOf(PropTypes.object),
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
    onDrop() { },
    onMouseEnterMedia() { },
    onMouseLeaveMedia() { },
    onMoveMedia() { },
    onRemoveMedia() { }
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

  handleDropClick = () => {
    this.dropzone && this.dropzone.open();
  };

  handleDrop = (files) => {
    if (files.length === 0) return;
    this.props.onDrop(files);
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

  renderMediaThumbnails() {
    const { editable, media: mediaList, onMouseEnterMedia, onMouseLeaveMedia, onMoveMedia, onRemoveMedia } = this.props;

    return (mediaList || []).map((media, index) => (
      <Components.MediaItem
        editable={editable}
        key={media._id}
        index={index} // index prop is required for SortableItem HOC to work
        onMouseEnter={onMouseEnterMedia}
        onMouseLeave={onMouseLeaveMedia}
        onMove={onMoveMedia}
        onRemoveMedia={onRemoveMedia}
        size="small"
        source={media}
      />
    ));
  }

  renderMediaGalleryUploader() {
    const { uploadProgress } = this.props;
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
    return (
      <div className="rui media-gallery">
        <div className="rui gallery">
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
    // MediaItems, which are SortableItems, there is an error if it isn't in the ancestor tree
    return (
      <div>
        {gallery}
      </div>
    );
  }
}

export default withProductMedia(ProductMediaGallery);
