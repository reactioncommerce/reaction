import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

/**
 * Variant tax block component
 * @param {Object} props Component props
 * @returns {React.Component} A React component
 */
function VariantTaxForm(props) {
  const {
    onVariantCheckboxChange,
    onVariantFieldBlur,
    onVariantFieldChange,
    onVariantSelectChange,
    taxCodes,
    validation,
    variant
  } = props;

  let taxCodeField = (
    <Components.TextField
      i18nKeyLabel="productVariant.taxCode"
      label="Tax Code"
      name="taxCode"
      value={variant.taxCode}
      onBlur={onVariantFieldBlur}
      onChange={onVariantFieldChange}
      onReturnKeyDown={onVariantFieldBlur}
      validation={validation}
    />
  );

  if (Array.isArray(taxCodes) && taxCodes.length) {
    const options = taxCodes.map(({ code, label }) => ({ label, value: code }));
    options.unshift({ label: "None", value: "" });
    taxCodeField = (
      <Components.Select
        clearable={false}
        i18nKeyLabel="productVariant.taxCode"
        i18nKeyPlaceholder="productVariant.selectTaxCode"
        label="Tax Code"
        name="taxCode"
        options={options}
        onChange={onVariantSelectChange}
        value={variant.taxCode}
      />
    );
  }

  return (
    <Card>
      <CardHeader title={i18next.t("productVariant.taxable")} />
      <CardContent>
        <FormControlLabel
          control={
            <Switch
              checked={variant.isTaxable}
              onChange={(event, checked) => {
                onVariantCheckboxChange(event, checked, "isTaxable");
              }}
            />
          }
          label="Item is taxable"
        />
        {taxCodeField}
        <Components.TextField
          i18nKeyLabel="productVariant.taxDescription"
          i18nKeyPlaceholder="productVariant.taxDescription"
          placeholder="Tax Description"
          label="Tax Description"
          name="taxDescription"
          value={variant.taxDescription}
          onBlur={onVariantFieldBlur}
          onChange={onVariantFieldChange}
          onReturnKeyDown={onVariantFieldBlur}
          validation={validation}
        />
      </CardContent>
    </Card>
  );
}

VariantTaxForm.propTypes = {
  onVariantCheckboxChange: PropTypes.func,
  onVariantFieldBlur: PropTypes.func,
  onVariantFieldChange: PropTypes.func,
  onVariantSelectChange: PropTypes.func,
  taxCodes: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  validation: PropTypes.object,
  variant: PropTypes.object
};

export default VariantTaxForm;
