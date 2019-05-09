import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import getPrimaryShop from "../queries/getPrimaryShop";
import getPrimaryShopId from "../queries/getPrimaryShopId";


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
              isLoadingPrimaryShopId: loading
            };

            if (loading === false) {
              const { primaryShopId } = data;
              props.shopId = primaryShopId;
            }

            return (
              <Query query={getPrimaryShop} variables={{ id: props.shopId }}>
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
