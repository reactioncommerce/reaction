import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
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
        <Query query={getPrimaryShopId}>
          {({ loading, data }) => {
            if (loading) return null;

            const { primaryShopId } = data;

            return (
              <Component {...this.props} shopId={primaryShopId} />
            );
          }}
        </Query>
      );
    }
  }
);
