import React from "react";
import { PropTypes } from "prop-types";
import { Query } from "react-apollo";
import getTags from "../queries/getTags";
import { getTagIds } from "/lib/selectors/tags";

export default (Component) => (
  class Tags extends React.Component {
    static propTypes = {
      shouldSkipGraphql: PropTypes.bool, // Whether to skip this HOC's GraphQL query & data
    };

    render() {
      const { shouldSkipGraphql, shopId } = this.props;

      if (shouldSkipGraphql || !shopId) {
        return (
          <Component {...this.props} />
        );
      }

      const variables = {
        shopId,
        isTopLevel: true
      };

      return (
        <Query query={getTags} variables={variables}>
          {({ loading, error, data }) => {
            const props = {
              ...this.props,
              isLoading: loading
            };

            if (loading === false) {
              if (!data) {
                return <Component {...props} shouldSkipGraphql />
              }
              let { tags: { nodes: tags} } = data;
              // tags = _.cloneDeep(tags);
              _.sortBy(tags, this.props.sortBy || "position"); // puts tags without position at end of array
              const tagsByKey = {};
              
              if (Array.isArray(tags)) {
                for (const tag of tags) {
                  // tag.shopId = shopId;
                  tagsByKey[tag._id] = tag;
                }
              }
              props.tags = tags;
              props.tagsByKey = tagsByKey;
              props.tagIds = getTagIds({ tags });
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
