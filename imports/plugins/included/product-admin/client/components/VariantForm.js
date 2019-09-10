import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Components } from "@reactioncommerce/reaction-components";
import { findCurrency, i18next } from "/client/api";
import { highlightVariantInput } from "/imports/plugins/core/ui/client/helpers/animations";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import withStyles from "@material-ui/core/styles/withStyles";
import { FormHelperText } from "@material-ui/core";
import ProductMediaGallery from "./ProductMediaGallery";

const fieldNames = [
  "optionTitle",
  "title",
  "originCountry",
  "compareAtPrice",
  "price",
  "width",
  "length",
  "height",
  "weight",
  "taxCode",
  "taxDescription",
  "inventoryInStock",
  "inventoryAvailableToSell",
  "inventoryPolicy",
  "lowInventoryWarningThreshold"
];

const styles = (theme) => ({
  card: {
    marginBottom: theme.spacing(3)
  }
});

class VariantForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedCard: props.editFocus,
      variant: props.variant,
      inventoryPolicy: props.variant.inventoryPolicy,
      isTaxable: props.variant.isTaxable,
      inventoryManagement: props.variant.inventoryManagement
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
    const nextVariant = nextProps.variant || {};
    const currentVariant = this.props.variant || {};

    if (_.isEqual(nextVariant, currentVariant) === false) {
      for (const fieldName of fieldNames) {
        if (nextVariant[fieldName] !== currentVariant[fieldName]) {
          if (fieldName !== "taxCode") {
            this.animateFieldFlash(fieldName);
          }
        }
      }

      this.setState({
        expandedCard: nextProps.editFocus,
        inventoryManagement: nextProps.variant.inventoryManagement,
        inventoryPolicy: nextProps.variant.inventoryPolicy,
        isTaxable: nextProps.variant.isTaxable,
        variant: nextProps.variant
      });
    }

    this.setState({
      expandedCard: nextProps.editFocus
    });
  }

  animateFieldFlash(fieldName) {
    const fieldRef = this.refs[`${fieldName}Input`];

    if (fieldRef) {
      const { input } = fieldRef.refs;
      highlightVariantInput(input);
    }
  }

  get variant() {
    return this.state.variant || this.props.variant || {};
  }

  handleFieldChange = (event, value, field) => {
    this.setState(({ variant }) => ({
      variant: {
        ...variant,
        [field]: value
      }
    }));
  }

  handleFieldBlur = (event, value, field) => {
    if (this.props.onVariantFieldSave) {
      this.props.onVariantFieldSave(this.variant._id, field, value, this.state.variant);
    }
  }

  handleSelectChange = (value, field) => {
    this.setState(({ variant }) => ({
      variant: {
        ...variant,
        [field]: value
      }
    }), () => {
      if (this.props.onVariantFieldSave) {
        this.props.onVariantFieldSave(this.variant._id, field, value, this.state.variant);
      }
    });
  }

  handleCheckboxChange = (event, value, field) => {
    this.setState(({ variant }) => ({
      variant: {
        ...variant,
        [field]: value
      }
    }), () => {
      if (this.props.onVariantFieldSave) {
        this.props.onVariantFieldSave(this.variant._id, field, value, this.state.variant);
      }
    });
  }

  handleInventoryPolicyChange = (event, value, field) => {
    /*
    Due to some confusing verbiage on how inventoryPolicy works / is displayed, we need to handle this field
    differently than we handle the other checkboxes in this component. Specifically, we display the opposite value of
    what the actual field value is. Because this is a checkbox, that means that the opposite value is actually the
    field value as well, not just a display value, so we need to reverse the boolean value when it gets passed into
    this function before we send it to the server to update the data. Other than reversing the value, this function
    is the same as `handleCheckboxChange`.
    */

    const inverseValue = !value;

    this.setState(({ variant }) => ({
      inventoryPolicy: inverseValue,
      variant: {
        ...variant,
        [field]: inverseValue
      }
    }));

    this.handleFieldBlur(event, inverseValue, field);
  }

  renderTaxCodeField() {
    const { taxCodes, validation } = this.props;

    if (Array.isArray(taxCodes) && taxCodes.length) {
      const options = taxCodes.map(({ code, label }) => ({ label, value: code }));
      options.unshift({ label: "None", value: "" });
      return (
        <Components.Select
          clearable={false}
          i18nKeyLabel="productVariant.taxCode"
          i18nKeyPlaceholder="productVariant.selectTaxCode"
          label="Tax Code"
          name="taxCode"
          ref="taxCodeInput"
          options={options}
          onChange={this.handleSelectChange}
          value={this.variant.taxCode}
        />
      );
    }
    return (
      <Components.TextField
        i18nKeyLabel="productVariant.taxCode"
        label="Tax Code"
        name="taxCode"
        ref="taxCodeInput"
        value={this.variant.taxCode}
        onBlur={this.handleFieldBlur}
        onChange={this.handleFieldChange}
        onReturnKeyDown={this.handleFieldBlur}
        validation={validation}
      />
    );
  }

  renderInventoryPolicyField() {
    const hasChildVariants = this.props.hasChildVariants(this.variant);

    return (
      <div className="col-sm-12">
        <FormControlLabel
          control={
            <Switch
              checked={!this.state.inventoryPolicy}
              disabled={this.props.hasChildVariants(this.variant)}
              onChange={(event, checked) => {
                this.handleInventoryPolicyChange(event, checked, "inventoryPolicy");
              }}
            />
          }
          label="Allow backorder"
        />
        {hasChildVariants &&
          <FormHelperText>
            {i18next.t("admin.helpText.variantBackorderToggle")}
          </FormHelperText>
        }
      </div>
    );
  }

  renderQuantityField() {
    if (this.props.hasChildVariants(this.variant)) {
      return (
        <Fragment>
          <div className="col-sm-6">
            <Components.TextField
              i18nKeyLabel="productVariant.inventoryInStock"
              i18nKeyPlaceholder="0"
              placeholder="0"
              label="In Stock"
              type="number"
              name="inventoryInStock"
              ref="inventoryInStockInput"
              value={this.variant.inventoryInStock}
              style={{ backgroundColor: "lightgrey", cursor: "not-allowed" }}
              disabled={true}
              helpText="Variants inventory in stock quantity is calculated by options inventory"
              i18nKeyHelpText="admin.helpText.variantInventoryInStock"
            />
          </div>
          <div className="col-sm-6">
            <Components.TextField
              i18nKeyLabel="productVariant.inventoryAvailableToSell"
              i18nKeyPlaceholder="0"
              placeholder="0"
              label="Available To Sell"
              type="number"
              name="inventoryAvailableToSell"
              ref="inventoryAvailableToSellInput"
              value={this.variant.inventoryAvailableToSell}
              style={{ backgroundColor: "lightgrey", cursor: "not-allowed" }}
              disabled={true}
              helpText="Variant inventory available to sell quantity is calculated by options inventory"
              i18nKeyHelpText="admin.helpText.variantInventoryAvailableToSell"
            />
          </div>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <div className="col-sm-6">
          <Components.TextField
            i18nKeyLabel="productVariant.inventoryInStock"
            i18nKeyPlaceholder="0"
            placeholder="0"
            label="In Stock"
            type="number"
            name="inventoryInStock"
            ref="inventoryInStockInput"
            value={this.variant.inventoryInStock}
            onChange={this.handleFieldChange}
            onBlur={this.handleFieldBlur}
            onReturnKeyDown={this.handleFieldBlur}
            validation={this.props.validation}
            helpText="Inventory in stock"
            i18nKeyHelpText="admin.helpText.optionInventoryInStock"
          />
        </div>
        <div className="col-sm-6">
          <Components.TextField
            i18nKeyLabel="productVariant.inventoryAvailableToSell"
            i18nKeyPlaceholder="0"
            placeholder="0"
            label="Available To Sell"
            type="number"
            name="InventoryAvailableToSell"
            ref="InventoryAvailableToSellInput"
            value={this.variant.inventoryAvailableToSell}
            style={{ backgroundColor: "lightgrey", cursor: "not-allowed" }}
            disabled={true}
            onChange={this.handleFieldChange}
            onBlur={this.handleFieldBlur}
            onReturnKeyDown={this.handleFieldBlur}
            validation={this.props.validation}
            helpText="Inventory available to sell"
            i18nKeyHelpText="admin.helpText.optionInventoryAvailableToSell"
          />
        </div>
      </Fragment>
    );
  }

  render() {
    const { classes, variant } = this.props;
    const currency = findCurrency();

    return (
      <div>
        <Card className={classes.card}>
          <CardHeader title={i18next.t("productDetailEdit.variantDetails")} />
          <CardContent>
            <Components.TextField
              i18nKeyLabel="productVariant.title"
              i18nKeyPlaceholder="productVariant.title"
              placeholder="Label"
              label="Label"
              name="title"
              ref="titleInput"
              value={this.variant.title}
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              onReturnKeyDown={this.handleFieldBlur}
              validation={this.props.validation}
            />
            <Components.TextField
              i18nKeyLabel="productVariant.optionTitle"
              i18nKeyPlaceholder="productVariant.optionTitle"
              placeholder="optionTitle"
              label="Short Label"
              name="optionTitle"
              ref="optionTitleInput"
              value={this.variant.optionTitle}
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              onReturnKeyDown={this.handleFieldBlur}
              validation={this.props.validation}
              helpText={"Displayed on Product Detail Page"}
              i18nKeyHelpText={"admin.helpText.optionTitle"}
            />
            <Components.Select
              clearable={false}
              i18nKeyLabel="productVariant.originCountry"
              i18nKeyPlaceholder="productVariant.originCountry"
              label="Origin Country"
              name="originCountry"
              ref="countryOfOriginInput"
              options={this.props.countries}
              onChange={this.handleSelectChange}
              value={this.variant.originCountry}
            />
            <div className="row">
              <div className="col-sm-6">
                <Components.NumericInput
                  i18nKeyLabel="productVariant.price"
                  i18nKeyPlaceholder="0.00"
                  placeholder="0.00"
                  label="Price"
                  name="price"
                  ref="priceInput"
                  value={this.variant.price}
                  format={currency}
                  numericType="currency"
                  style={this.props.greyDisabledFields(this.variant)}
                  disabled={this.props.hasChildVariants(this.variant)}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
              <div className="col-sm-6">
                <Components.NumericInput
                  i18nKeyLabel="productVariant.compareAtPrice"
                  i18nKeyPlaceholder="0.00"
                  placeholder="0.00"
                  label="Compare At Price"
                  name="compareAtPrice"
                  ref="compareAtPriceInput"
                  value={this.variant.compareAtPrice}
                  numericType="currency"
                  format={currency}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
            </div>
            <Components.Divider />
            <div className="row">
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.width"
                  i18nKeyPlaceholder="0"
                  placeholder="0"
                  label="Width"
                  name="width"
                  ref="widthInput"
                  value={this.variant.width}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.length"
                  i18nKeyPlaceholder="0"
                  placeholder="0"
                  label="Length"
                  name="length"
                  ref="lengthInput"
                  value={this.variant.length}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.height"
                  i18nKeyPlaceholder="0"
                  placeholder="0"
                  label="Height"
                  name="height"
                  ref="heightInput"
                  value={this.variant.height}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.weight"
                  i18nKeyPlaceholder="0"
                  placeholder="0"
                  label="Weight"
                  name="weight"
                  ref="weightInput"
                  value={this.variant.weight}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={classes.card}>
          <CardHeader title={i18next.t("admin.productAdmin.mediaGallery")} />
          <CardContent>
            <ProductMediaGallery
              {...this.props}
              variantId={variant._id}
            />
          </CardContent>
        </Card>

        <Card className={classes.card}>
          <CardHeader title={i18next.t("productVariant.taxable")} />
          <CardContent>
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.isTaxable}
                  onChange={(event, checked) => {
                    this.handleCheckboxChange(event, checked, "isTaxable");
                  }}
                />
              }
              label="Item is taxable"
            />
            {this.renderTaxCodeField()}
            <Components.TextField
              i18nKeyLabel="productVariant.taxDescription"
              i18nKeyPlaceholder="productVariant.taxDescription"
              placeholder="Tax Description"
              label="Tax Description"
              name="taxDescription"
              ref="taxDescriptionInput"
              value={this.variant.taxDescription}
              onBlur={this.handleFieldBlur}
              onChange={this.handleFieldChange}
              onReturnKeyDown={this.handleFieldBlur}
              validation={this.props.validation}
            />
          </CardContent>
        </Card>

        <Card className={classes.card}>
          <CardHeader title={i18next.t("productVariant.inventoryManagement")} />

          <CardContent>
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.inventoryManagement}
                  onChange={(event, checked) => {
                    this.handleCheckboxChange(event, checked, "inventoryManagement");
                  }}
                />
              }
              label="Manage inventory"
            />
            <div className="row">
              {this.renderQuantityField()}
              <div className="col-sm-6">
                <Components.TextField
                  i18nKeyLabel="productVariant.lowInventoryWarningThreshold"
                  i18nKeyPlaceholder="0"
                  placeholder="0"
                  type="number"
                  label="Warn At"
                  name="lowInventoryWarningThreshold"
                  ref="lowInventoryWarningThresholdInput"
                  value={this.variant.lowInventoryWarningThreshold}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                  validation={this.props.validation}
                />
              </div>
            </div>
            <div className="row">
              {this.renderInventoryPolicyField()}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

VariantForm.propTypes = {
  classes: PropTypes.object,
  cloneVariant: PropTypes.func,
  countries: PropTypes.arrayOf(PropTypes.object),
  editFocus: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  greyDisabledFields: PropTypes.func,
  hasChildVariants: PropTypes.func,
  isDeleted: PropTypes.bool,
  onCardExpand: PropTypes.func,
  onFieldChange: PropTypes.func,
  onVariantFieldSave: PropTypes.func,
  onVisibilityButtonClick: PropTypes.func,
  removeVariant: PropTypes.func,
  restoreVariant: PropTypes.func,
  taxCodes: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  type: PropTypes.string,
  validation: PropTypes.object,
  variant: PropTypes.object
};

export default withStyles(styles, { name: "RuiVariantForm" })(VariantForm);
