import React, { Component, PropTypes } from "react";

class MediaGallery extends Component {
  renderMedia() {
    if (this.props.media && this.props.media.length) {
      return this.props.media.map((media, index) => {
        const mediaUrl = media.url();

        return (
          <li className="gallery-image">
            <img
              alt=""
              className="img-responsive"
              key={index}
              src={mediaUrl}
            />
          </li>
        );
      });
    }
    return (
      <li className="gallery-image">
        <img
          alt=""
          className="img-responsive"
          src="/resources/placeholder.gif"
        />
      </li>
    );
  }

  render() {
    return (
      <div className="pdp media-gallery galleryDropPane">
        <ul className="gallery">
          {this.renderMedia()}
        </ul>
      </div>
    );
  }
}

MediaGallery.propTypes = {
  media: PropTypes.arrayOf(PropTypes.object)
};

export default MediaGallery;
