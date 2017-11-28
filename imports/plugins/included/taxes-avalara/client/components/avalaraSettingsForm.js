import React, { Component } from "react";
import { assign, clone } from "lodash";
import PropTypes from "prop-types";
import { Form } from "/imports/plugins/core/ui/client/components";
import { Components } from "@reactioncommerce/reaction-components";
import { AvalaraPackageConfig } from "../../lib/collections/schemas";
import { Logs } from "/lib/collections";
import { Logs as LogSchema } from "/lib/collections/schemas/logs";
import { i18next } from "/client/api";
import { Loading } from "/imports/plugins/core/ui/client/components";

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
 * @since 1.5.2
 * @return {Node} - a React node containing the Avalara settings form.
 */
class AvalaraSettingsForm extends Component {
  /**
  * @name AvalaraSettingsForm propTypes
  * @type {propTypes}
  * @param {Object} props - React PropTypes
  * @property {Function} handleSubmit - a function that saves new Avalara settings.
  * @property {Array} hiddenFields - an array of the Avalara Package's fields
  * to hide from the settings form.
  * @property {Object} settings - the value of the "settings" field in the Avalara Package.
  * @property {Object} shownFields - info about the fields of the Avalara Package
  * that the settings form will allow users to change.
  * @return {Array} React propTypes
  */
  static propTypes = {
    fieldsProp: PropTypes.object,
    handleSubmit: PropTypes.func,
    handleTestCredentials: PropTypes.func,
    hiddenFields: PropTypes.arrayOf(PropTypes.string),
    settings: PropTypes.object,
    shownFields: PropTypes.object,
    shownLogFields: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      editingId: undefined,
      showLogs: this.props.settings.avalara.enableLogging,
      log: undefined,
      fieldsProp: assign(clone(props.fieldsProp), {
        "settings.avalara.enableLogging": {
          handleChange: this.handleLogToggle
        }
      })
    };
  }

  handleLogToggle = () => {
    this.setState(() => ({ showLogs: !this.state.showLogs }));
  }

  handleTestCredentials = (event) => {
    this.props.handleTestCredentials(event, this.props.settings);
  }

  editRow = (options) => {
    const currentId = this.state.editingId;
    this.setState(() => {
      const id = options.props.data._id;
      const log = Logs.findOne(id) || {};
      log.data = JSON.stringify(log.data, null, 4);
      return {
        editingId: id,
        log
      };
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
    const { handleSubmit, hiddenFields, settings, shownFields, shownLogFields } = this.props;

    const filteredFields = [ "data.request.data.type", "data.request.data.date"];
    const noDataMessage = i18next.t("logGrid.noLogsFound");

    // helper adds a class to every grid row
    const customRowMetaData = {
      bodyCssClassName: () =>  {
        return "log-grid-row";
      }
    };

    // add i18n handling to headers
    const customColumnMetadata = [];
    filteredFields.forEach(function (field) {
      const columnMeta = {
        accessor: field,
        Header: i18next.t(`logGrid.columns.${field}`)
      };
      customColumnMetadata.push(columnMeta);
    });

    const logFieldsProp = {
      data: {
        renderComponent: "string",
        multiline: true,
        maxRows: 15,
        disabled: true
      },
      date: {
        disabled: true
      }
    };

    return (
      <div className="rui avalara-update-form">
        {!settings.avalara.apiLoginId &&
          <div className="alert alert-info">
            <Components.Translation defaultValue="Add API Login ID to enable" i18nKey="admin.taxSettings.taxcloudCredentials" />
            <a href="https://admin-development.avalara.net" target="_blank"> Avalara</a>
          </div>
        }
        <Form
          schema={AvalaraPackageConfig}
          doc={{ settings }}
          renderFromFields={true}
          fieldsProp={this.state.fieldsProp}
          docPath={"settings.avalara"}
          name={"settings.avalara"}
          fields={shownFields}
          hideFields={hiddenFields}
          onSubmit={handleSubmit}
        />
        <Components.Button id="testAvalaraCredentials" label="Test Credentials" buttonType="button"
          className="btn btn-default pull-right" i18nKeyLabel="admin.dashboard.avalaraTestCredentials"
          bezelStyle="outline" onClick={this.handleTestCredentials}
        />
        {this.state.showLogs &&
        (
          <Components.SortableTable
            publication={"Logs"}
            collection= {Logs}
            query= {{ logType: "avalara" }}
            matchingResultsCount= {"logs-count"}
            showFilter= {true}
            rowMetadata= {customRowMetaData}
            filteredFields= {filteredFields}
            columns= {filteredFields}
            noDataMessage= {noDataMessage}
            onRowClick= {this.editRow}
            columnMetadata= {customColumnMetadata}
            externalLoadingComponent= {Loading}
          />
        )}
        <div>
          {this.state.log &&
          (
            <Form
              schema={LogSchema}
              doc={this.state.log}
              fields={shownLogFields}
              fieldsProp={logFieldsProp}
              autoSave={true}
            />
          )}
        </div>
      </div>);
  }
}

export default AvalaraSettingsForm;
