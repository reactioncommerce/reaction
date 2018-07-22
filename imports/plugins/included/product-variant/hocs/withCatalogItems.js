import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import getCatalogItems from "../client/queries/getCatalogItems";

export default (Component) => {
  return class extends React.Component {
    static propTypes = {
      skip: PropTypes.bool, // Whether to skip this HOC's GraphQL query & data
      shopId: PropTypes.string,
      tag: PropTypes.object
    };

    constructor (props) {
      super(props);
    }

    render() {
      const { skip, shopId, tag } = this.props;

      if (skip) {
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
}
