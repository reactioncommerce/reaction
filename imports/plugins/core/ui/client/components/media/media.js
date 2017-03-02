import React, { Component, PropTypes } from "react";
import { IconButton } from "../";
import { SortableItem } from "../../containers";


class MediaItem extends Component {

  handleMouseEnter = (event) => {
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(event, this.props.source);
    }
  }

  handleMouseLeave = (event) => {
    if (this.props.onMouseLeave) {
      this.props.onMouseLeave(event, this.props.source);
    }
  }

  handleRemoveMedia = (event) => {
    event.stopPropagation();

    if (this.props.onRemoveMedia) {
      this.props.onRemoveMedia(this.props.source);
    }
  }

  renderRevision() {
    if (this.props.revision) {
      if (this.props.revision.changeType === "remove") {
        return (
          <IconButton icon="fa fa-eraser" />
        );
      }
      return (
        <IconButton icon="fa fa-pencil-square-o" />
      );
    }
    return undefined;
  }

  renderControls() {
    if (this.props.editable) {
      // If we have a pending remove, don't show the remove button
      if (!this.props.revision || this.props.revision.changeType !== "remove") {
        return (
          <div className="rui badge-container">
            <IconButton
              icon="fa fa-times"
              onClick={this.handleRemoveMedia}
            />
            {this.renderRevision()}
          </div>
        );
      }
      return (
          <div className="rui badge-container">
            {this.renderRevision()}
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
      <div
        className="gallery-image"
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
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
  isFeatured: PropTypes.bool,
  mediaHeight: PropTypes.number,
  mediaWidth: PropTypes.number,
  metadata: PropTypes.object,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onRemoveMedia: PropTypes.func,
  revision: PropTypes.object,
  source: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

export default SortableItem("media", MediaItem);
