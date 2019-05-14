import gql from "graphql-tag";

export default gql`
  query getInventoryInfo($shopId: ID!, $productConfiguration: ProductConfigurationInput!) {
    simpleInventory(shopId: $shopId, productConfiguration: $productConfiguration) {
      canBackorder
      inventoryInStock
      inventoryReserved
      isEnabled
      lowInventoryWarningThreshold
    }
  }
`;
