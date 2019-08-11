import gql from "graphql-tag";
import { orderCommonFragment } from "../fragments/orderCommon";

export default gql`
  mutation createRefundMutation($amount: Float! , $orderId: ID!, $paymentId: ID!, $reason: String, $language: String! = "en") {
    createRefund(input: {
      amount: $amount,
      orderId: $orderId,
      paymentId: $paymentId,
      reason: $reason
    }) {
      order {
        ...OrderCommon
      }
    }
  }
  ${orderCommonFragment}
`;
