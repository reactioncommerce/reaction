import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import shopSettingsQuery from "./shopSettingsQuery";

const updateInventoryShopSettingsMutation = gql`
  mutation updateInventoryShopSettingsMutation($input: UpdateShopSettingsInput!) {
    updateShopSettings(input: $input) {
      shopSettings {
        canSellVariantWithoutInventory
      }
    }
  }
`;

export default (Component) => (
  class WithUpdateInventoryShopSettings extends React.Component {
    static propTypes = {
      shopId: PropTypes.string.isRequired
    }

    render() {
      const { shopId } = this.props;

      return (
        <Mutation
          mutation={updateInventoryShopSettingsMutation}
          update={(cache, { data: { updateShopSettings } }) => {
            if (updateShopSettings && updateShopSettings.shopSettings) {
              cache.writeQuery({
                query: shopSettingsQuery,
                variables: {
                  shopId
                },
                data: {
                  shopSettings: { ...updateShopSettings.shopSettings }
                }
              });
            }
          }}
        >
          {(updateInventoryShopSettings) => (
            <Component
              {...this.props}
              updateInventoryShopSettings={updateInventoryShopSettings}
            />
          )}
        </Mutation>
      );
    }
  }
);
