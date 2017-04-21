import React, { Component, PropTypes } from "react";
import update from "react/lib/update";
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
  TextField,
  Translation
} from "/imports/plugins/core/ui/client/components";

class VariantForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      variant: props.variant,
      inventoryPolicy: props.variant.inventoryPolicy,
      taxable: props.variant.taxable,
      inventoryManagement: props.variant.inventoryManagement
    };
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
        value={this.variant.taxCode}
      />
    );
  }

  renderArchiveButton() {
    if (this.variant.isDeleted) {
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

  render() {
    return (
      <CardGroup>
        <Card
          expanded={true}
          onExpand={this.handleCardExpand.bind(this, "variantDetails")}
        >
          <CardHeader
            actAsExpander={true}
            i18nKeyTitle="productDetailEdit.variantDetails"
            title="Variant Details"
          >
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
              <div className="rui textfield form-group col-sm-6">
                <label>
                  <Translation defaultValue="MSRP" i18nKey="productVariant.compareAtPrice" />
                </label>
                <input
                  className="compareAtPrice"
                  name="compareAtPrice"
                  type="text"
                  placeholder="0.00"
                  ref="compareAtPriceInput"
                  value={this.variant.compareAtPrice}
                />
              </div>
              <div className="rui textfield form-group col-sm-6">
                <label>
                  <Translation defaultValue="Price" i18nKey="productVariant.price" />
                </label>
                <input
                  className="price"
                  name="price"
                  type="text"
                  placeholder="0.00"
                  ref="priceInput"
                  value={this.variant.price}
                  style={this.props.greyDisabledFields(this.variant)}
                  disabled={this.props.hasChildVariants(this.variant)}
                />
              </div>
            </div>
            <Divider />
            <div className="row">
              <div className="rui textfield form-group col-sm-6">
                <label>
                  <Translation defaultValue="Width" i18nKey="productVariant.width" />
                </label>
                <input
                  className="width"
                  name="width"
                  type="text"
                  placeholder="0"
                  ref="widthInput"
                  value={this.variant.width}
                />
              </div>
              <div className="rui textfield form-group col-sm-6">
                <label>
                  <Translation defaultValue="Length" i18nKey="productVariant.length" />
                </label>
                <input
                  className="length"
                  name="length"
                  type="text"
                  placeholder="0"
                  ref="lengthInput"
                  value={this.variant.length}
                />
              </div>
            </div>

            <div className="row">
              <div className="rui textfield form-group col-sm-6">
                <label>
                  <Translation defaultValue="Height" i18nKey="productVariant.height" />
                </label>
                <input
                  className="height"
                  name="height"
                  type="text"
                  placeholder="0"
                  ref="heightInput"
                  value={this.variant.height}
                />
              </div>
              <div className="rui textfield form-group col-sm-6">
                <label>
                  <Translation defaultValue="Weight" i18nKey="productVariant.weight" />
                </label>
                <input
                  className="weight"
                  name="weight"
                  type="text"
                  placeholder="0"
                  ref="weightInput"
                  value={this.variant.weight}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <SettingsCard
          enabled={this.state.taxable}
          expandable={true}
          expanded={this.state.taxable}
          i18nKeyTitle="productVariant.taxable"
          name="taxable"
          showSwitch={true}
          title="Taxable"
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
          expanded={this.state.inventoryManagement}
          i18nKeyTitle="productVariant.inventoryManagement"
          name="inventoryManagement"
          showSwitch={true}
          title="Inventory Tracking"
          onSwitchChange={this.handleCheckboxChange}
        >
          <div className="row">
            <div className="rui textfield form-group col-sm-6">
              <label>
                <Translation defaultValue="Quantity" i18nKey="productVariant.inventoryQuantity" />
              </label>
              <input
                className="inventoryQuantity"
                name="inventoryQuantity"
                type="text"
                placeholder="0"
                ref="inventoryQuantityInput"
                value={this.variant.inventoryQuantity}
                style={this.props.greyDisabledFields(this.variant)}
                disabled={this.props.hasChildVariants(this.variant)}
              />
            </div>
            <div className="rui textfield form-group col-sm-6">
              <label>
                <Translation defaultValue="Warn At" i18nKey="productVariant.lowInventoryWarningThreshold" />
              </label>
              <input
                className="lowInventoryWarningThreshold"
                name="lowInventoryWarningThreshold"
                type="text"
                placeholder="0"
                ref="lowInventoryWarningThresholdinput"
              />
            </div>
          </div>
          <Switch
            i18nKeyLabel="productVariant.inventoryPolicy"
            i18nKeyOnLabel="productVariant.inventoryPolicy"
            name="inventoryPolicy"
            label={"Allow Backorder"}
            onLabel={"Allow Backorder"}
            checked={this.state.inventoryPolicy}
            onChange={this.handleCheckboxChange}
          />
        </SettingsCard>
      </CardGroup>
    );
  }
}

VariantForm.propTypes = {
  cloneVariant: PropTypes.func,
  countries: PropTypes.arrayOf(PropTypes.object),
  fetchTaxCodes: PropTypes.func,
  greyDisabledFields: PropTypes.func,
  hasChildVariants: PropTypes.func,
  isProviderEnabled: PropTypes.func,
  onCardExpand: PropTypes.func,
  onFieldChange: PropTypes.func,
  onVariantFieldSave: PropTypes.func,
  removeVariant: PropTypes.func,
  restoreVariant: PropTypes.func,
  variant: PropTypes.object
};

export default VariantForm;
