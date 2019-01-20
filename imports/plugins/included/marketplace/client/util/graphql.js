import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import placeOrderMutation from "./placeOrder.graphql";

export const placeOrder = simpleGraphQLClient.createMutationFunction(placeOrderMutation);
