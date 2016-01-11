/* eslint no-extra-parens: 0 */
/* eslint react/prefer-es6-class: 0 */
const Tag = ReactionUI.Components.Tag;
const Tags = ReactionUI.Components.Tags;
const TagTree = ReactionUI.TagNav.Components.TagTree;
const TagHelpers = ReactionUI.TagNav.Helpers;
const Button = ReactionUI.Components.Button;

// TODO: User ES6 Classes when Meteor 1.3 is in use.
const TagNav = React.createClass({
  displayName: "TagNav - Main Navigation",

  propTypes: {
    editable: React.PropTypes.bool,
    tags: ReactionCore.PropTypes.arrayOfTags
  },

  mixins: [ReactMeteorData],

  getInitialState() {
    return {
      allowEdit: false
    };
  },

  getMeteorData() {
    return {
      currentTag: TagHelpers.currentTag()
    };
  },

  handleTagCreate(tagName, parentTag) {
    TagHelpers.createTag(tagName, undefined, parentTag);
  },

  handleTagSort(tagIds, parentTag) {
    TagHelpers.sortTags(tagIds, parentTag);
  },

  handleTagDragAdd(movedTagId, toListId, toIndex) {
    TagHelpers.moveTagToNewParent(movedTagId, toListId, toIndex);
  },

  handleTagRemove(tag, parentTag) {
    TagHelpers.removeTag(tag, parentTag);
  },

  handleTagUpdate(tagId, tagName) {
    TagHelpers.updateTag(tagId, tagName);
  },

  handleEditStateToggle() {
    this.setState({
      allowEdit: !this.state.allowEdit
    });
  },

  renderEditButton() {
    if (this.props.editable) {
      return (
        <Button
          className="btn btn-default edit-tag-button"
          icon="tag"
          onClick={this.handleEditStateToggle}
          title="Edit Tag"
        />
      );
    }
  },

  render() {
    const currentTag = this.props.tags[1]

    return (
      <div className="rui tagnav">
        <div className="navbar">
          <Tags
            editable={this.props.editable && this.state.allowEdit}
            enableNewTagForm={this.props.editable && this.state.allowEdit}
            onTagCreate={this.handleTagCreate}
            onTagDragAdd={this.handleTagDragAdd}
            onTagRemove={this.handleTagRemove}
            onTagSort={this.handleTagSort}
            onTagUpdate={this.handleTagUpdate}
            tags={this.props.tags}
          />
        </div>
        <div className="rui tagnav dropdown">
          <TagTree
            editable={this.props.editable}
            onTagCreate={this.handleTagCreate}
            onTagDragAdd={this.handleTagDragAdd}
            onTagRemove={this.handleTagRemove}
            onTagSort={this.handleTagSort}
            onTagUpdate={this.handleTagUpdate}
            parentTag={currentTag}
          />
        </div>
      </div>
    );
  }
});

ReactionUI.TagNav.Components.TagNav = TagNav;
