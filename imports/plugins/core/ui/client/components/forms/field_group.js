import React, { PropTypes } from "react";
import { FormGroup, ControlLabel, FormControl, HelpBlock } from "react-bootstrap";

// Renders a form field group with label, input (use 'type' prop to define what kind),
// and optional validation help text
const FieldGroup = ({ id, label, help, children, i18n, ...props }) => (
  <FormGroup controlId={id}>
    <ControlLabel data-i18n={i18n}>{label}</ControlLabel>
    <FormControl {...props}>
      {children}
    </FormControl>
    {help && <HelpBlock>{help}</HelpBlock>}
  </FormGroup>
);

FieldGroup.propTypes = {
  children: PropTypes.node,
  help: PropTypes.node,
  i18n: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string
};

export default FieldGroup;
