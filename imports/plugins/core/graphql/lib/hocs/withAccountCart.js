import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import getAccountCart from "../queries/getAccountCart";

// TODO: Cart has to be paginated
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
        <Query query={getAccountCart} variables={variables}>
          {({ loading, data, refetch }) => {
            const props = {
              ...this.props,
              isLoadingAccountCart: loading
            };

            if (loading === false) {
              const { cart } = data;
              props.cartData = cart;
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
