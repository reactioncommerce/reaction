import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
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

      const variables = { id: shopId };

      return (
        <Query query={getShop} variables={variables}>
          {({ loading, data }) => {
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
