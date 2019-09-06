import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import getShop from "../queries/getShop";
import getPrimaryShopId from "../queries/getPrimaryShopId";

/**
 * @summary withPrimaryShop HOC
 * @deprecated So that we can eventually add back a shop switcher, you should use `withShop`
 *   instead of `withPrimaryShop`, passing in a `shopId` prop.
 * @param {React.Component} Component React component to wrap
 * @return {React.Component} Wrapped component
 */
export default (Component) => (
  class PrimaryShop extends React.Component {
    static propTypes = {
      shouldSkipGraphql: PropTypes.bool // Whether to skip this HOC's GraphQL query & data
    };

    render() {
      const { shouldSkipGraphql } = this.props;

      if (shouldSkipGraphql) {
        return (
          <Component {...this.props} />
        );
      }

      return (
        <Query query={getPrimaryShopId}>
          {({ loading, data }) => {
            if (loading) return null;

            const props = {
              ...this.props,
              isLoadingPrimaryShop: loading
            };

            if (loading === false) {
              const { primaryShopId } = data;
              props.shopId = primaryShopId;
            }

            return (
              <Query query={getShop} variables={{ id: props.shopId }}>
                {({ loading: shopLoading, data: shopData }) => {
                  if (shopLoading) return null;

                  const { shop } = shopData;

                  return (
                    <Component shop={shop} />
                  );
                }}
              </Query>
            );
          }}
        </Query>
      );
    }
  }
);
