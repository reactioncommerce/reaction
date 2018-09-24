import React, { Component } from "react";
import { Query } from "react-apollo";
import getViewer from "../queries/getViewer";

export default (Comp) => (
  class Viewer extends Component {
    render() {
      return (
        <Query query={getViewer}>
          {({ loading, data }) => {
            const props = {
              ...this.props,
              isLoadingViewerId: loading
            };

            if (loading === false) {
              const { viewer } = data;
              const { _id } = viewer || {};
              if (_id) {
                props.viewerId = _id;
              }
            }

            return (
              <Comp {...props} />
            );
          }}
        </Query>
      );
    }
  }
);
