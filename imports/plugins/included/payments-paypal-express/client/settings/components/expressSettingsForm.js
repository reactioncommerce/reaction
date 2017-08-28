import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class ExpressSettingsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <Components.Form
        schema={this.props.packageSchema}
        doc={this.props.packageConfig}
        docPath={"settings"}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

ExpressSettingsForm.propTypes = {
  packageConfig: PropTypes.object.isRequired,
  packageSchema: PropTypes.object.isRequired
};

export default ExpressSettingsForm;
