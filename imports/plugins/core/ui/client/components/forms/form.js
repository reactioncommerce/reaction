/* eslint-disable consistent-return */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { at, get, isEqual, set, update } from "lodash";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class Form extends Component {
  static defaultProps = {
    autoSave: false,
    renderFromFields: false,
    fieldsProp: {}
  }

  /**
  * @name Form propTypes
  * @type {propTypes}
  * @param {Object} props - React PropTypes
  * @property {Boolean} autoSave - controls autoSave and rendering of Submit button.
  * @property {Object} doc - the object that will have the form state.
  * @property {String} docPath - the path in the schema which will be used for validation or to render fields.
  * @property {Array} fields - fields to render.
  * @property {Object} fieldsProps - map of field specific properties passed to underlying components.
  * @property {Array} hideFields - fields to hide.
  * @property {String} name
  * @property {Func} onSubmit
  * @property {Boolean} renderFromFields - this controls whether form is rendered from schema or from fields.
  * @property {Object} schema - the schema used for validation and rendering.
  * @returns {Array} React propTypes
  * @ignore
  */
  static propTypes = {
    autoSave: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    doc: PropTypes.object,
    docPath: PropTypes.string,
    fields: PropTypes.object,
    fieldsProp: PropTypes.object,
    hideFields: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string,
    onSubmit: PropTypes.func,
    renderFromFields: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    schema: PropTypes.object // eslint-disable-line react/boolean-prop-naming
  }

  constructor(props) {
    super(props);

    this.state = {
      doc: props.doc,
      schema: this.validationSchema(),
      isValid: undefined
    };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
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
      const objectKeys = this.objectKeys[`${docPath}.`];
      if (Array.isArray(objectKeys)) {
        // Use the objectKeys from parent fieldset to generate
        // actual form fields
        const fieldNames = objectKeys.map((fieldName) => `${docPath}.${fieldName}`);

        return this.props.schema.pick(fieldNames).newContext();
      }
    }

    return this.props.schema.namedContext();
  }

  get objectKeys() {
    return this.props.schema._objectKeys;
  }

  get schema() {
    return this.props.schema.mergedSchema();
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
    const isValid = this.state.schema.validate(cleanedObject);
    // Finally validate the document
    this.setState({ isValid });

    return { isValid };
  }

  isFieldHidden(fieldName) {
    if (Array.isArray(this.props.hideFields) && this.props.hideFields.indexOf(fieldName) >= 0) {
      return true;
    }

    return false;
  }

  handleChange = (event, value, name) => {
    const newdoc = update(this.state.doc, name, () => value);
    // Calling user defined field specific handleChange function
    if (this.props.fieldsProp[name] && typeof this.props.fieldsProp[name].handleChange === "function") {
      this.props.fieldsProp[name].handleChange(event, value, name);
    }

    this.setState({
      doc: newdoc
    }, () => {
      if (this.props.autoSave === true) {
        this.handleSubmit(event);
      } else {
        this.validate();
      }
    });
  }

  handleSelectChange = (value, name) => {
    this.handleChange(new Event("onSelect"), value, name);
  }

  handleMultiSelectChange = (value, name) => {
    this.handleChange(new Event("onMultiSelect"), value.map((val) => val.value), name);
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    // Need to wait for this before using this.state.isValid
    // as validate() changes state.
    const isValid = this.validate();

    if (this.props.onSubmit) {
      this.props.onSubmit(event, {
        doc: this.state.doc,
        isValid
      }, this.props.name);
    }
  }

  renderFormField(field) {
    const sharedProps = {
      i18nKeyLabel: `admin.${field.name}`,
      key: field.name,
      label: field.label,
      name: field.name
    };

    let fieldElement;
    let helpText;
    // Checking for user defined render style else using what is best according to the type.
    switch (field.renderComponent || field.type) {
      case "boolean":
        fieldElement = (
          <Components.Switch
            {...sharedProps}
            onChange={this.handleChange}
            checked={this.valueForField(field.name)}
          />
        );
        break;
      case "string":
        fieldElement = (
          <Components.TextField
            {...sharedProps}
            onChange={this.handleChange}
            value={this.valueForField(field.name)}
            multiline={field.multiline}
            maxRows={field.maxRows}
            disabled={field.disabled}
            type={field.inputType}
          />
        );
        break;
      case "select":
        fieldElement = (
          <Components.Select
            {...sharedProps}
            onChange={this.handleSelectChange}
            options={field.options}
            value={this.valueForField(field.name)}
          />
        );
        break;
      case "multiselect":
        fieldElement = (
          <Components.MultiSelect
            {...sharedProps}
            multi={true}
            onChange={this.handleMultiSelectChange}
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
      this.state.schema.validationErrors()
        .filter((val) => val.name === field.name)
        .forEach((validationError) => {
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
    const { schema } = this.props;
    const { fieldName } = field;

    if (this.isFieldHidden(fieldName) === false) {
      const fieldSchema = schema.getDefinition(fieldName);

      // Get the type from the schema, as a typeof string
      const fieldType = fieldSchema.type[0].type;
      let fieldTypeString;
      if (fieldType === "SimpleSchema.Integer") {
        fieldTypeString = "number";
      } else {
        // This assumes that oneOf is not used for any schema types
        fieldTypeString = typeof fieldType();
      }

      const fieldProps = {
        ...fieldSchema,
        name: fieldName,
        type: fieldTypeString,
        ...additionalFieldProps
      };

      return this.renderFormField(fieldProps);
    }

    return null;
  }

  renderWithSchema() {
    const { docPath, fieldsProp, renderFromFields } = this.props;

    if (!this.props.schema) {
      return null;
    }
    // Render form with a specific docPath
    if (!renderFromFields && docPath) {
      return Object.keys(this.schema).map((key) => {
        if (!key.endsWith(docPath)) {
          return;
        }
        const objectKeys = this.objectKeys[`${docPath}.`];
        if (Array.isArray(objectKeys)) {
          // Use the objectKeys from parent fieldset to generate
          // actual form fields
          return objectKeys.map((fieldName) => {
            const fullFieldName = docPath ? `${docPath}.${fieldName}` : fieldName;
            return this.renderField({ fieldName: fullFieldName });
          });
        }
        return this.renderField({ fieldName: key });
      });
    }

    // Render form by only using desired fields from schema
    if (this.props.fields) {
      return Object.keys(this.props.fields).map((key) => {
        const fieldData = this.props.fields[key];
        const fieldSchema = this.schema[key];
        const tempObj = Object.assign({}, fieldData);
        if (!fieldSchema) {
          return;
        }
        // Remove inherited type() as type is supposed to be string.
        if (typeof tempObj.type === "function") {
          delete tempObj.type;
        }
        const fieldProp = get(fieldsProp, key, {});
        return this.renderField({ fieldName: key }, Object.assign(tempObj, fieldProp));
      });
    }

    // Render all fields if none of the options are set above
    return Object.keys(this.schema).map((key) => // eslint-disable-line consistent-return
      this.renderField({ fieldName: key }));
  }

  renderFormActions() {
    if (this.props.autoSave === false) {
      return (
        <Components.FormActions>
          <Components.Button
            label={"Save Changes"}
            i18nKeyLabel={"app.saveChanges"}
            bezelStyle={"solid"}
            primary={true}
            type="submit"
          />
        </Components.FormActions>
      );
    }

    return null;
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

registerComponent("Form", Form);

export default Form;
