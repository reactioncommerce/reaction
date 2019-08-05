import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { navigationItemFragment } from "./fragments";

const createNavigationItemMutation = gql`
  mutation createNavigationItemMutation($input: CreateNavigationItemInput!) {
    createNavigationItem(input: $input) {
      navigationItem {
        ...NavigationItem
      }
    }
  }
  ${navigationItemFragment}
`;

export default (Component) => (
  class WithCreateNavigationItem extends React.Component {
    static propTypes = {
      onAddNavigationItem: PropTypes.func
    }

    addNavigationItem = (data) => {
      const { createNavigationItem: { navigationItem } } = data;
      this.props.onAddNavigationItem(navigationItem);
    }

    render() {
      return (
        <Mutation mutation={createNavigationItemMutation} onCompleted={this.addNavigationItem}>
          {(createNavigationItem) => (
            <Component
              {...this.props}
              createNavigationItem={createNavigationItem}
            />
          )}
        </Mutation>
      );
    }
  }
);
