import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import { ReactionProduct } from "/lib/api";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Switch from "@material-ui/core/Switch";

/**
 * Variant inventory form block component
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function VariantInventoryForm(props) {
  const {
    components: {
      Button
    },
    inventoryInfo,
    isLoadingInventoryInfo,
    recalculateReservedSimpleInventory,
    updateSimpleInventory,
    variables,
    variant
  } = props;

  if (!variant) return null;

  if (isLoadingInventoryInfo) return <Components.Loading />;

  const {
    canBackorder,
    inventoryInStock,
    inventoryReserved,
    isEnabled,
    lowInventoryWarningThreshold
  } = inventoryInfo || {};

  const hasChildVariants = ReactionProduct.checkChildVariants(variant._id) > 0;

  let content;
  if (hasChildVariants) {
    content = (
      <Fragment>
        <p>{i18next.t("productVariant.noInventoryTracking")}</p>
      </Fragment>
    );
  } else {
    content = (
      <Fragment>
        <p>{i18next.t("productVariant.inventoryMessage")}</p>
        <FormControlLabel
          control={
            <Switch
              checked={isEnabled}
              onChange={(event, checked) => {
                updateSimpleInventory({
                  variables: {
                    input: {
                      ...variables,
                      isEnabled: checked
                    }
                  }
                });
              }}
            />
          }
          label={i18next.t("productVariant.isInventoryManagementEnabled")}
        />
        <Grid container spacing={1}>
          <Grid item sm={6}>
            <Components.TextField
              disabled={!isEnabled}
              helpText={isEnabled ? i18next.t("productVariant.inventoryInStockHelpText", {
                inventoryAvailableToSell: Math.max((inventoryInStock || 0) - (inventoryReserved || 0), 0),
                inventoryInStock: (inventoryInStock || 0),
                inventoryReserved: (inventoryReserved || 0)
              }) : i18next.t("productVariant.inventoryDisabled")}
              i18nKeyLabel="productVariant.inventoryInStock"
              i18nKeyPlaceholder="0"
              label="In Stock"
              name="inventoryInStock"
              onChange={(event, value) => {
                if (value < 0) return;
                updateSimpleInventory({
                  variables: {
                    input: {
                      ...variables,
                      inventoryInStock: value
                    }
                  }
                });
              }}
              placeholder="0"
              type="number"
              value={isEnabled ? inventoryInStock : 0}
            />
            <Button
              isDisabled={!isEnabled}
              isShortHeight
              isTextOnly
              onClick={() => {
                recalculateReservedSimpleInventory({
                  variables: {
                    input: {
                      productConfiguration: variables.productConfiguration,
                      shopId: variables.shopId
                    }
                  }
                });
              }}
              title="Recalculate"
            >{i18next.t("productVariant.recalculateReservedInventory")}</Button>
          </Grid>
          <Grid item sm={6}>
            <Components.TextField
              disabled={!isEnabled}
              helpText={i18next.t("productVariant.lowInventoryWarningThresholdLabel")}
              i18nKeyLabel="productVariant.lowInventoryWarningThreshold"
              i18nKeyPlaceholder="0"
              label="Warn At"
              name="lowInventoryWarningThreshold"
              onChange={(event, value) => {
                if (value < 0) return;
                updateSimpleInventory({
                  variables: {
                    input: {
                      ...variables,
                      lowInventoryWarningThreshold: value
                    }
                  }
                });
              }}
              placeholder="0"
              type="number"
              value={isEnabled ? lowInventoryWarningThreshold : 0}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          <Grid item sm={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={isEnabled ? canBackorder : true}
                  disabled={!isEnabled}
                  onChange={(event, checked) => {
                    updateSimpleInventory({
                      variables: {
                        input: {
                          ...variables,
                          canBackorder: checked
                        }
                      }
                    });
                  }}
                />
              }
              label={i18next.t("productVariant.allowBackorder")}
            />
          </Grid>
        </Grid>
      </Fragment>
    );
  }

  return (
    <Card>
      <CardHeader title={i18next.t("productVariant.inventoryHeading")} />
      <CardContent>{content}</CardContent>
    </Card>
  );
}

VariantInventoryForm.propTypes = {
  components: PropTypes.shape({
    Button: PropTypes.any
  }),
  inventoryInfo: PropTypes.shape({
    canBackorder: PropTypes.bool,
    inventoryInStock: PropTypes.number,
    isEnabled: PropTypes.bool,
    lowInventoryWarningThreshold: PropTypes.number
  }),
  isLoadingInventoryInfo: PropTypes.bool,
  recalculateReservedSimpleInventory: PropTypes.func,
  updateSimpleInventory: PropTypes.func,
  variables: PropTypes.object,
  variant: PropTypes.object
};

export default VariantInventoryForm;
