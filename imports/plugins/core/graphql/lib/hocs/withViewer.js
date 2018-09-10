import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import getViewer from "../queries/getViewer";

export default (Component) => (
  class ViewerId extends React.Component {
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
        <Query query={getViewer} errorPolicy="all">
          {({ error, loading, data, refetch }) => {
            if (error) {
              Logger.error(error);
              throw new ReactionError("query-error");
            }
            const props = {
              ...this.props,
              isLoadingViewer: loading,
              refetchViewer: refetch
            };
            if (loading === false && data) {
              const { viewer } = data;
              if (viewer) {
                props.viewer = viewer;
                props.viewerId = viewer._id;
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
