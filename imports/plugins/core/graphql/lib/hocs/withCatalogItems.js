import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import getCatalogItems from "../queries/getCatalogItems";

export default (Component) => (
  class CatalogItems extends React.Component {
    static propTypes = {
      shopId: PropTypes.string,
      shouldSkipGraphql: PropTypes.bool, // Whether to skip this HOC's GraphQL query & data
      tag: PropTypes.object
    };

    render() {
      const { shouldSkipGraphql, shopId, tag } = this.props;

      if (shouldSkipGraphql) {
        return (
          <Component {...this.props} />
        );
      }

      const variables = { shopId };

      if (tag) {
        variables.tagIds = [tag._id];
      }

      return (
        <Query query={getCatalogItems} variables={variables}>
          {({ loading, data, fetchMore }) => {
            if (loading) return null;

            const { catalogItems } = data;

            return (
              <Component {...this.props} catalogItems={catalogItems} fetchMore={fetchMore} />
            );
          }}
        </Query>
      );
    }
  }
);
