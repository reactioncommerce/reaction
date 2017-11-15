import React, { Component } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import { SortableItem } from "../../containers";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";

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
        height={this.props.mediaHeight}
      />
    );

    return image;
  }

  render() {
    const classes = { "gallery-image": true, "admin-gallery-image": Reaction.hasAdminAccess() };
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

registerComponent("MediaItem", MediaItem, SortableItem("media"));

export default SortableItem("media")(MediaItem);
