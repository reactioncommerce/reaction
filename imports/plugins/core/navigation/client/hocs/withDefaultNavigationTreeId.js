import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";

const defaultNavigationTreeIdQuery = gql`
  query defaultNavigationTreeIdQuery {
    primaryShop {
      _id
      defaultNavigationTreeId
    }
  }
`;

export default (Component) => (
  class WithDefaultNavigationTreeId extends React.Component {
    render() {
      return (
        <Query query={defaultNavigationTreeIdQuery}>
          {({ data, loading }) => {
            const props = { ...this.props };
            if (!loading) {
              props.shopId = data.primaryShop._id;
              props.defaultNavigationTreeId = data.primaryShop.defaultNavigationTreeId;
            }
            return <Component {...props} />;
          }}
        </Query>
      );
    }
  }
);
