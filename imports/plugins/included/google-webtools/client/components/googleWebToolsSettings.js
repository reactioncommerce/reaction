import React, { Component } from "react";
import PropTypes from "prop-types";
import { uniqueId } from "lodash";
import { Form } from "reacto-form";
import Button from "@reactioncommerce/components/Button/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { i18next } from "/client/api";

class GoogleWebToolsSettings extends Component {
  handleSave = () => {
    if (this.form) {
      this.form.submit();
    }
  }

  uniqueInstanceIdentifier = uniqueId("GoogleWebToolsSettingsForm");

  render() {
    const { onSubmit, validator, values } = this.props;

    const siteVerificationTokenInputId = `siteVerificationToken_${this.uniqueInstanceIdentifier}`;

    return (
      <div>
        <Form ref={(formRef) => { this.form = formRef; }} onSubmit={onSubmit} validator={validator} value={values}>
          <div className="row">
            <div className="col-md-12">
              <Field name="siteVerificationToken" label={i18next.t("admin.dashboard.siteVerificationToken")} labelFor={siteVerificationTokenInputId}>
                <TextInput id={siteVerificationTokenInputId} name="siteVerificationToken" />
                <ErrorsBlock names={["siteVerificationToken"]} />
              </Field>
            </div>
          </div>
          <div className="row" style={{ margin: "20px 0" }}>
            <Button actionType="default" onClick={this.handleSave}>{i18next.t("admin.dashboard.save")}</Button>
          </div>
        </Form>
      </div>
    );
  }
}

GoogleWebToolsSettings.propTypes = {
  onSubmit: PropTypes.func,
  validator: PropTypes.func,
  values: PropTypes.object
};

export default GoogleWebToolsSettings;
