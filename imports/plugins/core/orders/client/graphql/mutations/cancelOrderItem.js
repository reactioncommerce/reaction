import gql from "graphql-tag";
import { orderCommonFragment } from "../fragments/orderCommon";

export default gql`
  mutation cancelOrderItemMutation($cancelQuantity: Int!, $itemId: ID!, $orderId: ID!, $reason: String, $language: String! = "en") {
    cancelOrderItem(input: {
      cancelQuantity: $cancelQuantity,
      itemId: $itemId,
      orderId: $orderId,
      reason: $reason
    }) {
      order {
        ...OrderCommon
      }
    }
  }
  ${orderCommonFragment}
`;
