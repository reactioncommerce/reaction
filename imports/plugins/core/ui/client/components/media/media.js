import React, { Component } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import ReactImageMagnify from "react-image-magnify";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { SortableItem } from "../../containers";
import Hint from "./hint";

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
          <Components.IconButton
            icon="fa"
            status="danger"
            i18nKeyTooltip="admin.mediaGallery.removedImage"
            tooltip="Image has been deleted. Publish to save changes."
            kind="mediaGalleryStatus"
          />
        );
      }
      return (
        <Components.IconButton
          icon="fa"
          status="info"
          i18nKeyTooltip="admin.mediaGallery.addedImage"
          tooltip="This is a new image. Publish to save changes."
          kind="mediaGalleryStatus"
        />
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
            {this.renderRevision()}
            <Components.IconButton
              icon="fa fa-times"
              onClick={this.handleRemoveMedia}
              i18nKeyTooltip="admin.mediaGallery.deleteImage"
              tooltip="Click to remove image"
            />
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

  renderSource = (size) => {
    let sourceSize = "&store=large";
    if (size) {
      sourceSize = `&store=${size}`;
    }

    if (typeof this.props.source === "object" && this.props.source) {
      return `${this.props.source.url()}${sourceSize}` || `${this.defaultSource}${sourceSize}`;
    }

    return `${this.props.source}${sourceSize}` || `${this.defaultSource}${sourceSize}`;
  }

  renderImage() {
    if (this.props.zoomable && !this.props.editable) {
      return (
        <ReactImageMagnify {...{
          smallImage: {
            width: this.props.mediaWidth,
            height: this.props.mediaHeight,
            src: this.renderSource("large")
          },
          imageClassName: "img-responsive",
          fadeDurationInMs: 150,
          hoverDelayInMs: 200,
          pressDuration: 300,
          largeImage: {
            src: this.renderSource("large"),
            width: this.props.mediaWidth * 2,
            height: this.props.mediaHeight * 2
          },
          isHintEnabled: true,
          enlargedImageContainerClassName: "zoomed-image-container",
          hintTextMouse: "Hover to zoom",
          hintTextTouch: "Long-touch to zoom",
          hintComponent: Hint
        }}
        />
      );
    }
    return (
      <img
        alt=""
        className="img-responsive"
        src={this.renderSource("large")}
      />
    );
  }

  render() {
    const classes = {
      "gallery-image": true,
      "no-fade-on-hover": this.props.zoomable && !this.props.editable,
      "admin-gallery-image": Reaction.hasAdminAccess()
    };
    const mediaElement = (
      <div
        className={classnames(classes)}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {this.renderImage()}
        {this.renderControls()}
      </div>
    );

    if (this.props.editable) {
      return this.props.connectDragSource(this.props.connectDropTarget(mediaElement));
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
  source: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  zoomable: PropTypes.bool
};

registerComponent("MediaItem", MediaItem, SortableItem("media"));

export default SortableItem("media")(MediaItem);
