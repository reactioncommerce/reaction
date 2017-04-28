import React, { Component } from "react";
import PropTypes from "prop-types";
import Blaze from "meteor/gadicc:blaze-react-component";

class PrintLayout extends Component {
  static propTypes = {
    structure: PropTypes.object
  }

  render() {
    return (
      <Blaze template={this.props.structure.template} className="reaction-print-layout" />
    );
  }
}

export default PrintLayout;
