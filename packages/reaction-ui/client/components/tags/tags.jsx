// const React = React;
const TextField = ReactionUI.Components.TextField;
const Button = ReactionUI.Components.Button;
const Tag = ReactionUI.Components.Tag;
const classnames = ReactionUI.Lib.classnames;
const Sortable = ReactionUI.Lib.Sortable;
const ReactDOM = ReactionUI.Lib.ReactDOM;

class Tags extends React.Component {
  displayName = "Tag List (Tags)";

  componentDidMount() {
    const element = ReactDOM.findDOMNode(this.refs.tags);

    if (this.props.editable) {
      this._sortable = Sortable.create(element, {
        group: "tags",
        onSort: this.handleDragSort,
        onAdd: this.handleDragAdd,
        onRemove: this.handleDragRemove
      });
    }
  }

  handleDragAdd = (event) => {


    const fromListId = event.from.dataset.id;
    const toListId = event.to.dataset.id;
    const movedTagId = event.item.dataset.id;

    // ReactDOM.unmountComponentAtNode(event.item);
    console.log("Item", movedTagId, "Moved from list", fromListId, `(index ${event.oldIndex}`, "To list", toListId, `(index ${event.newIndex}`, "--", this.props.parentTag._id);

    if (this.props.onTagDragAdd) {
      this.props.onTagDragAdd(movedTagId, toListId, event.newIndex);
    }
  };

  handleDragRemove = (event) => {

    const fromListId = event.from.dataset.id;
    const toListId = event.to.dataset.id;
    const movedTagId = event.item.dataset.id;

    if (this.props.onTagRemove) {
      console.log("Item", movedTagId, "REMOVED from list", fromListId, `(index ${event.oldIndex}`, "To list", toListId, `(index ${event.newIndex}`, "--", this.props.parentTag._id);

      let foundTag = _.find(this.props.tags, (tag) => {
        return tag._id === movedTagId;
      });

      this.props.onTagRemove(foundTag, this.props.parentTag);
    }


  };

  handleDragSort = (event) => {
    let newTagsOrder = this.move(this.props.tags, event.oldIndex, event.newIndex);
    if (newTagsOrder) {
      let tagIds = newTagsOrder.map((tag) => {
        if (tag) {
          return tag._id;
        }
      });

      if (this.props.onTagSort) {
        this.props.onTagSort(tagIds, this.props.parentTag);
      }
    }
  };

  move(array, fromIndex, toIndex) {

    if (!_.isArray(array)) {
      return null;
    }

    while (fromIndex < 0) {
        fromIndex += array.length;
    }
    while (toIndex < 0) {
        toIndex += array.length;
    }
    if (toIndex >= this.length) {
        var k = toIndex - array.length;
        while ((k--) + 1) {
            array.push(undefined);
        }
    }

    array.splice(toIndex, 0, array.splice(fromIndex, 1)[0]);

    return array;
  };

  handleNewTagSubmit = (event) => {
    event.preventDefault();
    if (this.props.onCreateTag) {
      this.props.onCreateTag(event.target.tag.value, this.props.parentTag);
    }
  };

  handleTagCreate = (tagId, tagName) => {
    if (this.props.onTagCreate) {
      this.props.onTagCreate(tagId, tagName);
    }
  };

  handleTagRemove = (tag) => {
    if (this.props.onTagRemove) {
      this.props.onTagRemove(tag, this.props.parentTag);
    }
  };

  handleTagUpdate = (tagId, tagName) => {
    if (this.props.onTagUpdate) {
      let parentTagId;
      if (this.props.parentTag) {
        parentTagId = this.props.parentTag._id;
      }
      this.props.onTagUpdate(tagName, tagId, parentTagId);
    }
  };

  handleTagBookmark = (event) => {

  };

  renderTags() {
    if (_.isArray(this.props.tags)) {
      const tags = this.props.tags.map((tag, index) => {
        return (
          <Tag
            editable={this.props.editable}
            key={index}
            onTagBookmark={this.handleTagBookmark}
            onTagRemove={this.handleTagRemove}
            onTagUpdate={this.handleTagUpdate}
            tag={tag}
            data-id={tag._id} />
        );
      });

      // Render an blank tag for creating new tags
      if (this.props.editable && this.props.enableNewTagForm) {
        tags.push(
          <Tag
            blank={true}
            key="newTagForm"
            onTagCreate={this.handleTagCreate}
          />
        );
      }

      return tags;
    }
  }

  render() {
    const classes = classnames({
      rui: true,
      tags: true,
      edit: this.props.editable
    });

    return (
      <div className={classes} data-id={this.props.parentTag._id} ref="tags">
        {this.renderTags()}
      </div>
    );
  }
}

// Default Props
Tags.defaultProps = {
  parentTag: {}
};

// Prop Types
Tags.propTypes = {
  editable: React.PropTypes.bool,
  parentTag: ReactionCore.PropTypes.Tag,
  tags: ReactionCore.PropTypes.arrayOfTags
};

// Export
ReactionUI.Components.Tags = Tags;
