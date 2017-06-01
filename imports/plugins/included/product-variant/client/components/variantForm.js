import { isEqual } from "lodash";
import React, { Component, PropTypes } from "react";
import Velocity from "velocity-animate";
import "velocity-animate/velocity.ui";
import update from "react/lib/update";
import { formatPriceString } from "/client/api";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardGroup,
  Divider,
  Select,
  SettingsCard,
  Switch,
  TextField
} from "/imports/plugins/core/ui/client/components";

const fieldNames = [
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
  "inventoryQuantity",
  "inventoryPolicy",
  "lowInventoryWarningThreshold"
];

const fieldGroups = {
  title: { group: "variantDetails" },
  originCountry: { group: "variantDetails" },
  compareAtPrice: { group: "variantDetails" },
  price: { group: "variantDetails" },
  width: { group: "variantDetails" },
  length: { group: "variantDetails" },
  height: { group: "variantDetails" },
  weight: { group: "variantDetails" },
  taxCode: { group: "taxable" },
  taxDescription: { group: "taxable" },
  inventoryQuantity: { group: "inventoryManagement" },
  inventoryPolicy: { group: "inventoryManagement" },
  lowInventoryWarningThreshold: { group: "inventoryManagement" }
};

class VariantForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedCard: this.fieldGroupForFieldName(props.editFocus),
      variant: props.variant,
      inventoryPolicy: props.variant.inventoryPolicy,
      taxable: props.variant.taxable,
      inventoryManagement: props.variant.inventoryManagement
    };
  }

  componentWillReceiveProps(nextProps) {
    const nextVariant = nextProps.variant || {};
    const currentVariant = this.props.variant || {};

    if (!isEqual(nextVariant, currentVariant)) {
      for (const fieldName of fieldNames) {
        if (nextVariant[fieldName] !== currentVariant[fieldName]) {
          this.animateFieldFlash(fieldName);
        }
      }
    }
    const cardGroupName = this.fieldGroupForFieldName(nextProps.editFocus);

    this.setState({
      expandedCard: cardGroupName,
      variant: nextProps.variant
    });
  }

  fieldGroupForFieldName(field) {
    // Other wise, if a field was passed
    // const fieldName = this.state.viewProps.field;

    let fieldName;

    // If the field is an array of field name
    if (Array.isArray(field) && field.length) {
      // Use the first field name
      fieldName = field[0];
    } else {
      fieldName = field;
    }

    const fieldData = fieldGroups[fieldName];

    if (fieldData && fieldData.group) {
      return fieldData.group;
    }

    return fieldName;
  }

  animateFieldFlash(fieldName) {
    const fieldRef = this.refs[`${fieldName}Input`];

    if (fieldRef) {
      const input = fieldRef.refs.input;

      Velocity.RunSequence([
        { e: input, p: { backgroundColor: "#e2f2e2" }, o: { duration: 200 } },
        { e: input, p: { backgroundColor: "#fff" }, o: { duration: 100 } }
      ]);
    }
  }

  get variant() {
    return this.state.variant || this.props.variant || {};
  }

  handleFieldChange = (event, value, field) => {
    const newState = update(this.state, {
      variant: {
        $merge: {
          [field]: value
        }
      }
    });

    this.setState(newState);
  }

  handleFieldBlur = (event, value, field) => {
    if (this.props.onVariantFieldSave) {
      this.props.onVariantFieldSave(this.variant._id, field, value);
    }
  }

  handleSelectChange = (value, field) => {
    this.handleFieldChange(event, value, field);

    if (this.props.onVariantFieldSave) {
      this.props.onVariantFieldSave(this.variant._id, field, value);
    }
  }

  handleCheckboxChange = (event, value, field) => {
    this.setState({
      [field]: value
    });

    this.handleFieldBlur(event, value, field);
  }

  handleCardExpand(cardName) {
    if (this.props.onCardExpand) {
      this.props.onCardExpand(cardName);
    }
  }

  isExpanded(groupName) {
    if (this.state.expandedCard && this.state.expandedCard === groupName) {
      return true;
    }

    return false;
  }

  renderTaxCodeField() {
    if (this.props.isProviderEnabled()) {
      return (
        <Select
          clearable={false}
          i18nKeyLabel="productVariant.taxCode"
          i18nKeyPlaceholder="productVariant.selectTaxCode"
          label="Tax Code"
          name="taxCode"
          ref="taxCodeInput"
          options={this.props.fetchTaxCodes()}
          onChange={this.handleSelectChange}
          value={this.variant.taxCode}
        />
      );
    }
    return (
      <TextField
        i18nKeyLabel="productVariant.taxCode"
        i18nKeyPlaceholder="productVariant.selectTaxCode"
        placeholder="Select Tax Code"
        label="Tax Code"
        name="taxCode"
        ref="taxCodeInput"
        value={this.variant.taxCode}
        onBlur={this.handleFieldBlur}
        onChange={this.handleFieldChange}
        onReturnKeyDown={this.handleFieldBlur}
      />
    );
  }

  renderArchiveButton() {
    if (this.props.isDeleted) {
      return (
        <Button
          icon="refresh"
          className="rui btn btn-default btn-restore-variant flat"
          tooltip="Restore"
          onClick={() => this.props.restoreVariant(this.variant)}
        />
      );
    }
    return (
      <Button
        icon="archive"
        className="rui btn btn-default btn-remove-variant flat"
        tooltip="Archive"
        onClick={() => this.props.removeVariant(this.variant)}
      />
    );
  }

  renderArchivedLabel() {
    if (this.props.isDeleted) {
      return (
        <div className="panel-subheading">
          <span className="badge badge-danger" data-i18n="app.archived">
            <span>Archived</span>
          </span>
        </div>
      );
    }
  }

  renderQuantityField() {
    if (this.props.hasChildVariants(this.variant)) {
      return (
        <div className="col-sm-6">
          <TextField
            i18nKeyLabel="productVariant.inventoryQuantity"
            i18nKeyPlaceholder="0"
            placeholder="0"
            label="Quantity"
            name="inventoryQuantity"
            ref="inventoryQuantityInput"
            value={this.props.onUpdateQuantityField(this.variant)}
            style={{ backgroundColor: "lightgrey", cursor: "not-allowed" }}
            disabled={true}
          />
        </div>
      );
    }
    return (
      <div className="col-sm-6">
        <TextField
          i18nKeyLabel="productVariant.inventoryQuantity"
          i18nKeyPlaceholder="0"
          placeholder="0"
          label="Quantity"
          name="inventoryQuantity"
          ref="inventoryQuantityInput"
          value={this.variant.inventoryQuantity}
          onChange={this.handleFieldChange}
          onBlur={this.handleFieldBlur}
          onReturnKeyDown={this.handleFieldBlur}
        />
      </div>
    );
  }

  render() {
    return (
      <CardGroup>
        <Card
          expanded={this.isExpanded("variantDetails")}
          onExpand={this.handleCardExpand.bind(this, "variantDetails")}
        >
          <CardHeader
            actAsExpander={true}
            i18nKeyTitle="productDetailEdit.variantDetails"
            title="Variant Details"
          >
            {this.renderArchivedLabel()}
            <Button
              icon="files-o"
              className="rui btn btn-default btn-clone-variant flat"
              tooltip="Duplicate"
              onClick={() => this.props.cloneVariant(this.variant)}
            />
            {this.renderArchiveButton()}
          </CardHeader>
          <CardBody expandable={true}>
            <TextField
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
            />
            <Select
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
                <TextField
                  i18nKeyLabel="productVariant.compareAtPrice"
                  i18nKeyPlaceholder={formatPriceString("0.00")}
                  placeholder={formatPriceString("0.00")}
                  label="MSRP"
                  name="compareAtPrice"
                  ref="compareAtPriceInput"
                  value={this.variant.compareAtPrice}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                />
              </div>
              <div className="col-sm-6">
                <TextField
                  i18nKeyLabel="productVariant.price"
                  i18nKeyPlaceholder={formatPriceString("0.00")}
                  placeholder={formatPriceString("0.00")}
                  label="Price"
                  name="price"
                  ref="priceInput"
                  value={this.variant.price}
                  style={this.props.greyDisabledFields(this.variant)}
                  disabled={this.props.hasChildVariants(this.variant)}
                  onBlur={this.handleFieldBlur}
                  onChange={this.handleFieldChange}
                  onReturnKeyDown={this.handleFieldBlur}
                />
              </div>
            </div>
            <Divider />
            <div className="row">
              <div className="col-sm-6">
                <TextField
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
                />
              </div>
              <div className="col-sm-6">
                <TextField
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
                />
              </div>
            </div>

            <div className="row">
              <div className="col-sm-6">
                <TextField
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
                />
              </div>
              <div className="col-sm-6">
                <TextField
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
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <SettingsCard
          enabled={this.state.taxable}
          expandable={true}
          expanded={this.isExpanded("taxable")}
          i18nKeyTitle="productVariant.taxable"
          name="taxable"
          showSwitch={true}
          title="Taxable"
          onExpand={this.handleCardExpand.bind(this, "taxable")}
          onSwitchChange={this.handleCheckboxChange}
        >
          {this.renderTaxCodeField()}
          <TextField
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
          />
        </SettingsCard>

        <SettingsCard
          enabled={this.state.inventoryManagement}
          expandable={true}
          expanded={this.isExpanded("inventoryManagement")}
          i18nKeyTitle="productVariant.inventoryManagement"
          name="inventoryManagement"
          showSwitch={true}
          title="Inventory Tracking"
          onExpand={this.handleCardExpand.bind(this, "inventoryManagement")}
          onSwitchChange={this.handleCheckboxChange}
        >
          <div className="row">
            {this.renderQuantityField()}
            <div className="col-sm-6">
              <TextField
                i18nKeyLabel="productVariant.lowInventoryWarningThreshold"
                i18nKeyPlaceholder="0"
                placeholder="0"
                label="Warn At"
                name="lowInventoryWarningThreshold"
                ref="lowInventoryWarningThresholdInput"
                value={this.variant.lowInventoryWarningThreshold}
                onBlur={this.handleFieldBlur}
                onChange={this.handleFieldChange}
                onReturnKeyDown={this.handleFieldBlur}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <Switch
                i18nKeyLabel="productVariant.inventoryPolicy"
                i18nKeyOnLabel="productVariant.inventoryPolicy"
                name="inventoryPolicy"
                label={"Allow Backorder"}
                onLabel={"Allow Backorder"}
                checked={this.state.inventoryPolicy}
                onChange={this.handleCheckboxChange}
              />
            </div>
          </div>
        </SettingsCard>
      </CardGroup>
    );
  }
}

VariantForm.propTypes = {
  cloneVariant: PropTypes.func,
  countries: PropTypes.arrayOf(PropTypes.object),
  editFocus: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  fetchTaxCodes: PropTypes.func,
  greyDisabledFields: PropTypes.func,
  hasChildVariants: PropTypes.func,
  isDeleted: PropTypes.bool,
  isProviderEnabled: PropTypes.func,
  onCardExpand: PropTypes.func,
  onFieldChange: PropTypes.func,
  onUpdateQuantityField: PropTypes.func,
  onVariantFieldSave: PropTypes.func,
  removeVariant: PropTypes.func,
  restoreVariant: PropTypes.func,
  variant: PropTypes.object
};

export default VariantForm;
