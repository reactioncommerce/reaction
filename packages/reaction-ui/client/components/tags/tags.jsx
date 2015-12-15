// const React = React;
const TextField = ReactionUI.Components.TextField;
const Button = ReactionUI.Components.Button;
const Tag = ReactionUI.Components.Tag;
// const Sortable = ReactionUI.Lib.Sortable;
const classnames = ReactionUI.Lib.classnames;
const Sortable = ReactionUI.Lib.Sortable;
const ReactDOM = ReactionUI.Lib.ReactDOM;

// const Sortable = ReactionUI.Lib.Sortable;
// const ReactDOM = ReactionUI.Lib.ReactDOM;

class Tags extends React.Component {
  displayName = "Tag List (Tags)"

  componentDidMount() {
    const element = ReactDOM.findDOMNode(this.refs.tags);
    this._sortable = Sortable.create(element, {
      onSort: this.handleSort
    });
  }

  handleSort = (event) => {
    console.log("sorted!!", event);
    console.log("sorted -- exact --", event.to);


    let newTagsOrder = this.move(this.props.tags, event.oldIndex, event.newIndex)


    let tagIds = newTagsOrder.map((tag) => {
      return tag._id
    })
    // let hashtagsList = [];
    // let uiPositions = $(this).sortable("toArray", {
    //   attribute: "data-tag-id"
    // });
    // for (let tag of uiPositions) {
    //   if (_.isEmpty(tag) === false) {
    //     hashtagsList.push(tag);
    //   }
    // }

    if (this.props.onTagSort) {
      this.props.onTagSort(tagIds)
    }
  }

  move(array, fromIndex, toIndex) {

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
  }

  handleNewTagSubmit = (event) => {
    event.preventDefault();
    if (this.props.onCreateTag) {
      this.props.onCreateTag(event.target.tag.value);
    }
  }

  handleTagCreate = (tagId) => {
    if (this.props.onTagCreate) {
      this.props.onTagCreate(tagId);
    }
  }

  handleTagRemove = (tagId) => {
    if (this.props.onTagRemove) {
      this.props.onTagRemove(tagId);
    }
  }

  handleTagUpdate = (event) => {

  }

  handleTagBookmark = (event) => {

  }

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
      if (this.props.editable) {
        // tags.push(
        //   <Tag
        //     blank={true}
        //     onTagCreate={this.handleTagCreate}
        //   />
        // );
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
      <div className={classes} ref="tags">
        {this.renderTags()}
      </div>
    );
  }
}

// Prop Types
Tags.propTypes = {
  editable: React.PropTypes.bool,
  tags: React.PropTypes.arrayOf(ReactionCore.Schemas.Tag)
};

// Export
ReactionUI.Components.Tags = Tags;
