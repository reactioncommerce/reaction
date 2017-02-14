import React, { Component } from "react";
import { FieldGroup } from "/imports/plugins/core/ui/client/components";
import { Meteor } from "meteor/meteor";
import { Button } from "react-bootstrap";
import Alert from "sweetalert2";
import { i18next } from "/client/api";

class ExampleSettingsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiKey: props.packageData.settings.apiKey

    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.saveUpdate = this.saveUpdate.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const apiKeyValue = this.state.apiKey;

    const fields = [{
      property: "apiKey",
      value: apiKeyValue
    }];
    const id = this.props.packageData._id;
    const name = this.props.packageData.name;
    this.saveUpdate(fields, id, name);
  }

  saveUpdate(fields, id, name) {
    Meteor.call("registry/update", id, name, fields, (err) => {
      if (err) {
        return Alert({
          text: i18next.t("admin.settings.saveFailed"),
          type: "warning",
          options: {
            autoHide: 4000
          }
        });
      }
      return Alert({
        text: i18next.t("admin.settings.saveSuccess"),
        type: "success"
      });
    });
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({ apiKey: e.target.value });
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

