import React, { Component } from "react";
import PropTypes from "prop-types";

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
