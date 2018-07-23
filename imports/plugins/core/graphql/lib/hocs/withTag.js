import React from "react";
import { PropTypes } from "prop-types";
import { Query } from "react-apollo";
import getTag from "../queries/getTag";

export default (Component) => {
  return class extends React.Component {
    static propTypes = {
      skip: PropTypes.bool, // Whether to skip this HOC's GraphQL query & data
      tagSlugOrId: PropTypes.string
    };

    constructor (props) {
      super(props);
    }

    render() {
      const { skip, tagSlugOrId } = this.props;

      if (skip || !tagSlugOrId) {
        return (
          <Component {...this.props} />
        );
      }

      const variables = { slugOrId: tagSlugOrId };
      return (
        <Query query={getTag} variables={variables}>
          {({ loading, error, data }) => {
            if (loading) return null;

            const { tag } = data;

            return (
              <Component {...this.props} tag={tag} />
            );
          }}
        </Query>
      );
    }
  }
}
