import gql from "graphql-tag";
import { orderCommonFragment } from "../fragments/orderCommon";

export default gql`
  query orderByReferenceId($id: ID!, $language: String! = "en", $shopId: ID!, $token: String) {
    order: orderByReferenceId(id: $id, shopId: $shopId, token: $token) {
      ...OrderCommon
    }
  }
  ${orderCommonFragment}
`;
