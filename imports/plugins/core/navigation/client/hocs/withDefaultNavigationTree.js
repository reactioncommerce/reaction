import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import defaultNavigationTreeQuery from "./defaultNavigationTreeQuery";

export default (Component) => (
  class WithDefaultNavigationTree extends React.Component {
    static propTypes = {
      defaultNavigationTreeId: PropTypes.string.isRequired,
      onSetNavigationTree: PropTypes.func
    }

    static defaultProps = {
      defaultNavigationTreeId: ""
    }

    handleSetNavigationTree = (data) => {
      const { navigationTreeById: { draftItems } } = data;
      this.props.onSetNavigationTree(draftItems);
    }

    render() {
      const props = { ...this.props };
      const { defaultNavigationTreeId } = this.props;

      if (!defaultNavigationTreeId) {
        return <Component {...props} />;
      }

      const variables = {
        id: defaultNavigationTreeId,
        language: "en"
      };

      return (
        <Query
          query={defaultNavigationTreeQuery}
          variables={variables}
          onCompleted={this.handleSetNavigationTree}
          notifyOnNetworkStatusChange={true}
        >
          {({ data, loading, refetch }) => {
            if (!loading) {
              if (data && data.navigationTreeById && data.navigationTreeById.name) {
                props.navigationTreeName = data.navigationTreeById.name;
              }
            }
            return <Component {...props} refetchNavigationTree={refetch} />;
          }}
        </Query>
      );
    }
  }
);
