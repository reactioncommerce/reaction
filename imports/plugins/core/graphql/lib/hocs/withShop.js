import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import Logger from "/client/modules/logger";
import getShop from "../queries/getShop";

export default (Component) => (
  class WithShop extends React.Component {
    static propTypes = {
      internalShopId: PropTypes.string,
      shopId: PropTypes.string,
      shouldSkipGraphql: PropTypes.bool // Whether to skip this HOC's GraphQL query & data
    };

    render() {
      const { internalShopId = null, shopId, shouldSkipGraphql } = this.props;

      if (shouldSkipGraphql || !shopId) {
        return (
          <Component {...this.props} />
        );
      }

      return (
        <Query query={getShop} variables={{ id: shopId }}>
          {({ data, error, loading, refetch }) => {
            if (loading) return null;
            if (error) {
              Logger.error(error);
              return null;
            }

            const { shop } = data;

            return (
              <Component
                refetchShop={refetch}
                shop={{ ...shop, internalId: internalShopId }}
                {...this.props}
              />
            );
          }}
        </Query>
      );
    }
  }
);
