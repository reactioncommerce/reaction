import React, { Component } from "react";
import PropTypes from "prop-types";
import Blaze from "meteor/gadicc:blaze-react-component";
import { registerComponent } from "@reactioncommerce/reaction-components";

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

// lowercased to match the legacy blaze "printLayout"
registerComponent("printLayout", PrintLayout);

export default PrintLayout;
