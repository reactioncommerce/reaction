import React, { Component, PropTypes } from "react";

class FormActions extends Component {
  static propTypes = {
    children: PropTypes.node
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end"
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

export default FormActions;
