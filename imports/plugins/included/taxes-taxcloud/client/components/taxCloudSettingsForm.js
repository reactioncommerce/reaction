import React from "react";
import PropTypes from "prop-types";
import { Form } from "/imports/plugins/core/ui/client/components";

/**
 * @file TaxCloudSettingsForm is a React Component for changing TaxCloud
 * settings.
 * @module TaxCloudSettingsForm
 */

/**
 * @method TaxCloudSettingsForm
 * @summary renders a form for updating TaxCloud settings.
 * @param {Object} props - some data for use by this component.
 * @property {Object} doc - current TaxCloud settings.
 * @property {String} docPath - the field in the TaxCloud Package where settings are stored.
 * @property {Object} fields - info about the fields the form is to show.
 * @property {Function} handleSubmit - a function for saving new TaxCloud settings.
 * @property {Array} hideFields - the fields (from the TaxCloud Package) to hide from the form.
 * @property {String} name - the name of this provider in lowercase (i.e taxcloud).
 * @property {Object} schema - info about the DB structure of the TaxCloud Package.
 * @since 1.5.2
 * @return {Node} - a React node containing the TaxCloud settings form.
 */
const TaxCloudSettingsForm = (props) => {
  return (
    <Form
      schema={props.schema}
      doc={props.doc}
      docPath={props.docPath}
      fields={props.fields}
      hideFields={props.hideFields}
      name={props.name}
      onSubmit={props.handleSubmit}
    />
  );
};

/**
  * @name TaxCloudSettingsForm propTypes
  * @type {propTypes}
  * @param {Object} props - React PropTypes
  * @property {Object} doc - data about the current TaxCloud settings.
  * @property {String} docPath - the field in the TaxCloud Package where settings are saved.
  * @property {Object} fields - info about the fields of the TaxCloud Package
  * that the settings form will allow users to change.
  * @property {Function} handleSubmit - a function that saves new TaxCloud settings.
  * @property {Array} hideFields - an array of the TaxCloud Package's fields
  * to hide from the settings form.
  * @property {String} name - the name of this provider in lowercase.
  * @property {Object} schema - info about the schema used by the TaxCloud Package.
  * @return {Array} React propTypes
  */
TaxCloudSettingsForm.propTypes = {
  doc: PropTypes.object,
  docPath: PropTypes.string,
  fields: PropTypes.object,
  handleSubmit: PropTypes.func,
  hideFields: PropTypes.arrayOf(PropTypes.string),
  name: PropTypes.string,
  schema: PropTypes.object
};

export default TaxCloudSettingsForm;
