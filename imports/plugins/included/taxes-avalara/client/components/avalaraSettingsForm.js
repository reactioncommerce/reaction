import React, { Component } from "react";
import { inRange } from "lodash";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Form, Loading } from "/imports/plugins/core/ui/client/components";
import { Components } from "@reactioncommerce/reaction-components";
import { AvalaraPackageConfig } from "../../lib/collections/schemas";
import { Logs } from "/lib/collections";
import { Logs as LogSchema } from "/lib/collections/schemas/logs";
import { i18next } from "/client/api";

/**
 * @file AvalaraSettingsForm is a React Component used to change Avalara
 * settings.
 * @module AvalaraSettingsForm
 */


/**
 * @method AvalaraSettingsForm
 * @summary renders a form for updating Avalara settings.
 * @param {Object} props - some data for use by this component.
 * @property {Function} handleSubmit - a function for saving new Avalara settings.
 * @property {Array} hiddenFields - the fields (of the Avalara Package) to hide from the form.
 * @property {Object} settings - the value of the "settings" field in the Avalara Package.
 * @property {Object} shownFields - info about the fields the form is to show.
 * @return {Node} - a React node containing the Avalara settings form.
 */
class AvalaraSettingsForm extends Component {
  /**
  * @name AvalaraSettingsForm propTypes
  * @type {propTypes}
  * @param {Object} props - React PropTypes
  * @property {Object} fieldsProps - map of field specific properties for avalara settings.
  * @property {Function} handleSubmit - a function that saves new Avalara settings.
  * @property {Array} hiddenFields - an array of the Avalara Package's fields
  * to hide from the settings form.
  * @property {Object} logFieldsProps - map of field specific properties for logs.
  * @property {Object} settings - the value of the "settings" field in the Avalara Package.
  * @property {Object} shownFields - info about the fields of the Avalara Package
  * that the settings form will allow users to change.
  * @property {Object} shownLogFields - fields to show from Log schema
  * @return {Array} React propTypes
  */
  static propTypes = {
    fieldsProp: PropTypes.object,
    hiddenFields: PropTypes.arrayOf(PropTypes.string),
    logFieldsProp: PropTypes.object,
    settings: PropTypes.object,
    shownFields: PropTypes.object,
    shownLogFields: PropTypes.object
  };
  static filteredFields = ["data.request.data.date", "data.request.data.type"];
  static noDataMessage = i18next.t("logGrid.noLogsFound");

  // helper adds a class to every grid row
  static customRowMetaData = {
    bodyCssClassName: () => "log-grid-row"
  };

  constructor(props) {
    super(props);

    this.handleTestCredentials = this.handleTestCredentials.bind(this);

    this.state = {
      showLogs: props.settings.avalara.enableLogging,
      fieldsProp: {
        ...props.fieldsProp,
        "settings.avalara.enableLogging": {
          handleChange: this.handleLogToggle
        }
      }
    };
  }

  /**
    * handleSubmit
    * @method
    * @summary event handler for when new Avalara settings are submitted.
    * @param {Object} event - event info.
    * @param {Object} changedInfo - info about the new Avalara settings.
    * @param {String} targetField - where to save the new settings in the Avalara Package.
    * @return {null} - returns nothing
    */
  handleSubmit(event, changedInfo, targetField) { // eslint-disable-line no-unused-vars
    if (!changedInfo.isValid) {
      return;
    }
    Meteor.call("package/update", "taxes-avalara", "settings", changedInfo.doc.settings, (error) => {
      if (error) {
        Alerts.toast(
          i18next.t("admin.update.avalaraUpdateFailed", { defaultValue: "Failed to update Avalara settings." }),
          "error"
        );
        return;
      }
      Alerts.toast(
        i18next.t("admin.update.avalaraUpdateSucceeded", { defaultValue: "Avalara settings updated." }),
        "success"
      );
    });
  }

  handleTestCredentials() {
    Meteor.call("avalara/testCredentials", this.props.settings.avalara, (error, result) => {
      if (error && error.message) {
        return Alerts.toast(`${i18next.t("settings.testCredentialsFailed")} ${error.message}`, "error");
      }
      try {
        const { statusCode } = result;
        const connectionValid = inRange(statusCode, 400);
        if (connectionValid) {
          return Alerts.toast(i18next.t("settings.testCredentialsSuccess"), "success");
        }
        return Alerts.toast(i18next.t("settings.testCredentialsFailed"), "error");
      } catch (err) {
        return Alerts.toast(i18next.t("settings.testCredentialsFailed"), "error");
      }
    });
  }

  handleLogToggle = () => {
    this.setState((prevState) => ({ showLogs: !prevState.showLogs }));
  }

  /**
  * Shows the selected log in detail.
  * @param  {Object} options
  * @memberof AvalaraSettingsForm
  */
  editRow = (options) => {
    const currentId = this.state.editingId;
    const id = options.props.data._id;
    const log = Logs.findOne(id) || {};
    log.data = JSON.stringify(log.data, null, 4);
    this.setState({
      editingId: id,
      log
    });
    // toggle edit mode clicking on same row
    if (currentId === options.props.data._id) {
      this.setState({
        editingId: undefined,
        log: undefined
      });
    }
  }

  render() {
    const { hiddenFields, settings, shownFields, shownLogFields } = this.props;

    // add i18n handling to headers
    const customColumnMetadata = AvalaraSettingsForm.filteredFields.reduce((arr, field) => {
      arr.push({
        accessor: field,
        Header: i18next.t(`logGrid.columns.${field}`)
      });
      return arr;
    }, []);


    return (
      <div className="rui avalara-update-form">
        {!(settings.avalara.apiLoginId) &&
          <div className="alert alert-info">
            <Components.Translation defaultValue="Add API Login ID to enable" i18nKey="admin.taxSettings.avalaraCredentials" />
            <a href="https://admin-development.avalara.net" target="_blank">Avalara</a>
          </div>
        }
        <Form
          schema={AvalaraPackageConfig}
          doc={{ settings }}
          renderFromFields
          fieldsProp={this.state.fieldsProp}
          docPath="settings.avalara"
          name="settings.avalara"
          fields={shownFields}
          hideFields={hiddenFields}
          onSubmit={this.handleSubmit}
        />
        <div id="testAvalaraCredentialsContainer">
          <Components.Button id="testAvalaraCredentials" label="Test Credentials" buttonType="button"
            className="btn btn-default" i18nKeyLabel="admin.dashboard.avalaraTestCredentials"
            bezelStyle="outline" onClick={this.handleTestCredentials}
          />
        </div>
        <div className="panel-body text-center avalara-login-box">
          <a href="https://admin-development.avalara.net" target="_blank">Avalara Admin Console Login</a>
        </div>
        {!!this.state.showLogs &&
        (
          <Components.SortableTable
            publication="Logs"
            collection= {Logs}
            query= {{ logType: "avalara" }}
            matchingResultsCount="logs-count"
            showFilter
            rowMetadata= {AvalaraSettingsForm.customRowMetaData}
            filteredFields= {AvalaraSettingsForm.filteredFields}
            columns= {AvalaraSettingsForm.filteredFields}
            noDataMessage= {AvalaraSettingsForm.noDataMessage}
            onRowClick= {this.editRow}
            columnMetadata= {customColumnMetadata}
            externalLoadingComponent= {Loading}
          />
        )}
        <div>
          {!!this.state.log &&
          (
            <Form
              schema={LogSchema}
              doc={this.state.log}
              fields={shownLogFields}
              fieldsProp={this.props.logFieldsProp}
              autoSave
            />
          )}
        </div>
      </div>);
  }
}

export default AvalaraSettingsForm;
