const TextField = ReactionUI.Components.TextField;
const Button = ReactionUI.Components.Button;
const TagSchema = ReactionCore.Schemas.Tag.newContext();

class Tag extends React.Component {
  displayName: "Tag"

  /**
   * Handle tag create events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagCreate = (event) => {
    event.preventDefault();

    if (this.props.onTagCreate) {
      this.props.onTagCreate(event.target.tag.value);
    }
  }

  /**
   * Handle tag bookmark events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagBookmark = () => {
    if (this.props.onTagBookmark) {
      this.props.onTagBookmark(this.props.tag._id);
    }
  }

  /**
   * Handle tag remove events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagRemove = () => {
    if (this.props.onTagRemove) {
      this.props.onTagRemove(this.props.tag._id);
    }
  }

  /**
   * Handle tag update events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagUpdate = (event) => {
    if (this.props.onTagBookmark && event.keycode === 13) {
      this.props.onTagBookmark(this.props.tag._id, event.target.value);
    }
  }

  /**
   * Render a simple tag for display purposes only
   * @return {JSX} simple tag
   */
  renderTag() {
    return (
      <span className="rui tag">{this.props.tag.name}</span>
    );
  }

  /**
   * Render an admin editable tag
   * @return {JSX} editable tag
   */
  renderEditableTag() {
    return (
      <div className="rui tag edit">
        <Button icon="bars" />
        <TextField onKeyDown={this.handleTagUpdate} value={this.props.tag.name} />
        <Button icon="bookmark" onClick={this.handleTagBookmark} />
        <Button icon="times-circle" onClick={this.handleTagRemove} status="danger" />
      </div>
    );
  }

  /**
   * Render a tag creation form
   * @return {JSX} blank tag for creating new tags
   */
  renderBlankEditableTag() {
    return (
      <div className="rui tag edit create">
        <form onSubmit={this.handleTagCreate}>
          <TextField i18nPlaceholder="addTag" name="tag" />
          <Button icon="plus" />
        </form>
      </div>
    );
  }

  /**
   * Render component
   * @return {JSX} tag component
   */
  render() {
    if (this.props.editable) {
      return this.renderEditableTag();
    } else if (this.props.blank) {
      return this.renderBlankEditableTag();
    }

    return renderTag();
  }
}

Tag.propTypes = {
  blank: React.PropTypes.bool,
  editable: React.PropTypes.bool,

  // Event handelers
  onTagBookmark: React.PropTypes.func,
  onTagCreate: React.PropTypes.func,
  onTagRemove: React.PropTypes.func,
  onTagUpdate: React.PropTypes.func,

  tag: (props, propName) => {
    if (TagSchema.validate(props[propName]) === false) {
      return new Error("Tag must be of type: ReactionCore.Schemas.Tag");
    }
  }
};

ReactionUI.Components.Tag = Tag;
