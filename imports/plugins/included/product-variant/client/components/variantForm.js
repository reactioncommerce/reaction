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
        value={this.props.selectedVariant.taxCode}
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
            />
            <Button
              icon="archive"
              className="rui btn btn-default btn-remove-variant flat"
              tooltip="Archive"
            />
          </CardHeader>
          <CardBody expandable={true}>
            <TextField
              i18nKeyLabel="productVariant.title"
              i18nKeyPlaceholder="productVariant.title"
              placeholder="Label"
              label="Label"
              name="title"
              value={this.props.selectedVariant.title}
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
                  value={this.props.selectedVariant.price}
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
                  value={this.props.selectedVariant.width}
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
                  value={this.props.selectedVariant.length}
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
                  value={this.props.selectedVariant.height}
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
                  value={this.props.selectedVariant.weight}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <SettingsCard
          enabled={this.props.selectedVariant.taxable}
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
          enabled={this.props.selectedVariant.inventoryManagement}
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
                ref="input"
                value={this.props.selectedVariant.inventoryQuantity}
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
            checked={this.props.selectedVariant.inventoryPolicy}
          />
        </SettingsCard>
      </CardGroup>
    );
  }
}

VariantForm.propTypes = {
  countries: PropTypes.arrayOf(PropTypes.object),
  fetchTaxCodes: PropTypes.func,
  isProviderEnabled: PropTypes.func,
  selectedVariant: PropTypes.object
};

export default VariantForm;
