import React, { Component } from "react";
import { FieldGroup } from "/imports/plugins/core/ui/client/components";
import { Button } from "react-bootstrap";

class ExampleSettingsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: {}
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const apiKey = this.state.fields;

    console.log("Here", apiKey);
  }

  handleChange(e) {
    e.preventDefault();

    const fields = this.state.fields;

    fields[e.target.name] = e.target.value;

    this.setState({ fields });
  }

  render() {
    const { packageData } = this.props;
    console.log("Package data:", packageData);
    return (
      <div>
        {packageData ?
          <span></span> :
          <div className="alert alert-info">
            <span data-i18n="admin.paymentSettings.exampleCredentials">Example Credentials</span>
          </div>
         }

        <form onSubmit={this.handleSubmit}>
          <FieldGroup
            label="API Key"
            name="apiKey"
            type="text"
            onChange={this.handleChange}
          />

          <Button bsStyle="primary" className="pull-right" type="submit">
          <span data-i18n="app.saveChanges">Save Changes</span>
          </Button>
        </form>

      </div>
    );
  }
}

export default ExampleSettingsForm;

