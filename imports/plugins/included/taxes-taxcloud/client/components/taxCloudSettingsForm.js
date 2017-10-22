import React from "react";
import PropTypes from "prop-types";
import { Form } from "/imports/plugins/core/ui/client/components";

/**
 * @file TaxCloudSettingsForm is a React Component for changing TaxCloud
 * settings.
 * @module TaxCloudSettingsForm
 * @extends Component
 */

// TODO: Do I need to add @property docs to this even though it's a pure
// component?
/**
 * @method TaxCloudSettingsForm
 * @summary renders a form for updating TaxCloud settings.
 * @param {Object} props - some data for use by this component.
 * @since 1.5.1
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
  * @property {String} docPath - the "path" (or field) in the TaxCloud Package
  * where new settings are to be saved.
  * @property {Object} fields - info about the fields of the TaxCloud Package
  * that the settings form will allow users to change.
  * @property {Function} handleSubmit - a function that saves new TaxCloud settings.
  * @property {Array} hideFields - an array of the TaxCloud Package's fields
  * to hide from the settings form.
  * @property {String} name - the field in the TaxCloud Package where new
  * settings are to be saved.
  * @property {Object} schema - info about the DB schema used by the
  * TaxCloud Package.
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
