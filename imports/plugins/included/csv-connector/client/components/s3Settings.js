import React, { Component } from "react";
import PropTypes from "prop-types";
import { uniqueId } from "lodash";
import { Form } from "reacto-form";
import Button from "@reactioncommerce/components/Button/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { i18next } from "/client/api";

class S3Settings extends Component {
  handleSave = () => {
    if (this.form) {
      this.form.submit();
    }
  }

  handleTestForImport = () => {
    this.props.onTestForImport();
  }

  handleTestForExport = () => {
    this.props.onTestForExport();
  }

  uniqueInstanceIdentifier = uniqueId("S3SettingsForm");

  render() {
    const { onSubmit, validator, values } = this.props;

    const accessKeyInputId = `accessKey_${this.uniqueInstanceIdentifier}`;
    const secretAccessKeyInputId = `secretAccessKey_${this.uniqueInstanceIdentifier}`;
    const bucketInputId = `bucket_${this.uniqueInstanceIdentifier}`;

    return (
      <div>
        <div className="row" style={{ margin: "20px 0" }}>
          <p>{i18next.t("admin.dashboard.s3Settings")}</p>
        </div>
        <Form ref={(formRef) => { this.form = formRef; }} onSubmit={onSubmit} validator={validator} value={values}>
          <div className="row">
            <div className="col-md-12">
              <Field name="accessKey" label={i18next.t("admin.dashboard.s3AccessKey")} labelFor={accessKeyInputId}>
                <TextInput id={accessKeyInputId} name="accessKey" />
                <ErrorsBlock names={["accessKey"]} />
              </Field>
            </div>
            <div className="col-md-12">
              <Field name="secretAccessKey" label={i18next.t("admin.dashboard.s3SecretAccessKey")} labelFor={secretAccessKeyInputId}>
                <TextInput id={secretAccessKeyInputId} name="secretAccessKey" />
                <ErrorsBlock names={["secretAccessKey"]} />
              </Field>
            </div>
            <div className="col-md-12">
              <Field name="bucket" label={i18next.t("admin.dashboard.s3Bucket")} labelFor={bucketInputId}>
                <TextInput id={bucketInputId} name="bucket" />
                <ErrorsBlock names={["bucket"]} />
              </Field>
            </div>
          </div>
          <div className="row" style={{ margin: "20px 0" }}>
            <Button actionType="default" onClick={this.handleSave}>{i18next.t("admin.dashboard.save")}</Button>
          </div>
          <div className="row">
            <Button actionType="secondary" onClick={this.handleTestForImport} className="mr20">
              {i18next.t("admin.dashboard.testImport")}
            </Button>
            <Button actionType="secondary" onClick={this.handleTestForExport}>
              {i18next.t("admin.dashboard.testExport")}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

S3Settings.propTypes = {
  onSubmit: PropTypes.func,
  onTestForExport: PropTypes.func,
  onTestForImport: PropTypes.func,
  validator: PropTypes.func,
  values: PropTypes.object
};

export default S3Settings;
