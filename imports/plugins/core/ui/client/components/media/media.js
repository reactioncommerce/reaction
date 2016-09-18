import React, { Component, PropTypes } from "react";
import { IconButton } from "../";
import { SortableItem } from "../../containers";


class MediaItem extends Component {

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

    return null;
  }

  get defaultSource() {
    return this.props.defaultSource || "/resources/placeholder.gif";
  }

  get source() {
    if (typeof this.props.source === "object" && this.props.source) {
      return this.props.source.url() || this.defaultSource;
    }

    return this.props.source || this.defaultSource;
  }

  renderImage() {
    const image = (
      <img
        alt=""
        className="img-responsive"
        src={this.source}
      />
    );

    return image;
  }

  render() {
    const mediaElement = (
      <div className="gallery-image">
        {this.renderImage()}
        {this.renderControls()}
      </div>
    );

    if (this.props.editable) {
      return this.props.connectDragSource(
        this.props.connectDropTarget(
          mediaElement
        )
      );
    }

    return mediaElement;
  }
}

MediaItem.propTypes = {
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func,
  defaultSource: PropTypes.string,
  editable: PropTypes.bool,
  onRemoveMedia: PropTypes.func,
  source: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

export default SortableItem("media", MediaItem);
