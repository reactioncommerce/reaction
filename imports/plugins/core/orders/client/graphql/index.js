import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import captureOrderPaymentsMutation from "./captureOrderPayments.graphql";
import updateOrderFulfillmentGroupMutation from "./updateOrderFulfillmentGroup.graphql";

const captureOrderPaymentsMutate = simpleGraphQLClient.createMutationFunction(captureOrderPaymentsMutation);
const updateOrderFulfillmentGroupMutate = simpleGraphQLClient.createMutationFunction(updateOrderFulfillmentGroupMutation);

export const captureOrderPayments = async ({ orderId, paymentIds, shopId }) => {
  // Convert MongoDB IDs to GraphQL IDs
  const conversionRequests = [
    { namespace: "Order", id: orderId },
    { namespace: "Shop", id: shopId }
  ];

  paymentIds.forEach((paymentId) => {
    conversionRequests.push({ namespace: "Payment", id: paymentId });
  });

  const [
    opaqueOrderId,
    opaqueShopId,
    ...opaquePaymentIds
  ] = await getOpaqueIds(conversionRequests);

  return captureOrderPaymentsMutate({
    input: {
      orderId: opaqueOrderId,
      paymentIds: opaquePaymentIds,
      shopId: opaqueShopId
    }
  });
};

export const updateOrderFulfillmentGroup = async ({
  orderId,
  orderFulfillmentGroupId,
  status,
  tracking
}) => {
  // Convert MongoDB IDs to GraphQL IDs
  const conversionRequests = [
    { namespace: "Order", id: orderId },
    { namespace: "OrderFulfillmentGroup", id: orderFulfillmentGroupId }
  ];

  const [
    opaqueOrderId,
    opaqueOrderFulfillmentGroupId
  ] = await getOpaqueIds(conversionRequests);

  return updateOrderFulfillmentGroupMutate({
    orderFulfillmentGroupId: opaqueOrderFulfillmentGroupId,
    orderId: opaqueOrderId,
    status,
    tracking
  });
};
