import React, { Component, PropTypes } from "react";
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
      variant: props.variant
    };
  }

  get variant() {
    return this.state.variant || this.props.variant || {};
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
          options={this.props.fetchTaxCodes()}
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
          expandable={true}
          expanded={false}
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
              value={this.variant.title}
            />
            <Select
              clearable={false}
              i18nKeyLabel="productVariant.originCountry"
              i18nKeyPlaceholder="productVariant.originCountry"
              label="Origin Country"
              name="originCountry"
              options={this.props.countries}
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
                  ref="input"
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
                  ref="input"
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
                  ref="input"
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
                  ref="input"
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
                  ref="input"
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
                  ref="input"
                  value={this.variant.weight}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <SettingsCard
          enabled={this.variant.taxable}
          expandable={true}
          expanded={false}
          i18nKeyTitle="productVariant.taxable"
          name="taxable"
          showSwitch={true}
          title="Taxable"
        >
          {this.renderTaxCodeField()}
          <TextField
            i18nKeyLabel="productVariant.taxDescription"
            i18nKeyPlaceholder="productVariant.taxDescription"
            placeholder="Tax Description"
            label="Tax Description"
            name="taxDescription"
          />
        </SettingsCard>

        <SettingsCard
          enabled={this.variant.inventoryManagement}
          expandable={true}
          expanded={false}
          i18nKeyTitle="productVariant.inventoryManagement"
          name="inventoryManagement"
          showSwitch={true}
          title="Inventory Tracking"
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
                ref="input"
              />
            </div>
          </div>
          <Switch
            i18nKeyLabel="productVariant.inventoryPolicy"
            i18nKeyOnLabel="productVariant.inventoryPolicy"
            label={"Allow Backorder"}
            onLabel={"Allow Backorder"}
            checked={this.variant.inventoryPolicy}
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
  removeVariant: PropTypes.func,
  restoreVariant: PropTypes.func,
  variant: PropTypes.object
};

export default VariantForm;
