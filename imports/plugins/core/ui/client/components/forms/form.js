import React, { Component, PropTypes } from "react";
import { map, update, set, at, isEqual } from "lodash";
import classnames from "classnames";
import { toCamelCase } from "/lib/api";
import { Switch, Button, TextField, Select, FormActions } from "../";

class Form extends Component {
  static defaultProps = {
    autoSave: false
  }

  static propTypes = {
    autoSave: PropTypes.bool,
    doc: PropTypes.object,
    docPath: PropTypes.string,
    fields: PropTypes.object,
    hideFields: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string,
    onSubmit: PropTypes.func,
    schema: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      doc: props.doc,
      schema: this.validationSchema(),
      isValid: undefined
    };
  }

  componentWillReceiveProps(nextProps) {
    if (isEqual(nextProps.doc, this.props.doc) === false) {
      this.setState({
        doc: nextProps.doc,
        schema: this.validationSchema()
      });
    }
  }


  validationSchema() {
    const { docPath } = this.props;

    if (docPath) {
      const objectKeys = this.objectKeys[docPath + "."];
      if (Array.isArray(objectKeys)) {
        // Use the objectKeys from parent fieldset to generate
        // actual form fields
        const fieldNames = objectKeys.map((fieldName) => {
          return `${docPath}.${fieldName}`;
        });

        return this.props.schema.pick(fieldNames).newContext();
      }
    }

    return this.props.schema.namedContext();
  }

  get objectKeys() {
    return this.props.schema._objectKeys;
  }

  get schema() {
    return this.props.schema._schema;
  }

  valueForField(fieldName) {
    const picked = at(this.state.doc, fieldName);

    if (Array.isArray(picked) && picked.length) {
      return picked[0];
    }

    return undefined;
  }

  validate() {
    const { docPath } = this.props;

    // Create a smaller document in order to validate without extra fields
    const docToValidate = set(
      {},
      docPath,
      at(this.state.doc, this.props.docPath)[0]
    );

    // Clean any fields not in schame to avoid needless validation errors
    const cleanedObject = this.state.schema._simpleSchema.clean(docToValidate);

    // Finally validate the document
    this.setState({
      isValid: this.state.schema.validate(cleanedObject)
    });
  }

  isFieldHidden(fieldName) {
    if (Array.isArray(this.props.hideFields) && this.props.hideFields.indexOf(fieldName) >= 0) {
      return true;
    }

    return false;
  }

  handleChange = (event, value, name) => {
    const newdoc = update(this.state.doc, name, () => {
      return value;
    });

    this.setState({
      doc: newdoc
    }, () => {
      this.validate();
    });

    if (this.props.autoSave === true) {
      this.handleSubmit(event);
    }
  }

  handleSelectChange = (value, name) => {
    this.handleChange(new Event("onSelect"), value, name);
  }

  handleSubmit = (event) => {
    event.preventDefault();

    this.validate();

    if (this.props.onSubmit) {
      this.props.onSubmit(event, {
        doc: this.state.doc,
        isValid: this.state.isValid
      }, this.props.name);
    }
  }

  renderFormField(field) {
    const sharedProps = {
      i18nKeyLabel: `settings.${toCamelCase(field.name)}`,
      key: field.name,
      label: field.label,
      name: field.name
    };

    let fieldElement;
    let helpText;

    switch (field.type) {
      case "boolean":
        fieldElement = (
          <Switch
            {...sharedProps}
            onChange={this.handleChange}
            checked={this.valueForField(field.name)}
          />
        );
        break;
      case "string":
        fieldElement = (
          <TextField
            {...sharedProps}
            onChange={this.handleChange}
            value={this.valueForField(field.name)}
          />
        );
        break;
      case "select":
        fieldElement = (
          <Select
            {...sharedProps}
            onChange={this.handleSelectChange}
            options={field.options}
            value={this.valueForField(field.name)}
          />
        );
        break;
      default:
        return null;
    }

    let fieldHasError = false;

    if (this.state.isValid === false) {
      this.state.schema._invalidKeys
        .filter((v) => v.name === field.name)
        .map((validationError) => {
          const message = this.state.schema.keyErrorMessage(validationError.name);
          fieldHasError = true;

          helpText = (
            <div className="help-block">
              {message}
            </div>
          );
        });
    }

    const formGroupClassName = classnames({
      "rui": true,
      "form-group": true,
      "has-error": fieldHasError
    });

    return (
      <div key={`${sharedProps.key}-group`} className={formGroupClassName}>
        {fieldElement}
        {helpText}
      </div>
    );
  }

  renderField(field, additionalFieldProps) {
    const { fieldName } = field;

    if (this.isFieldHidden(fieldName) === false) {
      const fieldSchema = this.schema[fieldName];
      const fieldProps = {
        ...fieldSchema,
        name: fieldName,
        type: typeof fieldSchema.type(),
        ...additionalFieldProps
      };

      return this.renderFormField(fieldProps);
    }

    return null;
  }

  renderWithSchema() {
    const { docPath } = this.props;

    if (this.props.schema) {
      // Render form with a specific docPath
      if (docPath) {
        return map(this.schema, (field, key) => { // eslint-disable-line consistent-return
          if (key.endsWith(docPath)) {
            const objectKeys = this.objectKeys[docPath + "."];
            if (Array.isArray(objectKeys)) {
              // Use the objectKeys from parent fieldset to generate
              // actual form fields
              return objectKeys.map((fieldName) => {
                const fullFieldName = docPath ? `${docPath}.${fieldName}` : fieldName;
                return this.renderField({ fieldName: fullFieldName });
              });
            }

            return this.renderField({ fieldName: key });
          }
        });
      }

      // Render form by only using desired fields from schema
      if (this.props.fields) {
        return map(this.props.fields, (fieldData, key) => { // eslint-disable-line consistent-return
          const fieldSchema = this.schema[key];
          if (fieldSchema) {
            return this.renderField({ fieldName: key }, fieldData);
          }
        });
      }

      // Render all fields if none of the options are set above
      return map(this.schema, (field, key) => { // eslint-disable-line consistent-return
        return this.renderField({ fieldName: key });
      });
    }

    return null;
  }

  renderFormActions() {
    if (this.props.autoSave === false) {
      return (
        <FormActions>
          <Button
            label={"Save Changes"}
            bezelStyle={"solid"}
            primary={true}
            type="submit"
          />
        </FormActions>
      );
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.renderWithSchema()}
        {this.renderFormActions()}
      </form>
    );
  }
}

export default Form;
