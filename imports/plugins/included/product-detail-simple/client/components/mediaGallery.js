import React, { Component, PropTypes } from "react";

class MediaGallery extends Component {
  renderMedia() {
    if (this.props.media && this.props.media.length) {
      return this.props.media.map((media, index) => {
        const mediaUrl = media.url();

        return (
          <img
            alt=""
            className="img-responsive"
            key={index}
            src={mediaUrl}
          />
        );
      });
    }
    return (
      <img
        alt=""
        className="img-responsive"
        src="/resources/placeholder.gif"
      />
    );
  }

  render() {
    return (
      <div className="pdp media-gallery">
        {this.renderMedia()}
      </div>
    );
  }
}

MediaGallery.propTypes = {
  media: PropTypes.arrayOf(PropTypes.object)
};

export default MediaGallery;
