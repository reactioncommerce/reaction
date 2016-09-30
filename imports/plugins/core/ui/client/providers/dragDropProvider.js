import React, { Component, PropTypes, Children } from "react"; // eslint-disable-line
import { DragDropManager } from "dnd-core";
import HTML5Backend from "react-dnd-html5-backend";

let defaultManager = new DragDropManager(HTML5Backend);

// /**
//  * This is singleton used to initialize only once dnd in our app.
//  * If you initialized dnd and then try to initialize another dnd
//  * context the app will break.
//  * Here is more info: https://github.com/gaearon/react-dnd/issues/186
//  *
//  * The solution is to call Dnd context from this singleton this way
//  * all dnd contexts in the app are the same.
//  */
// export default function getDndContext() {
//   if (defaultManager) return defaultManager;
//
//   defaultManager = new DragDropManager(HTML5Backend);
//
//   return defaultManager;
// }

class DragDropProvider extends Component {
  getChildContext() {
    return {
      dragDropManager: defaultManager
    };
  }

  render() {
    // `Children.only` enables us not to add a <div /> for nothing
    return Children.only(this.props.children);
  }
}

DragDropProvider.childContextTypes = {
  dragDropManager: PropTypes.object.isRequired
};

DragDropProvider.propTypes = {
  children: PropTypes.node
};

export default DragDropProvider;
