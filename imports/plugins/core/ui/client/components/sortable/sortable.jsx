// import React from "react";
//
// const classnames = ReactionUI.Lib.classnames;
// const Item = ReactionUI.Components.Item;
// const ReactSortableMixin = ReactionUI.Lib.ReactSortableMixin;
// const Sortable = ReactionUI.Lib.Sortable;
// const ReactDOM = ReactionUI.Lib.ReactDOM;
//
// ReactionUI.Components.SortableItems = React.createClass({
//   displayName: "Sortable Items",
//   mixins: [ReactSortableMixin],
//
//   getInitialState: function() {
//       return {
//           items: []
//       };
//   },
//
//
//
//   componentDidMount() {
//     // const list = ReactDOM.findDOMNode(this.refs.list)
//
//     // this.sortable = Sortable.create(list)
//   },
//
//   componentWillReceiveProps(props) {
//     this.setState({
//       items: props.children
//     });
//   },
//
//   sortableOptions: {
//     model: "items"
//   },
//
//   handleSort(event) {
//     console.log(event);
//     console.log(this.state.items);
//
//     if (this.props.onSort) {
//       this.props.onSort(this.state.items);
//     }
//   },
//
//   // render: function() {
//   //     return <ul ref="list">{
//   //         this.state.items.map(function (text) {
//   //             return <li className="item">{text}</li>
//   //         })
//   //     }</ul>
//   // }
//
//
//   // sortableOptions: {
//   //   handle: ".handle",
//   //   draggable: ".item"
//   // },
//   //
//   // handleSort(event) {
//   //
//   // },
//
//   renderItems() {
//     if (this.state.items) {
//       const items = React.Children.map(this.state.items, (child, index) => {
//         // if (this.props.autoWrap) {
//         //   return (
//         //     <Item key={index} sortable={this.props.sortable}>
//         //       {React.cloneElement(child)}
//         //     </Item>
//         //   );
//         // }
//
//         return React.cloneElement(child);
//       });
//
//       return items;
//     }
//   },
//
//   render() {
//     const classes = classnames({
//       rui: true,
//       items: true,
//       sortable: true,
//
//       flex: this.props.static === false,
//       [`${this.props.direction}`]: true
//     });
//
//     return (
//       <div className={classes}>
//         {this.renderItems()}
//       </div>
//     );
//   }
// });
