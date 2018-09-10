import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import getShop from "../queries/getShop";

export default (Component) => (
  class Shop extends React.Component {
    static propTypes = {
      shopId: PropTypes.string,
      shouldSkipGraphql: PropTypes.bool // Whether to skip this HOC's GraphQL query & data
    };

    render() {
      const { shouldSkipGraphql, shopId } = this.props;

      if (shouldSkipGraphql || !shopId) {
        return (
          <Component {...this.props} />
        );
      }

      const variables = { shopId };

      return (
        <Query query={getShop} variables={variables}>
          {({ error, loading, data }) => {
            if (error) {
              Logger.error(error);
              throw new ReactionError("query-error");
            }
            const props = {
              ...this.props,
              isLoading: loading
            };

            if (loading === false && data) {
              const { shop } = data;
              if (shop) {
                props.shop = shop;
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
