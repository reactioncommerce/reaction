import React from "react";
import { Mutation } from "react-apollo";
import generateSitemapsMutation from "../mutations/generateSitemaps";

export default (Component) => (
  class GenerateSitemaps extends React.Component {
    render() {
      return (
        <Mutation mutation={generateSitemapsMutation}>
          {(generateSitemaps) => (
            <Component generateSitemaps={generateSitemaps} {...this.props} />
          )}
        </Mutation>
      );
    }
  }
);
