import gql from "graphql-tag";
import { orderCommonFragment } from "../fragments/orderCommon";

export default gql`
  mutation captureOrderPaymentsMutation($orderId: ID!, $paymentIds: [ID]!, $shopId: ID!, $language: String! = "en") {
    captureOrderPayments(input: {
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
