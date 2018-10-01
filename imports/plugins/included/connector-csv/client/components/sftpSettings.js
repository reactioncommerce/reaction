import React, { Component } from "react";
import PropTypes from "prop-types";
import { uniqueId } from "lodash";
import { Form } from "reacto-form";
import Button from "@reactioncommerce/components/Button/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { i18next } from "/client/api";

class SFTPSettings extends Component {
  handleSave = () => {
    if (this.form) {
      this.form.submit();
    }
  }

  handleTestForImportAndExport = () => {
    this.props.onTestForImportAndExport();
  }

  uniqueInstanceIdentifier = uniqueId("SFTPSettingsForm");

  render() {
    const { onSubmit, validator, values } = this.props;

    const ipAddressInputId = `ipAddress_${this.uniqueInstanceIdentifier}`;
    const portInputId = `port_${this.uniqueInstanceIdentifier}`;
    const usernameInputId = `username_${this.uniqueInstanceIdentifier}`;
    const passwordInputId = `password_${this.uniqueInstanceIdentifier}`;

    return (
      <div>
        <div className="row" style={{ margin: "20px 0" }}>
          <p>{i18next.t("admin.dashboard.sftpSettings")}</p>
        </div>
        <Form ref={(formRef) => { this.form = formRef; }} onSubmit={onSubmit} validator={validator} value={values}>
          <div className="row">
            <div className="col-md-12">
              <Field name="ipAddress" label={i18next.t("admin.dashboard.sftpIPAddress")} labelFor={ipAddressInputId}>
                <TextInput id={ipAddressInputId} name="ipAddress" placeholder="111.111.111.111"/>
                <ErrorsBlock names={["ipAddress"]} />
              </Field>
            </div>
            <div className="col-md-12">
              <Field name="port" label={i18next.t("admin.dashboard.sftpPort")} labelFor={portInputId}>
                <TextInput id={portInputId} name="port" placeholder="22"/>
                <ErrorsBlock names={["port"]} />
              </Field>
            </div>
            <div className="col-md-12">
              <Field name="username" label={i18next.t("admin.dashboard.sftpUsername")} labelFor={usernameInputId}>
                <TextInput id={usernameInputId} name="username" />
                <ErrorsBlock names={["username"]} />
              </Field>
            </div>
            <div className="col-md-12">
              <Field name="password" label={i18next.t("admin.dashboard.sftpPassword")} labelFor={passwordInputId}>
                <TextInput id={passwordInputId} name="password" type="password"/>
                <ErrorsBlock names={["password"]} />
              </Field>
            </div>
          </div>
          <div className="row" style={{ margin: "20px 0" }}>
            <Button actionType="default" onClick={this.handleSave}>{i18next.t("admin.dashboard.save")}</Button>
          </div>
          <div className="row">
            <Button actionType="secondary" onClick={this.handleTestForImportAndExport}>
              {i18next.t("admin.dashboard.sftpTest")}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

SFTPSettings.propTypes = {
  onSubmit: PropTypes.func,
  onTestForImportAndExport: PropTypes.func,
  validator: PropTypes.func,
  values: PropTypes.object
};

export default SFTPSettings;
