import gql from "graphql-tag";

export default gql`
  query refunds($orderId: ID!, $shopId: ID!, $token: String) {
    refunds(orderId: $orderId, shopId: $shopId, token: $token) {
      amount {
        amount
        displayAmount
      }
      createdAt
      paymentDisplayName
      reason
    }
  }
`;
