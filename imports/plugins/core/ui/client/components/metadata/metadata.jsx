// import React from "react";
//
// // import TextField from "reaction-ui/textfield"
// // TODO: For now lets pretend we have to do imports
// const TextField = ReactionUI.Components.TextField;
// const Button = ReactionUI.Components.Button;
// const Seperator = ReactionUI.Components.Seperator;
// const Item = ReactionUI.Components.Item;
// const Items = ReactionUI.Components.Items;
//
// class Metadata extends React.Component {
//
//   /**
//    * Handle form submit
//    * @param  {Event} event Event object
//    * @return {void} no return value
//    */
//   handleSubmit = (event) => {
//     event.preventDefault();
//   }
//
//   handleRemove = (event) => {
//     console.log("Remove!!");
//   }
//
//   handleSort = (event) => {
//     console.log("sort!!!!");
//   }
//
//   /**
//    * Render user readable metadata
//    * @return {JSX} metadata
//    */
//   renderMetadata() {
//     return this.props.metafields.map((metadata, index) => {
//       return (
//         <div className="rui meta-item" key={index}>
//           <div className="rui meta-key">{metadata.key}</div>
//           <div className="rui meta-key">{metadata.value}</div>
//         </div>
//       );
//     });
//   }
//
//   /**
//    * Render a metadata form
//    * @return {JSX} metadata forms for each row of metadata
//    */
//   renderMetadataForm() {
//     const fields = this.props.metafields.map((metadata, index) => {
//       return (
//         <Item key={index} size="full" type="meta">
//           <form onSubmit={this.handleSubmit}>
//             <TextField name="key" value={metadata.key}></TextField>
//             <TextField name="value" value={metadata.value}></TextField>
//             <Button type="button" icon="times-circle" onClick={this.handleRemove}></Button>
//           </form>
//         </Item>
//       );
//     });
//
//     // Blank fields for creating new metadata
//     // fields.push(
//     //
//     // );
//
//     return fields;
//   }
//
//   renderMetadataCreateForm() {
//
//     return (
//       <Item type="meta-create" size="full">
//         <form onSubmit={this.handleSubmit}>
//           <Button type="button" icon="edit"></Button>
//           <TextField name="key"></TextField>
//           <TextField name="value"></TextField>
//           <Button icon="plus" onClick={this.handleRemove} status="success" />
//         </form>
//       </Item>
//     );
//   }
//
//   /**
//    * render
//    * @return {JSX} component
//    */
//   render() {
//     // Admin editable metadata
//     if (this.props.editable) {
//       return (
//         <div className="rui metadata edit">
//           <Items
//             autoWrap={true}
//             static={true}
//           >
//             {this.renderMetadataForm()}
//           </Items>
//           <Seperator />
//           {this.renderMetadataCreateForm()}
//         </div>
//       );
//     }
//
//     // User readable metadata
//     return (
//       <div className="rui metadata">
//         {this.renderMetadata()}
//       </div>
//     );
//   }
// }
//
// Metadata.defaultProps = {
//   editable: true
// };
//
// // Prop Types
// Metadata.propTypes = {
//   editable: React.PropTypes.bool,
//   metafields: React.PropTypes.array
// };
//
// ReactionUI.Components.Metadata = Metadata;
