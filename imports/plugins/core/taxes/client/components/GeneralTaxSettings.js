import React, { Component } from "react";
import PropTypes from "prop-types";
import { uniqueId } from "lodash";
import { Form } from "reacto-form";
import { i18next } from "/client/api";
import Button from "@reactioncommerce/catalyst/Button";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import Select from "@reactioncommerce/components/Select/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";

export default class GeneralTaxSettings extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    settingsDoc: PropTypes.shape({
      primaryTaxServiceName: PropTypes.string,
      fallbackTaxServiceName: PropTypes.string,
      defaultTaxCode: PropTypes.string
    }),
    taxServices: PropTypes.arrayOf(PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })),
    validator: PropTypes.func
  };

  uniqueInstanceIdentifier = uniqueId("GeneralTaxSettings");

  handleSave = () => {
    if (this.form) {
      this.form.submit();
    }
  };

  enableFallbackTaxSelect = (currentSettings) => {
    if (currentSettings.primaryTaxServiceName) return false;
    return true;
  }

  get taxServicesOptions() {
    const { taxServices } = this.props;

    const options = (taxServices || []).map(({ displayName, name }) => ({
      label: displayName,
      value: name
    }));

    options.unshift({ label: "None", value: "" });

    return options;
  }

  render() {
    const { onSubmit, settingsDoc, validator } = this.props;

    const primaryTaxServiceNameInputId = `primaryTaxServiceName_${this.uniqueInstanceIdentifier}`;
    const fallbackTaxServiceNameInputId = `fallbackTaxServiceName_${this.uniqueInstanceIdentifier}`;
    const defaultTaxCodeInputId = `defaultTaxCode_${this.uniqueInstanceIdentifier}`;

    return (
      <div className="clearfix">
        <Form ref={(formRef) => { this.form = formRef; }} onSubmit={onSubmit} validator={validator} value={settingsDoc}>
          <Field name="primaryTaxServiceName" label={i18next.t("admin.taxSettings.primaryTaxServiceName")} labelFor={primaryTaxServiceNameInputId}>
            <Select
              id={primaryTaxServiceNameInputId}
              name="primaryTaxServiceName"
              options={this.taxServicesOptions}
              placeholder={i18next.t("admin.taxSettings.primaryTaxServiceNamePlaceholder")}
            />
            <ErrorsBlock names={["primaryTaxServiceName"]} />
          </Field>
          <Field name="fallbackTaxServiceName" label={i18next.t("admin.taxSettings.fallbackTaxServiceName")} labelFor={fallbackTaxServiceNameInputId}>
            <Select
              id={fallbackTaxServiceNameInputId}
              name="fallbackTaxServiceName"
              options={this.taxServicesOptions}
              placeholder={i18next.t("admin.taxSettings.fallbackTaxServiceNamePlaceholder")}
              isReadOnly={this.enableFallbackTaxSelect}
            />
            <ErrorsBlock names={["fallbackTaxServiceName"]} />
          </Field>
          <Field name="defaultTaxCode" label={i18next.t("admin.taxSettings.defaultTaxCode")} labelFor={defaultTaxCodeInputId}>
            <TextInput id={defaultTaxCodeInputId} name="defaultTaxCode" />
            <ErrorsBlock names={["defaultTaxCode"]} />
          </Field>
        </Form>
        <div className="clearfix">
          <div className="pull-right">
            <Button variant="contained" color="primary" onClick={this.handleSave}>{i18next.t("app.saveChanges")}</Button>
          </div>
        </div>
      </div>
    );
  }
}
