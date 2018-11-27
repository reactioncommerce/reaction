import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import getShopId from "../queries/getShopId";

export default (Component) => (
  class ShopId extends React.Component {
    static propTypes = {
      shopSlug: PropTypes.string,
      shouldSkipGraphql: PropTypes.bool // Whether to skip this HOC's GraphQL query & data
    };

    render() {
      const { shouldSkipGraphql, shopSlug } = this.props;

      if (shouldSkipGraphql || !shopSlug) {
        return (
          <Component {...this.props} />
        );
      }

      const variables = { slug: shopSlug };

      return (
        <Query query={getShopId} variables={variables}>
          {({ loading, data }) => {
            const props = {
              ...this.props,
              isLoadingShopId: loading
            };

            if (loading === false) {
              const { shopBySlug } = data || {};
              const { _id } = shopBySlug || {};
              if (_id) {
                props.shopId = _id;
              } else {
                // Shop by slug not found, skip any other HOCs that relied on shopId
                props.shouldSkipGraphql = true;
              }
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
