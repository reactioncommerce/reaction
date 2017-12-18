import { Component, Children } from "react";
import PropTypes from "prop-types";
import { DragDropManager } from "dnd-core";
import HTML5Backend from "react-dnd-html5-backend";
import { registerComponent } from "@reactioncommerce/reaction-components";

const defaultManager = new DragDropManager(HTML5Backend);

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

registerComponent("DragDropProvider", DragDropProvider);

export default DragDropProvider;
