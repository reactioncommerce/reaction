import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Mutation, withApollo } from "react-apollo";
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

const deleteNavigationItemMutation = gql`
  mutation deleteNavigationItemMutation($input: DeleteNavigationItemInput!) {
    deleteNavigationItem(input: $input) {
      navigationItem {
        ...NavigationItemCommon
      }
    }
  }
  ${navigationItemFragment.navigationItem}
`;

const publishNavigationChangesMutation = gql`
  mutation publishNavigationChangesMutation($input: PublishNavigationChangesInput!) {
    publishNavigationChanges(input: $input) {
      navigationTree {
        name
        draftItems {
          expanded
          navigationItem {
            ...NavigationItemCommon
          }
          items {
            expanded
            navigationItem {
              ...NavigationItemCommon
            }
            items {
              navigationItem {
                ...NavigationItemCommon
              }
            }
          }
        }
      }
    }
  }
  ${navigationItemFragment.navigationItem}
`;

export default (Component) => {
  class WithUpdateNavigationItem extends React.Component {
    static propTypes = {
      client: PropTypes.object,
      defaultNavigationTreeId: PropTypes.string,
      onDeleteNavigationItem: PropTypes.func,
      onUpdateNavigationItem: PropTypes.func,
      refetchNavigationTree: PropTypes.func
    }

    static defaultProps = {
      onDeleteNavigationItem() {},
      onUpdateNavigationItem() {}
    }

    handleUpdateNavigationItem = (data) => {
      const { updateNavigationItem: { navigationItem } } = data;
      this.props.onUpdateNavigationItem(navigationItem);
      this.handlePublishNavigationChanges();
    }

    handleDeleteNavigationItem = (data) => {
      const { deleteNavigationItem: { navigationItem } } = data;
      this.props.onDeleteNavigationItem(navigationItem);
      this.props.refetchNavigationTree();
      this.handlePublishNavigationChanges();
    }

    handlePublishNavigationChanges = () => {
      const { client, defaultNavigationTreeId } = this.props;

      client.mutate({
        mutation: publishNavigationChangesMutation,
        variables: {
          input: {
            _id: defaultNavigationTreeId
          }
        }
      });
    }

    render() {
      return (
        <Mutation mutation={updateNavigationItemMutation} onCompleted={this.handleUpdateNavigationItem} >
          {(updateNavigationItem) => (
            <Mutation mutation={deleteNavigationItemMutation} onCompleted={this.handleDeleteNavigationItem} >
              {(deleteNavigationItem) => (
                <Component
                  {...this.props}
                  deleteNavigationItem={deleteNavigationItem}
                  updateNavigationItem={updateNavigationItem}
                />
              )}
            </Mutation>
          )}
        </Mutation>
      );
    }
  }

  return withApollo(WithUpdateNavigationItem);
};
