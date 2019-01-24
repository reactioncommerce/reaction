
import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Query } from "react-apollo";

const tagsQuery = gql`
  query tagsQuery($shopId: ID!, $cursor: ConnectionCursor) {
    tags(shopId: $shopId, first: 200, after: $cursor) {
      pageInfo {
        endCursor
        startCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          _id
          name
        }
      }
    }
  }
`;

export default (Component) => (
  class WithTags extends React.Component {
    static propTypes = {
      onSetTags: PropTypes.func,
      shopId: PropTypes.string.isRequired
    }

    static defaultProps = {
      shopId: ""
    }

    handleSetTags = (data) => {
      const { tags: { edges } } = data;
      this.props.onSetTags(edges);
    }

    render() {
      const props = { ...this.props };
      const { shopId } = this.props;
      if (!shopId) {
        return <Component {...props} />;
      }

      const variables = {
        shopId
      };

      return (
        <Query
          query={tagsQuery}
          variables={variables}
          onCompleted={this.handleSetTags}
          notifyOnNetworkStatusChange={true}
        >
          {() => (<Component {...props} />)}
        </Query>
      );
    }
  }
);
