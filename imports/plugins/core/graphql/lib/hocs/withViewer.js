import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
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
        <Query query={getViewer}>
          {({ loading, data }) => {
            const props = {
              ...this.props,
              isLoadingViewerId: loading
            };

            if (loading === false) {
              const { viewer: { _id } } = data;
              if (_id) {
                props.viewerId = _id;
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
