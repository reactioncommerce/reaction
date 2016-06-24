// // TODO: Place holder imports
// // import React from "react"
// const classnames = ReactionUI.Lib.classnames;
// const TextareaAutosize = ReactionUI.Lib.TextareaAutosize;
//
// class TextField extends React.Component {
//   state = {
//     value: ""
//   }
//
//   constructor(props) {
//     super(props);
//
//     this.state = {
//       value: props.value
//     };
//   }
//
//   /**
//    * onValueChange
//    * @summary set the state when the value of the input is changed
//    * @param  {Event} event Event object
//    * @return {void}
//    */
//   onChange = (event) => {
//     this.setState({
//       value: event.target.value
//     });
//
//     if (this.props.onChange) {
//       this.props.onChange(event);
//     }
//   }
//
//   /**
//    * onValueChange
//    * @summary set the state when the value of the input is changed
//    * @param  {Event} event Event object
//    * @return {void}
//    */
//   onValueChange = (event) => {
//     this.setState({
//       value: event.target.value
//     });
//
//     if (this.props.onValueChange) {
//       this.props.onValueChange(event);
//     }
//   }
//
//   /**
//    * componentWillReceiveProps - Component Lifecycle
//    * @param  {Object} props Properties passed from the parent component
//    * @return {Void} no return value
//    */
//   componentWillReceiveProps(props) {
//     if (props) {
//       this.setState({
//         value: props.value
//       });
//     }
//   }
//
//   /**
//    * Render a multiline input (textarea)
//    * @return {JSX} jsx
//    */
//   renderMultilineInput() {
//     return (
//       <TextareaAutosize
//         className="{this.props.name}-edit-input"
//         placeholder={this.props.i18nPlaceholder}
//         value={this.state.value}
//         onChange={this.onValueChange}
//       />
//     );
//   }
//
//   /**
//    * Render a singleline input
//    * @return {JSX} jsx
//    */
//   renderSingleLineInput() {
//     return (
//       <input
//         type="text"
//         className="{this.props.name}-edit-input"
//         {...this.props}
//         value={this.state.value}
//         onChange={this.onChange}
//         onBlur={this.onValueChange}
//         placeholder={this.props.i18nPlaceholder}
//
//         />
//     );
//   }
//
//   /**
//    * Render either a multiline (textarea) or singleline (input)
//    * @return {JSX} jsx template
//    */
//   renderField() {
//     if (this.props.multiline === true) {
//       return this.renderMultilineInput();
//     }
//
//     return this.renderSingleLineInput();
//   }
//
//   /**
//    * Render Component
//    * @return {JSX} component
//    */
//   render() {
//     const classes = classnames({
//       // Base
//       rui: true,
//       textfield: true,
//
//       // Alignment
//       center: this.props.align === "center",
//       left: this.props.align === "left",
//       right: this.props.align === "right"
//     });
//
//     return (
//       <div className={classes}>
//         {this.renderField()}
//         <span className="product-detail-message" id="{{field}}-message"></span>
//       </div>
//     );
//   }
// }
//
// TextField.defaultProps = {
//   align: "left"
// };
//
// TextField.propTypes = {
//   align: React.PropTypes.oneOf(["left", "center", "right", "justify"])
// };
//
// // Export
// ReactionUI.Components.TextField = TextField;
