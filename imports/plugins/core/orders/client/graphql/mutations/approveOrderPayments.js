import gql from "graphql-tag";
import { orderCommonFragment } from "../fragments/orderCommon";

export default gql`
  mutation approveOrderPaymentsMutation($orderId: ID!, $paymentIds: [ID]!, $shopId: ID!, $language: String! = "en") {
    approveOrderPayments(input: {
      orderId: $orderId,
      paymentIds: $paymentIds
      shopId: $shopId
    }) {
      order {
        ...OrderCommon
      }
    }
  }
  ${orderCommonFragment}
`;
