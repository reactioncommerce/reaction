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
      allowEdit: false
    };
  },

  getMeteorData() {
    return {
      currentTag: TagHelpers.currentTag(),
      subTags: TagHelpers.subTags(this.props.parentTag)
    };
  },

  handleEditableState() {
    this.setState({
      allowEdit: !this.state.allowEdit
    });
  },

  renderNewTagGroupField() {
    if (this.props.editable && this.state.allowEdit) {
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
    const subTagGroups = this.data.subTags.map((tag, index) => {
      return (
        <TagGroup
          editable={this.props.editable && this.state.allowEdit}
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
  },

  renderEditButton() {
    if (this.props.editable) {
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
