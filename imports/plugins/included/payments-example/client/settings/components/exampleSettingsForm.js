import React, { Component, PropTypes } from "react";
import { FieldGroup } from "/imports/plugins/core/ui/client/components";
import { Button } from "react-bootstrap";
import { Translation } from "/imports/plugins/core/ui/client/components/";


class ExampleSettingsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiKey: props.packageData.settings.apiKey

    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.onSubmit({
      id: this.props.packageData._id,
      name: this.props.packageData.name,
      apiKey: this.state.apiKey
    });
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({ apiKey: e.target.value });
  }

  render() {
    const { packageData } = this.props;

    return (
      <div>
        { !packageData.settings.apiKey &&
          <div className="alert alert-info">
            <Translation defaultValue="Example Credentials" i18nKey="admin.paymentSettings.exampleCredentials"/>
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
            <Translation defaultValue="Save Changes" i18nKey="app.saveChanges"/>
          </Button>
        </form>

      </div>
    );
  }
}

ExampleSettingsForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  packageData: PropTypes.object
};

export default ExampleSettingsForm;

