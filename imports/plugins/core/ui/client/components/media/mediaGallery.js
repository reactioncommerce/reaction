import React, { Component, PropTypes } from "react";
import Dropzone from "react-dropzone";
import MediaItem from "./media";

class MediaGallery extends Component {

  renderMedia() {
    if (Array.isArray(this.props.media) && this.props.media.length) {
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
    return (
      <div className="rui media-gallery">
        <Dropzone
          className="rui gallery-drop-pane"
          disableClick={true}
          multiple={true}
          onDrop={this.props.onDrop}
        >
          <div className="gallery">
            {this.renderMedia()}
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
  onMove: PropTypes.func,
  onMoveMedia: PropTypes.func,
  onRemoveMedia: PropTypes.func
};

export default MediaGallery;
