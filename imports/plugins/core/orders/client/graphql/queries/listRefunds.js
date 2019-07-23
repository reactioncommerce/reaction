import gql from "graphql-tag";

export default gql`
  query listRefunds($orderId: ID!, $shopId: ID!, $token: String) {
    listRefunds(orderId: $orderId, shopId: $shopId, token: $token) {
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
