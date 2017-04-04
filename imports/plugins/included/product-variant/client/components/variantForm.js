import React, { Component } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardGroup,
  Divider,
  Select,
  TextField
} from "/imports/plugins/core/ui/client/components";

class VariantForm extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <CardGroup>
        <Card>
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
            />
            <TextField
              i18nKeyLabel="productVariant.compareAtPrice"
              i18nKeyPlaceholder="0.00"
              placeholder="0.00"
              label="MSRP"
              name="compareAtPrice"
            />
            <TextField
              i18nKeyLabel="productVariant.price"
              i18nKeyPlaceholder="0.00"
              placeholder="0.00"
              label="Price"
              name="price"
            />
            <Divider />
            <TextField
              i18nKeyLabel="productVariant.width"
              i18nKeyPlaceholder="0"
              placeholder="0"
              label="Width"
              name="width"
            />
            <TextField
              i18nKeyLabel="productVariant.length"
              i18nKeyPlaceholder="0"
              placeholder="0"
              label="Length"
              name="length"
            />
            <TextField
              i18nKeyLabel="productVariant.height"
              i18nKeyPlaceholder="0"
              placeholder="0"
              label="Height"
              name="height"
            />
            <TextField
              i18nKeyLabel="productVariant.weight"
              i18nKeyPlaceholder="0"
              placeholder="0"
              label="Weight"
              name="weight"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            actAsExpander={true}
            i18nKeyTitle="productVariant.taxable"
            title="Taxable"
          >
            <input
              className="checkbox-switch"
              type="checkbox"
            />
          </CardHeader>
          <CardBody expandable={true}>
            <Select
              clearable={false}
              i18nKeyLabel="productVariant.taxCode"
              i18nKeyPlaceholder="productVariant.selectTaxCode"
              label="Tax Code"
              name="taxCode"
            />
            <TextField
              i18nKeyLabel="productVariant.taxDescription"
              i18nKeyPlaceholder="productVariant.taxDescription"
              placeholder="Tax Description"
              label="Tax Description"
              name="taxDescription"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            actAsExpander={true}
            i18nKeyTitle="productVariant.inventoryManagement"
            title="Inventory Tracking"
          >
            <input
              className="checkbox-switch"
              type="checkbox"
            />
          </CardHeader>
          <CardBody expandable={true}>
            <TextField
              i18nKeyLabel="productVariant.inventoryQuantity"
              i18nKeyPlaceholder="0"
              placeholder="0"
              label="Inventory Quantity"
              name="inventoryQuantity"
            />
            <TextField
              i18nKeyLabel="productVariant.lowInventoryWarningThreshold"
              i18nKeyPlaceholder="0"
              placeholder="0"
              label="Warn At"
              name="lowInventoryWarningThreshold"
            />
          <label>
            <input
              className="checkbox-switch"
              type="checkbox"
              data-i18n="productVariant.inventoryPolicy"
              name="inventoryPolicy"
            />
          </label>
          </CardBody>
        </Card>
      </CardGroup>
    );
  }
}

export default VariantForm;
