import React from "react";
import PropTypes from "prop-types";
import { Form } from "/imports/plugins/core/ui/client/components";

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
