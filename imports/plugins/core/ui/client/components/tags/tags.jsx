// /* eslint no-extra-parens: 0 */
// import React from "react";
// import { PropTypes } from "/lib/api";
// const Tag = ReactionUI.Components.Tag;
// const classnames = ReactionUI.Lib.classnames;
// const Sortable = ReactionUI.Lib.Sortable;
//
// class Tags extends React.Component {
//   displayName = "Tag List (Tags)";
//
//   constructor(props) {
//     super(props);
//     this.state = {
//       isEditing: true,
//       tags: props.tags,
//       tagIds: props.tags.map((tag) => tag._id)
//     };
//   }
//
//   componentDidMount() {
//     if (this.props.editable) {
//       this._sortable = Sortable.create(this.refs.tags, {
//         group: "tags",
//         onSort: this.handleDragSort,
//         onAdd: this.handleDragAdd,
//         onRemove: this.handleDragRemove
//       });
//     }
//   }
//
//   componentWillReceiveProps(props) {
//     this.setState({
//       tags: this.props.tags,
//       tagIds: this.props.tags.map((tag) => tag._id)
//     });
//
//     if (props.editable && this.state.isEditing) {
//       if (this._sortable) {
//         // this._sortable.option("disabled", false);
//       } else {
//         this._sortable = Sortable.create(this.refs.tags, {
//           group: "tags",
//           onSort: this.handleDragSort,
//           onAdd: this.handleDragAdd,
//           onRemove: this.handleDragRemove
//         });
//       }
//     }
//   }
//
//   handleDragAdd = (event) => {
//     const toListId = event.to.dataset.id;
//     const movedTagId = event.item.dataset.id;
//
//     this.setState({
//       tagIds: [
//         ...this.state.tagsIds,
//         movedTagId
//       ]
//     });
//
//     if (this.props.onTagDragAdd) {
//       this.props.onTagDragAdd(movedTagId, toListId, event.newIndex, this.props.tags);
//     }
//   };
//
//   handleDragRemove = (event) => {
//     const movedTagId = event.item.dataset.id;
//
//     if (this.props.onTagRemove) {
//       let foundTag = _.find(this.props.tags, (tag) => {
//         return tag._id === movedTagId;
//       });
//
//       this.props.onTagRemove(foundTag, this.props.parentTag);
//     }
//   };
//
//   handleDragSort = (event) => {
//     let newTagsOrder = this.move(this.state.tagIds, event.oldIndex, event.newIndex);
//
//     if (newTagsOrder) {
//       if (this.props.onTagSort) {
//         this.props.onTagSort(newTagsOrder, this.props.parentTag);
//       }
//     }
//   };
//
//   move(array, from, to) {
//     let fromIndex = from;
//     let toIndex = to;
//
//     if (!_.isArray(array)) {
//       return null;
//     }
//
//     while (fromIndex < 0) {
//       fromIndex += array.length;
//     }
//     while (toIndex < 0) {
//       toIndex += array.length;
//     }
//     if (toIndex >= this.length) {
//       let k = toIndex - array.length;
//       while ((k--) + 1) {
//         array.push(undefined);
//       }
//     }
//
//     array.splice(toIndex, 0, array.splice(fromIndex, 1)[0]);
//
//     return array;
//   }
//
//   handleNewTagSubmit = (event) => {
//     event.preventDefault();
//     if (this.props.onTagCreate) {
//       this.props.onTagCreate(event.target.tag.value, this.props.parentTag);
//     }
//   };
//
//   handleTagCreate = (tagId, tagName) => {
//     if (this.props.onTagCreate) {
//       this.props.onTagCreate(tagId, tagName);
//     }
//   };
//
//   handleTagRemove = (tag) => {
//     if (this.props.onTagRemove) {
//       this.props.onTagRemove(tag, this.props.parentTag);
//     }
//   };
//
//   /**
//    * Handle tag mouse out events and pass them up the component chain
//    * @param  {Event} event Event object
//    * @param  {Tag} tag Reaction.Schemas.Tag - a tag object
//    * @return {void} no return value
//    */
//   handleTagMouseOut = (event, tag) => {
//     if (this.props.onTagMouseOut) {
//       this.props.onTagMouseOut(event, tag);
//     }
//   };
//
//   /**
//    * Handle tag mouse over events and pass them up the component chain
//    * @param  {Event} event Event object
//    * @param  {Tag} tag Reaction.Schemas.Tag - a tag object
//    * @return {void} no return value
//    */
//   handleTagMouseOver = (event, tag) => {
//     if (this.props.onTagMouseOver) {
//       this.props.onTagMouseOver(event, tag);
//     }
//   };
//
//
//   handleTagUpdate = (tagId, tagName) => {
//     if (this.props.onTagUpdate) {
//       let parentTagId;
//       if (this.props.parentTag) {
//         parentTagId = this.props.parentTag._id;
//       }
//       this.props.onTagUpdate(tagId, tagName, parentTagId);
//     }
//   };
//
//   handleTagBookmark = (event) => {
//     event;
//     // handle event
//   };
//
//   renderTags() {
//     if (_.isArray(this.state.tags)) {
//       const tags = this.state.tags.map((tag, index) => {
//         if (tag) {
//           return (
//             <Tag
//               data-id={tag._id}
//               editable={this.props.editable}
//               key={tag._id || index}
//               onTagBookmark={this.handleTagBookmark}
//               onTagMouseOut={this.handleTagMouseOut}
//               onTagMouseOver={this.handleTagMouseOver}
//               onTagRemove={this.handleTagRemove}
//               onTagUpdate={this.handleTagUpdate}
//               tag={tag}
//             />
//           );
//         }
//       });
//
//       // Render an blank tag for creating new tags
//       if (this.props.editable && this.props.enableNewTagForm) {
//         tags.push(
//           <Tag
//             blank={true}
//             key="newTagForm"
//             onTagCreate={this.handleTagCreate}
//           />
//         );
//       }
//
//       return tags;
//     }
//   }
//
//   render() {
//     if (this.state.isEditing === false && this._sortable) {
//       this._sortable.option("disabled", true);
//     }
//
//     const classes = classnames({
//       rui: true,
//       tags: true,
//       edit: this.props.editable
//     });
//
//     return (
//       <div
//         className={classes}
//         data-id={this.props.parentTag._id}
//         ref="tags"
//       >
//         {this.renderTags()}
//       </div>
//     );
//   }
// }
//
// // Default Props
// Tags.defaultProps = {
//   parentTag: {}
// };
//
// // Prop Types
// Tags.propTypes = {
//   editable: React.PropTypes.bool,
//   enableNewTagForm: React.PropTypes.bool,
//
//   // Event handelers
//   onTagBookmark: React.PropTypes.func,
//   onTagCreate: React.PropTypes.func,
//   onTagDragAdd: React.PropTypes.func,
//   onTagMouseOut: React.PropTypes.func,
//   onTagMouseOver: React.PropTypes.func,
//   onTagRemove: React.PropTypes.func,
//   onTagSort: React.PropTypes.func,
//   onTagUpdate: React.PropTypes.func,
//
//   parentTag: PropTypes.Tag,
//   placeholder: React.PropTypes.string,
//   showBookmark: React.PropTypes.bool,
//   // tag: PropTypes.Tag
//   tags: PropTypes.arrayOfTags
// };
//
// // Export
// ReactionUI.Components.Tags = Tags;
