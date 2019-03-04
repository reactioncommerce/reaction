
import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import navigationItemsQuery from "./navigationItemsQuery";

export default (Component) => (
  class WithNavigationItems extends React.Component {
    static propTypes = {
      onSetNavigationItems: PropTypes.func,
      shopId: PropTypes.string.isRequired
    }

    static defaultProps = {
      shopId: ""
    }

    handleSetNavigationItems = (data) => {
      const { navigationItemsByShopId: { nodes } } = data;
      this.props.onSetNavigationItems(nodes);
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
          query={navigationItemsQuery}
          variables={variables}
          onCompleted={this.handleSetNavigationItems}
          notifyOnNetworkStatusChange={true}
        >
          {() => (<Component {...props} />)}
        </Query>
      );
    }
  }
);
