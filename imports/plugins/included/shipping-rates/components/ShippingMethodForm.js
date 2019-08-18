import React, { Component } from "react";
import PropTypes from "prop-types";
import { uniqueId } from "lodash";
import { Form } from "reacto-form";
import { i18next } from "/client/api";
import Button from "@reactioncommerce/catalyst/Button";
import Checkbox from "@reactioncommerce/components/Checkbox/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import Select from "@reactioncommerce/components/Select/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";

Checkbox.isFormInput = true;

export default class ShippingMethodForm extends Component {
  static propTypes = {
    groupOptions: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })),
    isEditing: PropTypes.bool,
    methodDoc: PropTypes.shape({
      name: PropTypes.string,
      group: PropTypes.string,
      label: PropTypes.string,
      cost: PropTypes.string,
      handling: PropTypes.string,
      rate: PropTypes.string,
      isEnabled: PropTypes.bool
    }),
    onCancel: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    validator: PropTypes.func
  };

  static defaultProps = {
    isEditing: false
  };

  uniqueInstanceIdentifier = uniqueId("ShippingMethodForm");

  handleSave = () => {
    if (this.form) {
      this.form.submit();
    }
  };

  render() {
    const { groupOptions, isEditing, methodDoc, onCancel, onDelete, onSubmit, validator } = this.props;

    const nameInputId = `name_${this.uniqueInstanceIdentifier}`;
    const labelInputId = `label_${this.uniqueInstanceIdentifier}`;
    const groupInputId = `group_${this.uniqueInstanceIdentifier}`;
    const costInputId = `cost_${this.uniqueInstanceIdentifier}`;
    const handlingInputId = `handling_${this.uniqueInstanceIdentifier}`;
    const rateInputId = `rate_${this.uniqueInstanceIdentifier}`;

    return (
      <div className="clearfix">
        <Form ref={(formRef) => { this.form = formRef; }} onSubmit={onSubmit} validator={validator} value={methodDoc}>
          <Field name="name" label={i18next.t("shippingMethod.name")} labelFor={nameInputId}>
            <TextInput id={nameInputId} name="name" />
            <ErrorsBlock names={["name"]} />
          </Field>
          <Field name="label" label={i18next.t("shippingMethod.label")} labelFor={labelInputId}>
            <TextInput id={labelInputId} name="label" />
            <ErrorsBlock names={["label"]} />
          </Field>
          <Field name="group" label={i18next.t("shippingMethod.group")} labelFor={groupInputId}>
            <Select id={groupInputId} name="group" options={groupOptions} />
            <ErrorsBlock names={["group"]} />
          </Field>
          <Field name="cost" label={i18next.t("shippingMethod.cost")} labelFor={costInputId}>
            <TextInput id={costInputId} name="cost" />
            <ErrorsBlock names={["cost"]} />
          </Field>
          <Field name="handling" label={i18next.t("shippingMethod.handling")} labelFor={handlingInputId}>
            <TextInput id={handlingInputId} name="handling" />
            <ErrorsBlock names={["handling"]} />
          </Field>
          <Field name="rate" label={i18next.t("shippingMethod.rate")} labelFor={rateInputId}>
            <TextInput id={rateInputId} name="rate" />
            <ErrorsBlock names={["rate"]} />
          </Field>
          <Field name="isEnabled">
            <Checkbox name="isEnabled" label={i18next.t("shippingMethod.enabled")} />
            <ErrorsBlock names={["isEnabled"]} />
          </Field>
        </Form>
        <div className="clearfix">
          <div className="pull-right" style={{ display: "flex" }}>
            <Button variant="outlined" onClick={onCancel}>{i18next.t("app.cancel")}</Button>
            {isEditing && <div style={{ marginLeft: 7 }}>
              <Button variant="outlined" onClick={onDelete}>{i18next.t("app.delete")}</Button>
            </div>}
            <div style={{ marginLeft: 7 }}>
              <Button variant="contained" color="primary" onClick={this.handleSave}>{i18next.t("app.saveChanges")}</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
