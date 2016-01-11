/* eslint no-extra-parens: 0 */
/* eslint react/prefer-es6-class: 0 */
const Tag = ReactionUI.Components.Tag;
const TagGroup = ReactionUI.TagNav.Components.TagGroup;
const TagHelpers = ReactionUI.TagNav.Helpers;
const Button = ReactionUI.Components.Button;

const TagTree = React.createClass({
  displayName: "Tag Tree",

  propTypes: {
    editable: React.PropTypes.bool,
    onEditMode: React.PropTypes.func,
    onTagCreate: React.PropTypes.func,
    onTagDragAdd: React.PropTypes.func,
    onTagRemove: React.PropTypes.func,
    onTagSort: React.PropTypes.func,
    onTagUpdate: React.PropTypes.func,
    parentTag: ReactionCore.PropTypes.Tag
  },

  mixins: [ReactMeteorData],

  getInitialState() {
    return {
      isEditing: false
    };
  },

  getMeteorData() {
    return {
      currentTag: TagHelpers.currentTag(),
      subTags: TagHelpers.subTags(this.props.parentTag)
    };
  },

  handleEditableState() {
    const isEditing = !this.state.isEditing;
    this.setState({
      isEditing: isEditing
    });

    if (this.props.onEditMode) {
      this.props.onEditMode(isEditing);
    }
  },

  renderNewTagGroupField() {
    if (this.props.editable && this.state.isEditing) {
      return (
        <div className="rui tagnav group">
          <div className="header">
            <Tag
              blank={true}
              onTagCreate={this.props.onTagCreate}
              onTagDragAdd={this.props.onTagDragAdd}
              onTagRemove={this.props.onTagRemove}
              onTagSort={this.props.onTagSort}
              onTagUpdate={this.props.onTagUpdate}
              parentTag={this.props.parentTag}
              placeholder="tags.addGroupTag"
            />
          </div>
        </div>
      );
    }
  },

  renderTagGroup() {
    if (this.data.subTags) {
      const subTagGroups = this.data.subTags.map((tag, index) => {
        return (
          <TagGroup
            editable={this.props.editable && this.state.isEditing}
            key={tag._id || index}
            onTagCreate={this.props.onTagCreate}
            onTagDragAdd={this.props.onTagDragAdd}
            onTagRemove={this.props.onTagRemove}
            onTagSort={this.props.onTagSort}
            onTagUpdate={this.props.onTagUpdate}
            tag={tag}
          />
        );
      });

      return subTagGroups;
    }
  },

  renderEditButton() {
    if (this.props.editable) {
      if (this.state.isEditing) {
        return (
          <div className="footer">
            <Button
              className="btn btn-success"
              onClick={this.handleEditableState}
              title="Done"
            />
          </div>
        );
      }

      return (
        <div className="footer">
          <Button
            className="btn btn-default"
            icon="tag"
            onClick={this.handleEditableState}
            title="Edit Sub Tags"
          />
        </div>
      );
    }
  },

  render() {
    return (
      <div className="rui tagnav tree">
        <div className="content">
          {this.renderTagGroup()}
          {this.renderNewTagGroupField()}
        </div>
        {this.renderEditButton()}
      </div>
    );
  }
});

ReactionUI.TagNav.Components.TagTree = TagTree;
