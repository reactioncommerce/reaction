import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { TextField } from "/imports/plugins/core/ui/client/components/";
import { EditContainer } from "/imports/plugins/core/ui/client/containers";

class ProductField extends Component {
  static state = {}

  constructor(props) {
    super(props);

    this.state = {
      value: this.value
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.product.pageTitle !== this.state.value) {
      this.setState({
        value: nextProps.product[this.fieldName]
      });
    }
  }

  handleChange = (event, value) => {
    this.setState({
      value
    });
  }

  handleBlur = (event, value) => {
    if (this.props.onProductFieldChange) {
      this.props.onProductFieldChange(this.props.product._id, this.fieldName, value);
    }
  }

  get fieldName() {
    return this.props.fieldName;
  }

  get value() {
    return (this.state && this.state.value) || this.props.product[this.fieldName];
  }

  get showEditControls() {
    return this.props.product && this.props.editable;
  }

  renderEditButton() {
    if (this.showEditControls) {
      return (
        <span className="edit-controls">
          <EditContainer
            autoHideEditButton={true}
            data={this.props.product}
            editView="ProductAdmin"
            field={this.fieldName}
            i18nKeyLabel={`productDetailEdit.${this.field}`}
            label="Edit Field"
            permissions={["createProduct"]}
            {...this.props.editContainerProps}
          />
        </span>
      );
    }

    return null;
  }

  renderTextField() {
    const baseClassName = classnames({
      "pdp": true,
      "product-detail-edit": true,
      [`${this.fieldName}-edit`]: this.fieldName
    });

    const textFieldClassName = classnames({
      "pdp": true,
      "product-detail-edit": true,
      [`${this.fieldName}-edit-input`]: this.fieldName
    });

    return (
      <div className={baseClassName}>
        <TextField
          className={textFieldClassName}
          multiline={this.props.multiline}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          value={this.state.value}
          {...this.props.textFieldProps}
        />
        {this.renderEditButton()}
      </div>
    );
  }

  render() {
    if (this.showEditControls) {
      return this.renderTextField();
    }

    if (this.props.element) {
      return React.cloneElement(this.props.element, {
        className: "pdp field",
        itemProp: this.props.itemProp,
        children: this.value
      });
    }

    return (
      <div className="pdp field">
        {this.value}
      </div>
    );
  }
}

ProductField.propTypes = {
  editContainerProps: PropTypes.object,
  editable: PropTypes.bool,
  element: PropTypes.node,
  fieldName: PropTypes.string,
  fieldTitle: PropTypes.string,
  itemProp: PropTypes.string,
  multiline: PropTypes.bool,
  onProductFieldChange: PropTypes.func,
  product: PropTypes.object,
  textFieldProps: PropTypes.object
};

export default ProductField;
