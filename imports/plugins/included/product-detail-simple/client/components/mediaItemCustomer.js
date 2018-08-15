import React, { Component } from "react";
import ReactImageMagnify from "react-image-magnify";
import classnames from "classnames";
import PropTypes from "prop-types";
import Hint from "/imports/plugins/core/ui/client/components/media/hint";

class MediaItemCustomer extends Component {
  renderImage() {
    const { isZoomable, mediaHeight, mediaWidth, size } = this.props;
    if (isZoomable) {
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
            src: this.getSource("original"),
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

  getSource = (size) => {
    const defaultSource = "/resources/placeholder.gif";
    const { source } = this.props;
    return (source && source.URLs[size]) || defaultSource;
  };

  handleSelectFeaturedMedia = () => {
    const { isZoomable, source, onSelectFeaturedMedia } = this.props;
    if (!isZoomable) {
      onSelectFeaturedMedia(source);
    }
  }

  render() {
    const { isZoomable } = this.props;
    const classes = {
      "gallery-image": true,
      "no-fade-on-hover": isZoomable
    };

    return (
      <div
        className={classnames(classes)}
        onClick={this.handleSelectFeaturedMedia}
        onKeyPress={this.handleSelectFeaturedMedia}
        onMouseEnter={this.handleSelectFeaturedMedia}
        role="button"
        tabIndex={0}
      >
        {this.renderImage()}
      </div>
    );
  }
}

MediaItemCustomer.propTypes = {
  isZoomable: PropTypes.bool,
  mediaHeight: PropTypes.number,
  mediaWidth: PropTypes.number,
  onSelectFeaturedMedia: PropTypes.func,
  size: PropTypes.string,
  source: PropTypes.object
};

export default MediaItemCustomer;
