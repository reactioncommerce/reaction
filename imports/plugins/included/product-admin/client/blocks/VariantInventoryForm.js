import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Switch from "@material-ui/core/Switch";
import { FormHelperText } from "@material-ui/core";

/**
 * Variant inventory form block component
 * @param {Object} props Component props
 * @return {Node} React node
 */
function VariantInventoryForm(props) {
  const {
    onVariantCheckboxChange,
    onVariantFieldBlur,
    onVariantFieldChange,
    onVariantInventoryPolicyChange,
    hasChildVariants: hasChildVariantsProp,
    validation,
    variant
  } = props;

  const hasChildVariants = hasChildVariantsProp(variant);
  let quantityFields;

  if (hasChildVariants) {
    quantityFields = (
      <Fragment>
        <Grid item sm={6}>
          <Components.TextField
            i18nKeyLabel="productVariant.inventoryInStock"
            i18nKeyPlaceholder="0"
            placeholder="0"
            label="In Stock"
            type="number"
            name="inventoryInStock"
            value={variant.inventoryInStock}
            style={{ backgroundColor: "lightgrey", cursor: "not-allowed" }}
            disabled={true}
            helpText="Variants inventory in stock quantity is calculated by options inventory"
            i18nKeyHelpText="admin.helpText.variantInventoryInStock"
          />
        </Grid>
        <Grid item sm={6}>
          <Components.TextField
            i18nKeyLabel="productVariant.inventoryAvailableToSell"
            i18nKeyPlaceholder="0"
            placeholder="0"
            label="Available To Sell"
            type="number"
            name="inventoryAvailableToSell"
            value={variant.inventoryAvailableToSell}
            style={{ backgroundColor: "lightgrey", cursor: "not-allowed" }}
            disabled={true}
            helpText="Variant inventory available to sell quantity is calculated by options inventory"
            i18nKeyHelpText="admin.helpText.variantInventoryAvailableToSell"
          />
        </Grid>
      </Fragment>
    );
  } else {
    quantityFields = (
      <Fragment>
        <Grid item sm={6}>
          <Components.TextField
            i18nKeyLabel="productVariant.inventoryInStock"
            i18nKeyPlaceholder="0"
            placeholder="0"
            label="In Stock"
            type="number"
            name="inventoryInStock"
            value={variant.inventoryInStock}
            onChange={onVariantFieldChange}
            onBlur={onVariantFieldBlur}
            onReturnKeyDown={onVariantFieldBlur}
            validation={validation}
            helpText="Inventory in stock"
            i18nKeyHelpText="admin.helpText.optionInventoryInStock"
          />
        </Grid>
        <Grid item sm={6}>
          <Components.TextField
            i18nKeyLabel="productVariant.inventoryAvailableToSell"
            i18nKeyPlaceholder="0"
            placeholder="0"
            label="Available To Sell"
            type="number"
            name="InventoryAvailableToSell"
            value={variant.inventoryAvailableToSell}
            style={{ backgroundColor: "lightgrey", cursor: "not-allowed" }}
            disabled={true}
            onChange={onVariantFieldChange}
            onBlur={onVariantFieldBlur}
            onReturnKeyDown={onVariantFieldBlur}
            validation={validation}
            helpText="Inventory available to sell"
            i18nKeyHelpText="admin.helpText.optionInventoryAvailableToSell"
          />
        </Grid>
      </Fragment>
    );
  }

  return (
    <Card>
      <CardHeader title={i18next.t("productVariant.inventoryManagement")} />

      <CardContent>
        <FormControlLabel
          control={
            <Switch
              checked={variant.inventoryManagement}
              onChange={(event, checked) => {
                onVariantCheckboxChange(event, checked, "inventoryManagement");
              }}
            />
          }
          label="Manage inventory"
        />
        <Grid container spacing={8}>
          {quantityFields}
          <Grid item sm={6}>
            <Components.TextField
              i18nKeyLabel="productVariant.lowInventoryWarningThreshold"
              i18nKeyPlaceholder="0"
              placeholder="0"
              type="number"
              label="Warn At"
              name="lowInventoryWarningThreshold"
              value={variant.lowInventoryWarningThreshold}
              onBlur={onVariantFieldBlur}
              onChange={onVariantFieldChange}
              onReturnKeyDown={onVariantFieldBlur}
              validation={validation}
            />
          </Grid>
        </Grid>
        <Grid container spacing={8}>
          <Grid item sm={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={!props.inventoryPolicy}
                  disabled={hasChildVariants}
                  onChange={(event, checked) => {
                    onVariantInventoryPolicyChange(event, checked, "inventoryPolicy");
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
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

VariantInventoryForm.propTypes = {
  hasChildVariants: PropTypes.func,
  onVariantCheckboxChange: PropTypes.func,
  onVariantFieldBlur: PropTypes.func,
  onVariantFieldChange: PropTypes.func,
  onVariantInventoryPolicyChange: PropTypes.func,
  validation: PropTypes.object,
  variant: PropTypes.object
};

export default VariantInventoryForm;
