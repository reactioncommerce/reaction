import React from "react";
import PropTypes from "prop-types";
import { Form } from "/imports/plugins/core/ui/client/components";

/**
 * @method TaxCloudSettingsForm
 * @summary renders a form for updating TaxCloud settings.
 * @param {Object} props - some data for use by this component.
 * @since 1.5.1
 * @return {Object} - returns a JSX element for rendering.
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
