import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import getPrimaryShopId from "../queries/getPrimaryShopId";

export default (Component) => (
  class PrimaryShopId extends React.Component {
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
        <Query query={getPrimaryShopId} errorPolicy="all">
          {({ error, loading, data }) => {
            if (error) {
              Logger.error(error);
              throw new ReactionError("query-error");
            }
            const props = {
              ...this.props,
              isLoadingPrimaryShopId: loading
            };

            if (loading === false) {
              const { primaryShopId } = data;
              props.shopId = primaryShopId;
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
