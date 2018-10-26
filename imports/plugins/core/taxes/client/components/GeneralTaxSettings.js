import React, { Component } from "react";
import PropTypes from "prop-types";
import { uniqueId } from "lodash";
import { Form } from "reacto-form";
import { i18next } from "/client/api";
import Button from "@reactioncommerce/components/Button/v1";
import Checkbox from "@reactioncommerce/components/Checkbox/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import Select from "@reactioncommerce/components/Select/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";

export default class GeneralTaxSettings extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    settingsDoc: PropTypes.shape({
      activeTaxServiceName: PropTypes.string,
      defaultTaxCode: PropTypes.string,
      taxShipping: PropTypes.bool
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

  render() {
    const { onSubmit, settingsDoc, taxServices, validator } = this.props;

    const taxServicesOptions = (taxServices || []).map(({ displayName, name }) => ({
      label: displayName,
      value: name
    }));

    const activeTaxServiceNameInputId = `activeTaxServiceName_${this.uniqueInstanceIdentifier}`;
    const defaultTaxCodeInputId = `defaultTaxCode_${this.uniqueInstanceIdentifier}`;
    const taxShippingInputId = `taxShipping_${this.uniqueInstanceIdentifier}`;

    return (
      <div className="clearfix">
        <Form ref={(formRef) => { this.form = formRef; }} onSubmit={onSubmit} validator={validator} value={settingsDoc}>
          <Field name="activeTaxServiceName" label={i18next.t("admin.taxSettings.activeTaxServiceName")} labelFor={activeTaxServiceNameInputId}>
            <Select id={activeTaxServiceNameInputId} name="activeTaxServiceName" options={taxServicesOptions} placeholder={i18next.t("admin.taxSettings.activeTaxServiceNamePlaceholder")} />
            <ErrorsBlock names={["activeTaxServiceName"]} />
          </Field>
          <Field name="defaultTaxCode" label={i18next.t("admin.taxSettings.defaultTaxCode")} labelFor={defaultTaxCodeInputId}>
            <TextInput id={defaultTaxCodeInputId} name="defaultTaxCode" />
            <ErrorsBlock names={["defaultTaxCode"]} />
          </Field>
          <Field name="taxShipping">
            <Checkbox id={taxShippingInputId} label={i18next.t("admin.taxSettings.taxShipping")} labelFor={taxShippingInputId} name="taxShipping" />
            <ErrorsBlock names={["taxShipping"]} />
          </Field>
        </Form>
        <div className="clearfix">
          <div className="pull-right">
            <Button onClick={this.handleSave}>{i18next.t("app.saveChanges")}</Button>
          </div>
        </div>
      </div>
    );
  }
}
