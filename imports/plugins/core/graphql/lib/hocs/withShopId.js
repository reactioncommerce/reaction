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
            if (loading) return null;

            const { shopBySlug } = data;
            const { _id } = shopBySlug;

            return (
              <Component {...this.props} shopId={_id} />
            );
          }}
        </Query>
      );
    }
  }
);
