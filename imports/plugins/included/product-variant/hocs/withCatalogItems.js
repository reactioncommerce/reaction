import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import getCatalogItems from "../client/queries/getCatalogItems";

export default (Component) => {
  return class extends React.Component {
    static propTypes = {
      shopId: PropTypes.string.isRequired
    };

    constructor (props) {
      super(props);
    }

    render() {
      const variables = {
        shopId: this.props.shopId
      };

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
