/* eslint no-extra-parens: 0 */
/* eslint react/prefer-es6-class: 0 */
const Tag = ReactionUI.Components.Tag;
const Tags = ReactionUI.Components.Tags;
const TagHelpers = ReactionUI.TagNav.Helpers;

const TagGroup = React.createClass({
  displayName: "Tag Group",

  propTypes: {
    editable: React.PropTypes.bool,
    onTagCreate: React.PropTypes.func,
    onTagDragAdd: React.PropTypes.func,
    onTagRemove: React.PropTypes.func,
    onTagSort: React.PropTypes.func,
    onTagUpdate: React.PropTypes.func,
    tag: ReactionCore.PropTypes.Tag
  },

  mixins: [ReactMeteorData],

  getMeteorData() {
    return {
      subTags: TagHelpers.subTags(this.props.tag) || []
    };
  },

  renderNewTagField() {
    if (this.props.editable) {
      return (
        <div className="footer">
          <Tag
            blank={true}
            onTagCreate={this.props.onTagCreate}
            parentTag={this.props.tag}
            placeholder="tags.addSubTag"
          />
        </div>
      );
    }
  },

  render() {
    return (
      <div className="rui tagnav group">
        <div className="header">
          <Tag
            editable={this.props.editable}
            onTagUpdate={this.props.onTagUpdate}
            tag={this.props.tag}
          />
        </div>
        <div className="content">
          <Tags
            editable={this.props.editable}
            onTagDragAdd={this.props.onTagDragAdd}
            onTagRemove={this.props.onTagRemove}
            onTagSort={this.props.onTagSort}
            onTagUpdate={this.props.onTagUpdate}
            parentTag={this.props.tag}
            tags={this.data.subTags}
          />
        </div>
        {this.renderNewTagField()}
      </div>
    );
  }
});

ReactionUI.TagNav.Components.TagGroup = TagGroup;
