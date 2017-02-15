import React, { Component, PropTypes } from "react";
import { FieldGroup } from "/imports/plugins/core/ui/client/components";
import { Button } from "react-bootstrap";
import { Translation } from "/imports/plugins/core/ui/client/components/";


class ExampleSettingsForm extends Component {
  render() {
    const { packageData } = this.props;

    return (
      <div>
        { !packageData.settings.apiKey &&
          <div className="alert alert-info">
            <Translation defaultValue="Example Credentials" i18nKey="admin.paymentSettings.exampleCredentials"/>
          </div>
        }

        <form onSubmit={this.props.onSubmit}>
          <FieldGroup
            label="API Key"
            name="apiKey"
            type="text"
            onChange={this.props.onChange}
          />

          <Button bsStyle="primary" className="pull-right" type="submit">
            <Translation defaultValue="Save Changes" i18nKey="app.saveChanges"/>
          </Button>
        </form>

      </div>
    );
  }
}

ExampleSettingsForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  packageData: PropTypes.object
};

export default ExampleSettingsForm;

