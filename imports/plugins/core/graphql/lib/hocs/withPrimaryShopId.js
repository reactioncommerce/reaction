import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import getPrimaryShopId from "../queries/getPrimaryShopId";

export default (Component) => {
  return class extends React.Component {
    static propTypes = {
      skip: PropTypes.bool // Whether to skip this HOC's GraphQL query & data
    };

    constructor (props) {
      super(props);
    }

    render() {
      const { skip } = this.props;

      if (skip) {
        return (
          <Component {...this.props} />
        );
      }

      return (
        <Query query={getPrimaryShopId}>
          {({ loading, error, data }) => {
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
}
