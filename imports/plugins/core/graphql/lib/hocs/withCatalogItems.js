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

      if (shouldSkipGraphql || !shopId) {
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
            const props = {
              ...this.props,
              isLoadingCatalogItems: loading,
              fetchMore
            };

            if (loading === false) {
              const { catalogItems } = data;
              props.catalogItems = catalogItems;
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
