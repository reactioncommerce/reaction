import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import getAccountCart from "../queries/getAccountCart";

export default (Component) => (
  class AccountCart extends React.Component {
    static propTypes = {
      shopId: PropTypes.string,
      shouldSkipGraphql: PropTypes.bool, // Whether to skip this HOC's GraphQL query & data
      viewerId: PropTypes.string
    };
    render() {
      const { shopId, viewerId, shouldSkipGraphql } = this.props;
      if (shouldSkipGraphql || !shopId || !viewerId) {
        return (
          <Component {...this.props} />
        );
      }
      const variables = { accountId: viewerId, shopId };
      return (
        <Query query={getAccountCart} variables={variables} errorPolicy="all">
          {({ error, loading, data, refetch, fetchMore }) => {
            if (error) {
              Logger.error(error);
              throw new ReactionError("query-error");
            }
            const props = {
              ...this.props,
              isLoadingAccountCart: loading
            };

            if (loading === false) {
              const { cart } = data;
              const { items: cartItems, _id } = cart || {};
              props.cart = cart;
              props.cartItems = ((cartItems && cartItems.edges) || []).map((edge) => edge.node);
              props.cartId = _id;
              const { pageInfo } = cartItems || {};
              if (pageInfo) {
                const { hasNextPage, endCursor } = pageInfo;
                props.hasMoreCartItems = hasNextPage;
                props.loadMoreCartItems = () => {
                  fetchMore({
                    variables: {
                      itemsAfterCursor: endCursor
                    },
                    updateQuery: (previousResult, { fetchMoreResult }) => {
                      const { cart: fetchMoreCart } = fetchMoreResult;
                      // Check for additional items from result
                      if (fetchMoreCart && fetchMoreCart.items && Array.isArray(fetchMoreCart.items.edges) && fetchMoreCart.items.edges.length) {
                        // Merge previous cart items with next cart items
                        return {
                          ...fetchMoreResult,
                          cart: {
                            ...fetchMoreCart,
                            items: {
                              __typename: previousResult.cart.items.__typename,
                              pageInfo: fetchMoreCart.items.pageInfo,
                              edges: [
                                ...previousResult.cart.items.edges,
                                ...fetchMoreCart.items.edges
                              ]
                            }
                          }
                        };
                      }
                      // Send the previous result if the new result contains no additional data
                      return previousResult;
                    }
                  });
                };
              }
              props.refetchCartData = refetch;
            }
            return (
              <Component {...props} />
            );
          }}
        </Query>
      );
    }
  }
);
