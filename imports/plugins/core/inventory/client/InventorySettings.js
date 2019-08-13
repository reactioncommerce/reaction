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
 * Inventory settings form block component
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function InventorySettings(props) {
  const {
    inventoryShopSettings,
    isLoadingInventoryShopSettings,
    updateInventoryShopSettings,
    shopId
  } = props;

  if (isLoadingInventoryShopSettings) return <Components.Loading />;

  const {
    canSellVariantWithoutInventory
  } = inventoryShopSettings || {};

  return (
    <Card>
      <CardHeader title={i18next.t("inventorySettings.cardTitle")} />
      <CardContent>
        <FormControlLabel
          control={
            <Switch
              checked={canSellVariantWithoutInventory}
              onChange={(event, checked) => {
                updateInventoryShopSettings({
                  variables: {
                    input: {
                      settingsUpdates: {
                        canSellVariantWithoutInventory: checked
                      },
                      shopId
                    }
                  }
                });
              }}
            />
          }
          label={i18next.t("inventorySettings.canSellVariantWithoutInventory")}
        />
      </CardContent>
    </Card>
  );
}

InventorySettings.propTypes = {
  inventoryShopSettings: PropTypes.shape({
    canSellVariantWithoutInventory: PropTypes.bool
  }),
  isLoadingInventoryShopSettings: PropTypes.bool,
  shopId: PropTypes.string.isRequired,
  updateInventoryShopSettings: PropTypes.func
};

export default InventorySettings;
