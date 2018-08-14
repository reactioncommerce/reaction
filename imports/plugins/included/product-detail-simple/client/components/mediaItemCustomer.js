import React, { Component } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";

class MediaItemCustomer extends Component {
  renderImage() {
    const { size } = this.props;
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

  render() {
    const classes = {
      "gallery-image": true,
      "no-fade-on-hover": true // TODO: should be true only for featured media
    };

    return (
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
      </div>
    );
  }
}

MediaItemCustomer.propTypes = {
  isZoomable: PropTypes.bool,
  size: PropTypes.string,
  source: PropTypes.object
};

export default MediaItemCustomer;
