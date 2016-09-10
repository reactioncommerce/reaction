import React, { Component, PropTypes } from "react";
import { IconButton } from "../";

class MediaGallery extends Component {
  handleRemoveMedia = (event) => {
    event.stopPropagation();

    if (this.props.onRemoveMedia) {
      this.props.onRemoveMedia(this.props.source);
    }
  }

  renderControls() {
    if (this.props.editable) {
      return (
        <div className="rui badge-container">
          <IconButton
            icon="fa fa-times"
            onClick={this.handleRemoveMedia}
          />
        </div>
      );
    }
  }

  get defaultSource() {
    return this.props.defaultSource || "/resources/placeholder.gif";
  }

  get source() {
    if (typeof this.props.source === "object") {
      return this.props.source.url() || this.defaultSource;
    }

    return this.props.source || this.defaultSource;
  }

  render() {
    return (
      <li className="gallery-image">
        <img
          alt=""
          className="img-responsive"
          src={this.source}
        />
        {this.renderControls()}
      </li>
    );
  }
}

MediaGallery.propTypes = {
  editable: PropTypes.bool,
  onRemoveMedia: PropTypes.func,
  source: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

export default MediaGallery;
