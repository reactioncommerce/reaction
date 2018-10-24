import React, { Component } from "react";
import PropTypes from "prop-types";
import { uniqueId } from "lodash";
import { Form } from "reacto-form";
import { i18next } from "/client/api";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import Select from "@reactioncommerce/components/Select/v1";

/**
 * @summary The default form validator
 * @see http://composableforms.com/spec/validation/
 * @param {Object} doc The document to validate
 * @returns {Object[]} ReactoForm validation errors array
 */
async function defaultValidator(doc) {
  if (typeof doc.serviceName !== "string" || doc.serviceName.length === 0) {
    return [{ name: "serviceName", message: "You must choose an address validation service" }];
  }

  return [];
}

export default class AddressValidationSettingsForm extends Component {
  static propTypes = {
    countryOptions: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })),
    onSubmit: PropTypes.func.isRequired,
    serviceOptions: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })),
    validator: PropTypes.func,
    value: PropTypes.shape({
      countryCodes: PropTypes.arrayOf(PropTypes.string),
      serviceName: PropTypes.string.isRequired
    })
  };

  static defaultProps = {
    validator: defaultValidator
  };

  uniqueInstanceIdentifier = uniqueId("AddressValidationSettingsForm");

  async submit() {
    if (this.form) {
      this.form.submit();
    }
  }

  render() {
    const { countryOptions, onSubmit, serviceOptions, validator, value } = this.props;

    const serviceNameInputId = `serviceName_${this.uniqueInstanceIdentifier}`;
    const countryCodesInputId = `countryCodes_${this.uniqueInstanceIdentifier}`;

    return (
      <Form ref={(formRef) => { this.form = formRef; }} onSubmit={onSubmit} validator={validator} value={value}>
        <Field name="serviceName" label={i18next.t("addressValidation.serviceNameLabel")} labelFor={serviceNameInputId}>
          <Select id={serviceNameInputId} name="serviceName" options={serviceOptions} />
          <ErrorsBlock names={["serviceName"]} />
        </Field>
        <Field
          helpText={i18next.t("addressValidation.countryCodesHelpText")}
          isOptional
          label={i18next.t("addressValidation.countryCodesLabel")}
          labelFor={countryCodesInputId}
          name="countryCodes"
        >
          <Select id={countryCodesInputId} isMulti name="countryCodes" options={countryOptions} />
          <ErrorsBlock names={["countryCodes"]} />
        </Field>
      </Form>
    );
  }
}
