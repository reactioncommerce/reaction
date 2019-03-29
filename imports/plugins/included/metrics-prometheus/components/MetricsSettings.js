import Button from "@material-ui/core/Button";
import Checkbox from "@reactioncommerce/components/Checkbox/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import PropTypes from "prop-types";
import React, { Component } from "react";
import SimpleSchema from "simpl-schema";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import info from "../info";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Form } from "reacto-form";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { Translation } from "/imports/plugins/core/ui/client/components";

const settingsSchema = new SimpleSchema({
  path: {
    type: String,
    optional: false,
    regEx: /^\/\w+/
  }
});

const settingsValidator = settingsSchema.getFormValidator();

class MetricsSettings extends Component {
  static propTypes = {
    packageData: PropTypes.shape({
      _id: PropTypes.requiredString,
      settings: PropTypes.shape({
        public: PropTypes.shape({
          path: PropTypes.requiredString,
          enabled: PropTypes.bool
        })
      })
    })
  };

  constructor(props) {
    super(props);
    this.state = { ...props.packageData.settings.public };
  }

  handleSetPath = (event) => this.setState({ path: event.target.value });

  handleSetEnabled = (event, isChecked) => {
    this.form.state.value.enabled = isChecked;
  };

  handleClickSave = () => {
    if (this.form) {
      this.form.submit();
    }
  };

  handleFormValidate = (doc) => settingsValidator(settingsSchema.clean(doc));

  handleFormSubmit = (input) => {
    const fields = [{ property: "path", value: input.path }, { property: "enabled", value: input.enabled }];

    Meteor.call("registry/update", this.props.packageData._id, "public", fields, (err) => {
      if (err) {
        return Alerts.toast(i18next.t("admin.settings.saveFailed"), "error");
      }
      return Alerts.toast(i18next.t("admin.settings.saveSuccess"), "success");
    });
  };

  render = () => {
    settingsSchema.labels({ path: i18next.t(`${info.ns}.settings.pathLabel`) });
    const state = { ...this.props.packageData.settings.public };
    return (
      <Form
        ref={(formRef) => {
          this.form = formRef;
        }}
        onSubmit={this.handleFormSubmit}
        validator={this.handleFormValidate}
        value={state}
      >
        <h1>
          <Translation defaultValue={info.displayName} i18nKey={`${info.ns}.displayName`} />
        </h1>
        <Checkbox type="checkbox" name="enabled" label={i18next.t(`${info.ns}.settings.enabledLabel`)} />
        <Field name="path" label={i18next.t(`${info.ns}.settings.pathLabel`)} labelFor="path" isRequired={true}>
          <TextInput name="path" />
          <ErrorsBlock names={["path"]} />
        </Field>
        <Button color="primary" onClick={this.handleClickSave} variant="contained">
          {i18next.t("app.saveChanges")}
        </Button>
      </Form>
    );
  };
}

const composer = (props, onData) => {
  const subscription = Meteor.subscribe("Packages", Reaction.getShopId());
  if (subscription.ready()) {
    const packageData = Packages.findOne({
      name: info.packageName,
      shopId: Reaction.getShopId()
    });
    onData(null, { packageData });
  }
};

export default composeWithTracker(composer)(MetricsSettings);
