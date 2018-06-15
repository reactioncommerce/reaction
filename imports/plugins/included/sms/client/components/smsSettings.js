import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form } from "reacto-form";
import { Components } from "@reactioncommerce/reaction-components";
import Field from "@reactioncommerce/components/Field/v1";
import Select from "@reactioncommerce/components/Select/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Button from "@reactioncommerce/components/Button/v1";
import Logger from "@reactioncommerce/logger";
import { i18next } from "/client/api";

const iconComponentStyles = {
  fontSize: "1em",
  verticalAlign: "middle"
};

const iconComponents = {
  iconClear: (<i className="fa fa-times" style={iconComponentStyles} />),
  iconError: (<i className="fa fa-exclamation-triangle" style={iconComponentStyles} />),
  iconValid: (<i className="fa fa-check-circle" style={iconComponentStyles} />)
};

const smsProviders = [{
  label: "Twilio", value: "twilio"
}, {
  label: "Nexmo", value: "nexmo"
}];

class SmsSettings extends Component {
  static propTypes = {
    saveSettings: PropTypes.func.isRequired,
    settings: PropTypes.shape({
      apiKey: PropTypes.string,
      apiToken: PropTypes.string,
      smsPhone: PropTypes.string,
      smsProvider: PropTypes.string
    })
  };

  static async validator(settings) {
    const { apiKey, apiToken, smsProvider, smsPhone } = settings;

    const errors = [];
    if (!apiKey) {
      errors.push({ message: i18next.t("admin.alerts.noApiKey"), name: "apiKey" });
    }
    if (!apiToken) {
      errors.push({ message: i18next.t("admin.alerts.noApiToken"), name: "apiToken" });
    }
    if (!smsProvider) {
      errors.push({ message: i18next.t("admin.alerts.noSmsProvider"), name: "smsProvider" });
    }
    if (!smsPhone) {
      errors.push({ message: i18next.t("admin.alerts.noSmsPhone"), name: "smsPhone" });
    }

    return errors;
  }

  state = {
    isSaving: false
  }

  handleSubmit = (settings) => {
    const { saveSettings } = this.props;

    this.setState({ isSaving: true });
    return saveSettings(settings)
      .then((result) => {
        this.setState({ isSaving: false });
        return result;
      })
      .catch((error) => {
        this.setState({ isSaving: false });
        Logger.error(error);
      });
  };

  render() {
    const { settings } = this.props;
    const { isSaving } = this.state;

    return (
      <Components.CardGroup>
        <Components.Card>
          <Components.CardHeader
            actAsExpander={true}
            i18nKeyTitle="admin.settings.smsProvider"
            title="SMS Provider"
          />
          <Components.CardBody expandable={true}>
            <Form
              logErrorsOnSubmit
              onSubmit={this.handleSubmit}
              ref={(ref) => { this.form = ref; }}
              validator={SmsSettings.validator}
              value={settings}
            >
              <Field
                label={i18next.t("admin.settings.providerName", { defaultValue: "Provider Name" })}
                name="smsProvider"
              >
                <Select
                  name="smsProvider"
                  options={smsProviders}
                  placeholder={i18next.t("admin.settings.selectProvider", { defaultValue: "Select an SMS provider" })}
                />
                <ErrorsBlock names={["smsProvider"]} />
              </Field>
              <hr/>
              <Field
                label={i18next.t("admin.settings.phoneNumber", { defaultValue: "SMS Phone Number" })}
                name="smsPhone"
              >
                <TextInput name="smsPhone" {...iconComponents} />
                <ErrorsBlock names={["smsPhone"]} />
              </Field>
              <Field
                label={i18next.t("admin.settings.apiKey", { defaultValue: "API Key" })}
                name="apiKey"
                type="password"
              >
                <TextInput name="apiKey" {...iconComponents} />
                <ErrorsBlock names={["apiKey"]} />
              </Field>
              <Field
                label={i18next.t("admin.settings.apiToken", { defaultValue: "API Token/Secret" })}
                name="apiToken"
                type="password"
              >
                <TextInput name="apiToken" {...iconComponents} />
                <ErrorsBlock names={["apiToken"]} />
              </Field>
              <div className="pull-right">
                <Button isWaiting={isSaving} onClick={() => this.form.submit()}>{i18next.t("app.save", { defaultValue: "Save" })}</Button>
              </div>
            </Form>
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
    );
  }
}

export default SmsSettings;
