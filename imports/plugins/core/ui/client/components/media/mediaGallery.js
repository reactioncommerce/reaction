import React, { Component, PropTypes } from "react";
import Dropzone from "react-dropzone";
import MediaItem from "./media";

class MediaGallery extends Component {
  get hasMedia() {
    return Array.isArray(this.props.media) && this.props.media.length > 0;
  }

  handleDropClick = () => {
    this.refs.dropzone.open();
  }

  renderAddItem() {
    if (this.props.editable) {
      return (
        <div className="gallery-image add" onClick={this.handleDropClick}>
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

  renderMedia() {
    if (this.hasMedia) {
      return this.props.media.map((media, index) => {
        return (
          <MediaItem
            editable={this.props.editable}
            index={index}
            key={index}
            metadata={media.metadata}
            onMove={this.props.onMoveMedia}
            onRemoveMedia={this.props.onRemoveMedia}
            source={media}
          />
        );
      });
    }

    return (
      <MediaItem />
    );
  }

  renderMediaGalleryUploader() {
    let gallery;

    // Only render media only if there is any
    if (this.hasMedia) {
      gallery = this.renderMedia();
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
          <div className="gallery">
            {gallery}
            {this.renderAddItem()}
          </div>
        </Dropzone>
      </div>
    );
  }

  renderMediaGallery() {
    return (
      <div className="rui media-gallery">
        <div className="gallery">
          {this.renderMedia()}
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
  editable: PropTypes.bool,
  media: PropTypes.arrayOf(PropTypes.object),
  onDrop: PropTypes.func,
  onMoveMedia: PropTypes.func,
  onRemoveMedia: PropTypes.func
};

export default MediaGallery;
