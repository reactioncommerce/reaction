/* eslint no-extra-parens: 0 */
/* eslint react/prefer-es6-class: 0 */
const Tags = ReactionUI.Components.Tags;
const TagTree = ReactionUI.TagNav.Components.TagTree;
const TagHelpers = ReactionUI.TagNav.Helpers;
const Button = ReactionUI.Components.Button;
const classnames = ReactionUI.Lib.classnames;

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
      isEditing: false,
      lockDropdown: true
    };
  },

  componentDidMount() {

  },

  componentWillUnmount() {
    handleDropdownClose(true);
  },

  getMeteorData() {
    return {
      currentTag: TagHelpers.currentTag()
    };
  },

  shouldCloseDropdown() {
    // Prevent the dropdown from changing while editing, or otherwise
    if (this.state.lockDropdown === true) {
      return false;
    }

    if ($(event.target).parents(".rui.tagnav").length === 0) {
      this.handleDropdownClose();
    }
  },

  attachBodyListener() {
    document.body.addEventListener("mouseover", this.shouldCloseDropdown);
    this.setState({attachedBodyListener: true});
  },

  handleTagTreeEditMode(isEditing) {
    this.setState({lockDropdown: isEditing || false});
  },

  handleTagCreate(tagName, parentTag) {
    TagHelpers.createTag(tagName, undefined, parentTag);
  },

  handleTagSort(tagIds, parentTag) {
    TagHelpers.sortTags(tagIds, parentTag);
  },

  handleTagDragAdd(movedTagId, toListId, toIndex, ofList) {
    TagHelpers.moveTagToNewParent(movedTagId, toListId, toIndex, ofList);
  },

  handleDropdownClose(forceClose) {
    // Prevent the dropdown from changing while editing, or otherwise
    if (this.state.lockDropdown === true && forceClose !== true) {
      return false;
    }

    if (this.state.activeTagHover) {
      const tagId = this.state.activeTagHover._id;
      const node = this.refs[`tag_${tagId}`];

      if (node) {
        node.className = classnames(event.target.className, {hidden: true});
      }

      this.setState({activeTagHover: null});
    }

    document.body.removeEventListener("mouseover", this.shouldCloseDropdown);
    this.setState({attachedBodyListener: false, lockDropdown: false});
  },

  // handleTagMouseOut(event, tag) {},
  handleTagMouseOver(event, tag) {
    // Prevent the dropdown from changing while editing, or otherwise
    if (this.state.lockDropdown === true) {
      return false;
    }

    const node = this.refs[`tag_${tag._id}`];

    if (this.state.activeTagHover) {
      if (this.state.activeTagHover._id !== tag._id) {
        this.handleDropdownClose(event, tag);
      }
    }

    this.attachBodyListener();

    this.setState({activeTagHover: tag});

    const classes = classnames({
      rui: true,
      tagnav: true,
      dropdown: true,
      hidden: false
    });

    node.className = classes;
  },

  handleTagRemove(tag, parentTag) {
    TagHelpers.removeTag(tag, parentTag);
  },

  handleTagUpdate(tagId, tagName) {
    TagHelpers.updateTag(tagId, tagName);
  },

  handleEditStateToggle() {
    this.setState({
      isEditing: !this.state.isEditing
    });
  },

  renderEditButton() {
    if (this.props.editable) {
      if (this.isEditing) {
        return (
          <Button
            className="btn btn-success edit-tag-button"
            onClick={this.handleEditStateToggle}
            title="Done"
          />
        );
      }

      return (
        <Button
          className="btn btn-default edit-tag-button"
          icon="tag"
          onClick={this.handleEditStateToggle}
          title="Edit Tags"
        />
      );
    }
  },

  renderSubTags() {
    if (this.props.tags) {
      const subTags = this.props.tags.map((tag, index) => {
        const ref = `tag_${tag._id}`;
        if (tag._id !== "Y6HERKuC2sMDiy9Yx") {
          return
        }
        return (
          <div
            className="rui tagnav dropdown"
            data-tag={ref}
            key={tag._id || index}
            ref={ref}
          >
            <TagTree
              editable={this.props.editable}
              onEditMode={this.handleTagTreeEditMode}
              onTagCreate={this.handleTagCreate}
              onTagDragAdd={this.handleTagDragAdd}
              onTagRemove={this.handleTagRemove}
              onTagSort={this.handleTagSort}
              onTagUpdate={this.handleTagUpdate}
              parentTag={tag}
            />
          </div>
        );
      });

      return subTags;
    }
  },

  render() {
    return (
      <div className="rui tagnav">
        <div className="navbar">
          <Tags
            editable={this.props.editable && this.state.isEditing}
            enableNewTagForm={this.props.editable && this.state.isEditing}
            onTagCreate={this.handleTagCreate}
            onTagDragAdd={this.handleTagDragAdd}
            onTagMouseOut={this.handleTagMouseOut}
            onTagMouseOver={this.handleTagMouseOver}
            onTagRemove={this.handleTagRemove}
            onTagSort={this.handleTagSort}
            onTagUpdate={this.handleTagUpdate}
            tags={this.props.tags}
          />
          {this.renderEditButton()}
        </div>
          {this.renderSubTags()}
      </div>
    );
  }
});

ReactionUI.TagNav.Components.TagNav = TagNav;
