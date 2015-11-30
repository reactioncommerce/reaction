
ProductMedia = class ProductMedia extends React.Component {

  /**
   * handleDrop
   * @summary On drop of a file onto this component, upload it
   * @param  {Event} event - Event object
   * @return {void} no return value
   */
  handleDrop = (event) => {
    ReactionCore.Media.productFileUpload(event);
  }

  /**
   * renderImage
   * @summary Render an image tag for media type "image"
   * @return {JSX} image
   */
  renderImage() {
    // TODO: Maybe not hard code this image, unless its part of this package
    const imageUrl = this.props.media || "/resources/placeholder.gif";
    return <img src={imageUrl} />;
  }

  /**
   * render
   * @return {JSX} media component
   */
  render() {
    return (
      <div className="prodict-media" onDrop={this.handleDrop}>
        {this.renderImage()}
      </div>
    );
  }
}
