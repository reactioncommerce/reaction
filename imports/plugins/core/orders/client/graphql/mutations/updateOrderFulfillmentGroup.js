import gql from "graphql-tag";
import { orderCommonFragment } from "../fragments/orderCommon";

export default gql`
  mutation updateOrderFulfillmentGroupMutation($orderFulfillmentGroupId: ID!, $orderId: ID!, $status: String, $tracking: String, $language: String! = "en") {
    updateOrderFulfillmentGroup(input: {
      orderFulfillmentGroupId: $orderFulfillmentGroupId,
      orderId: $orderId,
      status: $status,
      tracking: $tracking
    }) {
      order {
        ...OrderCommon
      }
    }
  }
  ${orderCommonFragment}
`;
