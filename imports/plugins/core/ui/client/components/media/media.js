import React, { Component, PropTypes } from "react";

class Media extends React.Component {
  constructor(props) {
    super(props);

    this.handleDrop = this.handleDrop.bind(this);
  }

  /**
   * handleDrop
   * @summary On drop of a file onto this component, upload it
   * @param  {Event} event - Event object
   * @return {void} no return value
   */
  handleDrop(event) {
    this.props.onDrop &&
    this.props.onDrop(event);
  }

  /**
   * renderImage
   * @summary Render an image tag for media type "image"
   * @return {node} image
   */
  renderImage() {
    // TODO: Maybe not hard code this image, unless its part of this package
    const imageUrl = this.props.media || "/resources/placeholder.gif";
    return <img src={imageUrl} />;
  }

  /**
   * render
   * @return {node} media component
   */
  render() {
    return (
      <div className="rui media" onDrop={this.handleDrop}>
        {this.renderImage()}
      </div>
    );
  }
}

Media.propTypes = {
  media: PropTypes.object,
  onDrop: PropTypes.func
};

export default Media;
