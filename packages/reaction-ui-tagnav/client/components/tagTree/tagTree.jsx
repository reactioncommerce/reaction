/* eslint no-extra-parens: 0 */
/* eslint react/prefer-es6-class: 0 */
const Tag = ReactionUI.Components.Tag;
const TagGroup = ReactionUI.TagNav.Components.TagGroup;
const TagHelpers = ReactionUI.TagNav.Helpers;
const Button = ReactionUI.Components.Button;
const Sortable = ReactionUI.Lib.Sortable;

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
  },


  handleDragSort: (event) => {
    let newTagsOrder = this.move(this.props.tags, event.oldIndex, event.newIndex);

    if (newTagsOrder) {
      let tagIds = newTagsOrder.map((tag) => {
        if (tag) {
          return tag._id;
        }
      });

      if (this.props.onTagSort) {
        // ReactDOM.unmountComponentAtNode(event.item);

        setTimeout(() => {
          this.props.onTagSort(tagIds, this.props.parentTag);
        }, 0);
      }
    }
  },

  componentDidMount() {
    if (this.props.editable) {
      const ds = (event) => {
        const oldTagsArray = this.data.subTags
        let newTagsOrder = this.move(this.data.subTags, event.oldIndex, event.newIndex);

        if (newTagsOrder) {
          let tagIds = newTagsOrder.map((tag) => {
            if (tag) {
              return tag._id;
            }
          });

          if (this.props.onTagSort) {
            setTimeout(() => {
              this.props.onTagSort(tagIds, this.props.parentTag);
            }, 0);
          }
        }
      };


      this._sortable = Sortable.create(this.refs.tagTreeContent, {
        group: "tagTree",
        onSort: ds,
        // onAdd: this.handleDragAdd,
        // onRemove: this.handleDragRemove
      });
    }
  },



  getMeteorData() {
    return {
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

  renderTagGroups() {
    if (this.data.subTags) {
      const subTagGroups = this.data.subTags.map((tag, index) => {
        return (
          <TagGroup
            editable={this.props.editable && this.state.isEditing || true}
            key={tag._id || index}
            onTagCreate={this.props.onTagCreate}
            onTagDragAdd={this.props.onTagDragAdd}
            onTagRemove={this.props.onTagRemove}
            onTagSort={this.props.onTagSort}
            onTagUpdate={this.props.onTagUpdate}
            ref="tagGroup"
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
        <div className="content" ref="tagTreeContent">
          {this.renderTagGroups()}
          {this.renderNewTagGroupField()}
        </div>
        {this.renderEditButton()}
      </div>
    );
  }
});

ReactionUI.TagNav.Components.TagTree = TagTree;
