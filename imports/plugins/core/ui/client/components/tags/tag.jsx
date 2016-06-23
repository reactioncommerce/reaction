// import { i18next } from "/client/api";
// import React from "react";
// import { Reaction } from "/client/api";
// import { PropTypes } from "/lib/api";
// import { Tags } from "/lib/collections";
//
// /* eslint no-extra-parens: 0 */
//
// const TextField = ReactionUI.Components.TextField;
// const Button = ReactionUI.Components.Button;
//
// class Tag extends React.Component {
//   displayName: "Tag";
//
//   /**
//    * Handle tag create events and pass them up the component chain
//    * @param  {Event} event Event object
//    * @return {void} no return value
//    */
//   handleTagCreate = (event) => {
//     event.preventDefault();
//     if (this.props.onTagCreate) {
//       this.props.onTagCreate(event.target.tag.value, this.props.parentTag);
//     }
//   };
//
//   /**
//    * Handle tag bookmark events and pass them up the component chain
//    * @param  {Event} event Event object
//    * @return {void} no return value
//    */
//   handleTagBookmark = () => {
//     if (this.props.onTagBookmark) {
//       this.props.onTagBookmark(this.props.tag._id);
//     }
//   };
//
//   /**
//    * Handle tag remove events and pass them up the component chain
//    * @param  {Event} event Event object
//    * @return {void} no return value
//    */
//   handleTagRemove = () => {
//     if (this.props.onTagRemove) {
//       this.props.onTagRemove(this.props.tag);
//     }
//   };
//
//   /**
//    * Handle tag update events and pass them up the component chain
//    * @param  {Event} event Event object
//    * @return {void} no return value
//    */
//   handleTagUpdate = (event) => {
//     if (this.props.onTagUpdate && event.keyCode === 13) {
//       this.props.onTagUpdate(this.props.tag._id, event.target.value);
//     }
//   };
//
//   /**
//    * Handle tag mouse out events and pass them up the component chain
//    * @param  {Event} event Event object
//    * @return {void} no return value
//    */
//   handleTagMouseOut = (event) => {
//     event.preventDefault();
//     if (this.props.onTagMouseOut) {
//       this.props.onTagMouseOut(event, this.props.tag);
//     }
//   };
//
//   /**
//    * Handle tag mouse over events and pass them up the component chain
//    * @param  {Event} event Event object
//    * @return {void} no return value
//    */
//   handleTagMouseOver = (event) => {
//     if (this.props.onTagMouseOver) {
//       this.props.onTagMouseOver(event, this.props.tag);
//     }
//   };
//
//   /**
//    * Handle tag focus, show autocomplete options
//    * TODO: Make this better by not using a jQuery plugin
//    * @param  {Event} event Event Object
//    * @return {void} no return value
//    */
//   handleFocus = (event) => {
//     $(event.currentTarget).autocomplete({
//       delay: 0,
//       source: function (request, response) {
//         let datums = [];
//         let slug = Reaction.getSlug(request.term);
//         Tags.find({
//           slug: new RegExp(slug, "i")
//         }).forEach(function (tag) {
//           return datums.push({
//             label: tag.name
//           });
//         });
//         return response(datums);
//       },
//       select: (selectEvent, ui) => {
//         if (ui.item.value) {
//           if (this.props.onTagUpdate) {
//             this.props.onTagUpdate(this.props.tag._id, ui.item.value);
//           }
//         }
//       }
//     });
//   };
//
//   /**
//    * Render a simple tag for display purposes only
//    * @return {JSX} simple tag
//    */
//   renderTag() {
//     const url = `/product/tag/${this.props.tag.slug}`;
//     return (
//       <a
//         className="rui tag link"
//         href={url}
//         onMouseOut={this.handleTagMouseOut}
//         onMouseOver={this.handleTagMouseOver}
//       >
//         {this.props.tag.name}
//       </a>
//     );
//   }
//
//   renderBookmarkButton() {
//     if (this.props.showBookmark) {
//       return (
//         <Button icon="bookmark" onClick={this.handleTagBookmark} />
//       );
//     }
//   }
//
//   /**
//    * Render an admin editable tag
//    * @return {JSX} editable tag
//    */
//   renderEditableTag() {
//     return (
//       <div
//         className="rui tag edit"
//         data-id={this.props.tag._id}
//       >
//         <Button icon="bars" />
//         <TextField
//           onFocus={this.handleFocus}
//           onKeyDown={this.handleTagUpdate}
//           value={this.props.tag.name}
//         />
//         <Button icon="times-circle" onClick={this.handleTagRemove} status="danger" />
//       </div>
//     );
//   }
//
//   /**
//    * Render a tag creation form
//    * @return {JSX} blank tag for creating new tags
//    */
//   renderBlankEditableTag() {
//     return (
//       <div className="rui tag edit create">
//         <form onSubmit={this.handleTagCreate}>
//           <Button icon="tag" />
//           <TextField i18nPlaceholder={i18next.t(this.props.placeholder) || i18next.t("tags.addTag")} name="tag" />
//           <Button icon="plus" />
//         </form>
//       </div>
//     );
//   }
//
//   /**
//    * Render component
//    * @return {JSX} tag component
//    */
//   render() {
//     if (this.props.editable) {
//       return this.renderEditableTag();
//     } else if (this.props.blank) {
//       return this.renderBlankEditableTag();
//     }
//
//     return this.renderTag();
//   }
// }
//
// Tag.propTypes = {
//   blank: React.PropTypes.bool,
//   editable: React.PropTypes.bool,
//
//   // Event handelers
//   onTagBookmark: React.PropTypes.func,
//   onTagCreate: React.PropTypes.func,
//   onTagMouseOut: React.PropTypes.func,
//   onTagMouseOver: React.PropTypes.func,
//   onTagRemove: React.PropTypes.func,
//   onTagUpdate: React.PropTypes.func,
//
//   parentTag: PropTypes.Tag,
//   placeholder: React.PropTypes.string,
//   showBookmark: React.PropTypes.bool,
//   tag: PropTypes.Tag
// };
//
// ReactionUI.Components.Tag = Tag;
