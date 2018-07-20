import React from "react";
import { Query } from "react-apollo";
import getPrimaryShopId from "/imports/plugins/core/graphql/client/queries/getPrimaryShopId";

export default (Component) => {
  return class extends React.Component {
    constructor (props) {
      super(props);
    }

    render() {
      return (
        <Query query={getPrimaryShopId}>
          {({ loading, error, data }) => {
            if (loading) return null;

            const { primaryShopId } = data;

            const variables = {
              shopId: primaryShopId
            };

            return (
              <Component {...this.props} shopId={primaryShopId} />
            );
          }}
        </Query>
      );
    }
  }
}
