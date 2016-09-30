import React, { PropTypes } from "react";
import { Icon } from "../icon";

/**
 * Handle is a special type of button used for drag handles.
 * It uses the fa-bars icon by default, and does not have click or hover states
 *
 * Use this button in places where you need a pre-styled button for drag handles
 *
 * @param {Object} props Props passed into component
 * @returns {node} component with pre-configured icon for dragging
 */
const Handle = (props) => {
  const handle = (
    <div className="rui drag-handle btn btn-drag-handle">
      <Icon
        icon="fa fa-bars"
        {...props}
      />
    </div>
  );

  if (props.connectDragSource) {
    return props.connectDragSource(handle);
  }

  return handle;
};

Handle.propTypes = {
  connectDragSource: PropTypes.func
};

export default Handle;
