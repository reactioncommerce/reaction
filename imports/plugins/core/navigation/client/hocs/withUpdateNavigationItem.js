import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { navigationItemFragment } from "./fragments";

const updateNavigationItemMutation = gql`
  mutation updateNavigationItemMutation($input: UpdateNavigationItemInput!) {
    updateNavigationItem(input: $input) {
      navigationItem {
        ...NavigationItemCommon
      }
    }
  }
  ${navigationItemFragment.navigationItem}
`;

export default (Component) => (
  class WithUpdateNavigationItem extends React.Component {
    static propTypes = {
      onUpdateNavigationItem: PropTypes.func
    }

    handleUpdateNavigationItem = (data) => {
      const { updateNavigationItem: { navigationItem } } = data;
      this.props.onUpdateNavigationItem(navigationItem);
    }

    render() {
      return (
        <Mutation mutation={updateNavigationItemMutation} onCompleted={this.handleUpdateNavigationItem} >
          {(updateNavigationItem) => (
            <Component
              {...this.props}
              updateNavigationItem={updateNavigationItem}
            />
          )}
        </Mutation>
      );
    }
  }
);
