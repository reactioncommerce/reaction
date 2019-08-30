import React, { Component } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import ReactImageMagnify from "react-image-magnify";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import Hint from "./hint";

class MediaItem extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func,
    defaultSource: PropTypes.string,
    editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    mediaHeight: PropTypes.number,
    mediaWidth: PropTypes.number,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onRemoveMedia: PropTypes.func,
    size: PropTypes.string,
    source: PropTypes.object,
    zoomable: PropTypes.bool // eslint-disable-line react/boolean-prop-naming
  };

  static defaultProps = {
    defaultSource: "/resources/placeholder.gif",
    editable: false,
    onClick() {},
    onMouseEnter() {},
    onMouseLeave() {},
    onRemoveMedia() {},
    size: "large",
    zoomable: false
  };

  handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    this.props.onClick();
  };

  handleKeyPress = (event) => {
    if (event.keyCode === 13) this.handleClick(event);
  };

  handleMouseEnter = (event) => {
    const { onMouseEnter, source } = this.props;
    onMouseEnter(event, source);
  }

  handleMouseLeave = (event) => {
    const { onMouseLeave, source } = this.props;
    onMouseLeave(event, source);
  }

  handleRemoveMedia = (event) => {
    const { onRemoveMedia, source } = this.props;

    event.stopPropagation();
    onRemoveMedia(source);
  }

  renderRevision() {
    const { source } = this.props;
    const { revision } = source || {};

    if (!revision) return null;

    if (revision.changeType === "remove") {
      return (
        <Components.IconButton
          icon="fa"
          status="danger"
          i18nKeyTooltip="reactionUI.components.mediaGallery.removedImage"
          tooltip="Image has been deleted. Publish to save changes."
          kind="mediaGalleryStatus"
        />
      );
    }

    return (
      <Components.IconButton
        icon="fa"
        status="info"
        i18nKeyTooltip="reactionUI.components.mediaGallery.addedImage"
        tooltip="This is a new image. Publish to save changes."
        kind="mediaGalleryStatus"
      />
    );
  }

  renderControls() {
    const { editable, source } = this.props;

    if (!editable) return null;

    const { revision } = source || {};

    // If we have a pending remove, don't show the remove button
    let removeButton = null;
    if (!revision || revision.changeType !== "remove") {
      removeButton = (
        <Components.IconButton
          icon="fa fa-times"
          onClick={this.handleRemoveMedia}
          i18nKeyTooltip="reactionUI.components.mediaGallery.deleteImage"
          tooltip="Click to remove image"
        />
      );
    }

    return (
      <div className="rui badge-container">
        {this.renderRevision()}
        {removeButton}
      </div>
    );
  }

  getSource = (size) => {
    const { defaultSource, source } = this.props;

    return (source && source.url({ store: size })) || defaultSource;
  };

  renderImage() {
    const { editable, mediaHeight, mediaWidth, size, zoomable } = this.props;

    if (zoomable && !editable) {
      return (
        <ReactImageMagnify {...{
          smallImage: {
            width: mediaWidth,
            height: mediaHeight,
            src: this.getSource(size)
          },
          imageClassName: "img-responsive",
          fadeDurationInMs: 150,
          hoverDelayInMs: 200,
          pressDuration: 300,
          largeImage: {
            src: this.getSource("image"),
            width: mediaWidth * 2,
            height: mediaHeight * 2
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
        src={this.getSource(size)}
      />
    );
  }

  render() {
    const { editable, zoomable } = this.props;

    const classes = {
      "gallery-image": true,
      "no-fade-on-hover": zoomable && !editable,
      "admin-gallery-image": Reaction.hasAdminAccess()
    };

    const mediaElement = (
      <div
        className={classnames(classes)}
        onClick={this.handleClick}
        onKeyPress={this.handleKeyPress}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        role="button"
        tabIndex={0}
      >
        {this.renderImage()}
        {this.renderControls()}
      </div>
    );

    if (editable) {
      return mediaElement;
    }

    return mediaElement;
  }
}

registerComponent("MediaItem", MediaItem);

export default MediaItem;
