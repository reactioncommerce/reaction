import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form } from "/imports/plugins/core/ui/client/components";
import { Components } from "@reactioncommerce/reaction-components";
import { AvalaraPackageConfig } from "../../lib/collections/schemas";

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
const AvalaraSettingsForm = (props) => {

  function handleTestCredentials(event) {
    props.handleTestCredentials(event, settings);
  }

  const { handleSubmit, hiddenFields, settings, shownFields } = props;
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
        name={"settings.avalara"}
        fields={shownFields}
        hideFields={hiddenFields}
        onSubmit={handleSubmit}
      />
      <Components.Button id="testAvalaraCredentials" label="Test Credentials" buttonType="button" className="btn btn-default pull-right" data-event-action="testCredentials" i18nKeyLabel="admin.dashboard.avalaraTestCredentials" bezelStyle="outline" onClick={handleTestCredentials}/>
    </div>
  );
};

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
AvalaraSettingsForm.propTypes = {
  handleSubmit: PropTypes.func,
  hiddenFields: PropTypes.arrayOf(PropTypes.string),
  settings: PropTypes.object,
  shownFields: PropTypes.object
};

export default AvalaraSettingsForm;