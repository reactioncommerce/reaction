import React from "react";
import { PropTypes } from "prop-types";
import { Query } from "react-apollo";
import getTagId from "../queries/getTagId";

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
        <Query query={getTagId} variables={variables}>
          {({ loading, data }) => {
            const props = {
              ...this.props,
              isLoadingTagId: loading
            };

            if (loading === false) {
              const { tag } = data;
              const { _id } = tag || {};
              if (_id) {
                props.tagId = _id;
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
