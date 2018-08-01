import React from "react";
import { PropTypes } from "prop-types";
import { Query } from "react-apollo";
import getTag from "../queries/getTag";

export default (Component) => (
  class Tag extends React.Component {
    static propTypes = {
      shouldSkipGraphql: PropTypes.bool, // Whether to skip this HOC's GraphQL query & data
      tagSlugOrId: PropTypes.string
    };

    render() {
      const { shouldSkipGraphql, tagSlugOrId } = this.props;

      if (shouldSkipGraphql || !tagSlugOrId) {
        return (
          <Component {...this.props} />
        );
      }

      const variables = { slugOrId: tagSlugOrId };
      return (
        <Query query={getTag} variables={variables}>
          {({ loading, data }) => {

            const props = {
              ...this.props,
              isLoadingTag: loading,
            };

            if (loading === false) {
              const { tag } = data;
              if (tag) {
                props.tag = tag;
              } else {
                // Tag not found, skip any other GraphQL HOCs that rely on data from this one
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
