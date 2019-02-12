import { Component, Children } from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";

class DragDropProvider extends Component {
  render() {
    // `Children.only` enables us not to add a <div /> for nothing
    return Children.only(this.props.children);
  }
}

DragDropProvider.propTypes = {
  children: PropTypes.node
};

registerComponent("DragDropProvider", DragDropProvider);

export default DragDropProvider;
