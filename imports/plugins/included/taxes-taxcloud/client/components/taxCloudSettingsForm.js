import React from "react";
import PropTypes from "prop-types";
import { Form } from "/imports/plugins/core/ui/client/components";
import { Components } from "@reactioncommerce/reaction-components";
import { TaxCloudPackageConfig } from "../../lib/collections/schemas";

/**
 * @file TaxCloudSettingsForm is a React Component used to change TaxCloud
 * settings.
 * @module TaxCloudSettingsForm
 */

/**
 * @method TaxCloudSettingsForm
 * @summary renders a form for updating TaxCloud settings.
 * @param {Object} props - some data for use by this component.
 * @property {Function} handleSubmit - a function for saving new TaxCloud settings.
 * @property {Array} hiddenFields - the fields (of the TaxCloud Package) to hide from the form.
 * @property {Object} settings - the value of the "settings" field in the TaxCloud Package.
 * @property {Object} shownFields - info about the fields the form is to show.
 * @since 1.5.2
 * @return {Node} - a React node containing the TaxCloud settings form.
 */
const TaxCloudSettingsForm = (props) => {
  const { handleSubmit, hiddenFields, settings, shownFields } = props;
  return (
    <div className="rui taxcloud-settings-form">
      {!settings.taxcloud.apiLoginId &&
        <div className="alert alert-info">
          <Components.Translation
            defaultValue="Add API Login ID to enable"
            i18nKey="admin.taxSettings.taxcloudCredentials"
          />&nbsp;
          <a href="https://www.taxcloud.com/" target="_blank">TaxCloud</a>
        </div>
      }
      <Form
        schema={TaxCloudPackageConfig}
        doc={{ settings }}
        docPath={"settings.taxcloud"}
        name={"settings.taxcloud"}
        fields={shownFields}
        hideFields={hiddenFields}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

/**
  * @name TaxCloudSettingsForm propTypes
  * @type {propTypes}
  * @param {Object} props - React PropTypes
  * @property {Function} handleSubmit - a function that saves new TaxCloud settings.
  * @property {Array} hiddenFields - an array of the TaxCloud Package's fields
  * to hide from the settings form.
  * @property {Object} settings - the value of the "settings" field in the TaxCloud Package.
  * @property {Object} shownFields - info about the fields of the TaxCloud Package
  * that the settings form will allow users to change.
  * @return {Array} React propTypes
  */
TaxCloudSettingsForm.propTypes = {
  handleSubmit: PropTypes.func,
  hiddenFields: PropTypes.arrayOf(PropTypes.string),
  settings: PropTypes.object,
  shownFields: PropTypes.object
};

export default TaxCloudSettingsForm;
