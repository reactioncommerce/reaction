import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class ExpressSettingsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    return this.props.onSubmit(this.state.settings);
  }


  render() {
    const { packageConfig } = this.props;

    return (
      <Components.Form
        schema={packageConfig}
        doc={doc}
        docPath={`settings.public.apps.${provider.name}`}
        name={`settings.public.apps.${provider.name}`}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

ExpressSettingsForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  packageConfig: PropTypes.object.isRequired
};

export default ExpressSettingsForm;
