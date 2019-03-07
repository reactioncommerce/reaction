import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import captureOrderPaymentsMutation from "./captureOrderPayments.graphql";

const captureOrderPaymentsMutate = simpleGraphQLClient.createMutationFunction(captureOrderPaymentsMutation);
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
