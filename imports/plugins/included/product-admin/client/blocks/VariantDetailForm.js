import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { findCurrency, i18next } from "/client/api";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Grid from "@material-ui/core/Grid";

/**
 * Variant detail block
 * @param {Object} props Component props
 * @returns {React.Component} A React component
 */
function VariantDetailForm(props) {
  const {
    countries,
    onVariantFieldBlur,
    onVariantFieldChange,
    onVariantSelectChange,
    validation,
    greyDisabledFields,
    hasChildVariants,
    variant
  } = props;
  const currency = findCurrency();

  return (
    <Card>
      <CardHeader title={i18next.t("productDetailEdit.variantDetails")} />
      <CardContent>
        <Components.TextField
          i18nKeyHelpText="admin.helpText.attributeLabel"
          i18nKeyLabel="admin.productVariant.attributeLabelLabel"
          i18nKeyPlaceholder="admin.productVariant.attributeLabelPlaceholder"
          name="attributeLabel"
          onBlur={onVariantFieldBlur}
          onChange={onVariantFieldChange}
          onReturnKeyDown={onVariantFieldBlur}
          validation={validation}
          value={variant.attributeLabel}
        />
        <Components.TextField
          i18nKeyHelpText="admin.helpText.optionTitle"
          i18nKeyLabel="productVariant.optionTitle"
          i18nKeyPlaceholder="admin.productVariant.optionTitlePlaceholder"
          name="optionTitle"
          onBlur={onVariantFieldBlur}
          onChange={onVariantFieldChange}
          onReturnKeyDown={onVariantFieldBlur}
          validation={validation}
          value={variant.optionTitle}
        />
        <Components.TextField
          i18nKeyHelpText="admin.helpText.title"
          i18nKeyLabel="productVariant.title"
          i18nKeyPlaceholder="admin.productVariant.titlePlaceholder"
          name="title"
          onBlur={onVariantFieldBlur}
          onChange={onVariantFieldChange}
          onReturnKeyDown={onVariantFieldBlur}
          validation={validation}
          value={variant.title}
        />
        <Components.Select
          clearable={false}
          i18nKeyLabel="productVariant.originCountry"
          i18nKeyPlaceholder="productVariant.originCountry"
          label="Origin Country"
          name="originCountry"
          options={countries}
          onChange={onVariantSelectChange}
          value={variant.originCountry}
        />
        <Grid container spacing={1}>
          <Grid item sm={6}>
            <Components.NumericInput
              i18nKeyLabel="productVariant.price"
              i18nKeyPlaceholder="0.00"
              placeholder="0.00"
              label="Price"
              name="price"
              value={variant.price}
              format={currency}
              numericType="currency"
              style={greyDisabledFields(variant)}
              disabled={hasChildVariants(variant)}
              onBlur={onVariantFieldBlur}
              onChange={onVariantFieldChange}
              onReturnKeyDown={onVariantFieldBlur}
              validation={validation}
            />
          </Grid>
          <Grid item sm={6}>
            <Components.NumericInput
              i18nKeyLabel="productVariant.compareAtPrice"
              i18nKeyPlaceholder="0.00"
              placeholder="0.00"
              label="Compare At Price"
              name="compareAtPrice"
              value={variant.compareAtPrice}
              numericType="currency"
              format={currency}
              onBlur={onVariantFieldBlur}
              onChange={onVariantFieldChange}
              onReturnKeyDown={onVariantFieldBlur}
              validation={validation}
            />
          </Grid>
        </Grid>
        <Components.Divider />
        <Grid container spacing={1}>
          <Grid item sm={6}>
            <Components.TextField
              i18nKeyLabel="productVariant.width"
              i18nKeyPlaceholder="0"
              placeholder="0"
              label="Width"
              name="width"
              value={variant.width}
              onBlur={onVariantFieldBlur}
              onChange={onVariantFieldChange}
              onReturnKeyDown={onVariantFieldBlur}
              validation={validation}
            />
          </Grid>
          <Grid item sm={6}>
            <Components.TextField
              i18nKeyLabel="productVariant.length"
              i18nKeyPlaceholder="0"
              placeholder="0"
              label="Length"
              name="length"
              value={variant.length}
              onBlur={onVariantFieldBlur}
              onChange={onVariantFieldChange}
              onReturnKeyDown={onVariantFieldBlur}
              validation={validation}
            />
          </Grid>
        </Grid>

        <Grid container spacing={1}>
          <Grid item sm={6}>
            <Components.TextField
              i18nKeyLabel="productVariant.height"
              i18nKeyPlaceholder="0"
              placeholder="0"
              label="Height"
              name="height"
              value={variant.height}
              onBlur={onVariantFieldBlur}
              onChange={onVariantFieldChange}
              onReturnKeyDown={onVariantFieldBlur}
              validation={validation}
            />
          </Grid>
          <Grid item sm={6}>
            <Components.TextField
              i18nKeyLabel="productVariant.weight"
              i18nKeyPlaceholder="0"
              placeholder="0"
              label="Weight"
              name="weight"
              value={variant.weight}
              onBlur={onVariantFieldBlur}
              onChange={onVariantFieldChange}
              onReturnKeyDown={onVariantFieldBlur}
              validation={validation}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

VariantDetailForm.propTypes = {
  countries: PropTypes.arrayOf(PropTypes.object),
  greyDisabledFields: PropTypes.func,
  hasChildVariants: PropTypes.func,
  onVariantCheckboxChange: PropTypes.func,
  onVariantFieldBlur: PropTypes.func,
  onVariantFieldChange: PropTypes.func,
  onVariantSelectChange: PropTypes.func,
  validation: PropTypes.object,
  variant: PropTypes.object
};

export default VariantDetailForm;
