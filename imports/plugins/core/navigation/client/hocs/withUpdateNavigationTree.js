import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { navigationItemFragment } from "./fragments";

const updateNavigationTreeMutation = gql`
  mutation updateNavigationTreeMutation($input: UpdateNavigationTreeInput!) {
    updateNavigationTree(input: $input) {
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

export default (Component) => (
  class WithUpdateNavigationTree extends React.Component {
    static propTypes = {
      onUpdateNavigationTree: PropTypes.func
    }

    handleUpdateNavigationTree = (data) => {
      const { updateNavigationTree: { navigationTree } } = data;
      this.props.onUpdateNavigationTree(navigationTree);
    }

    sortableNavigationTreeToDraftItems(sortableNavigationTree) {
      return sortableNavigationTree.map((node) => {
        const newNode = {};
        newNode.navigationItemId = node.id;
        newNode.expanded = node.expanded;

        if (Array.isArray(node.children) && node.children.length) {
          newNode.items = this.sortableNavigationTreeToDraftItems(node.children);
        }

        return newNode;
      });
    }

    render() {
      return (
        <Mutation mutation={updateNavigationTreeMutation} onCompleted={this.handleUpdateNavigationTree} >
          {(updateNavigationTree) => (
            <Component
              {...this.props}
              updateNavigationTree={() => {
                const { defaultNavigationTreeId, sortableNavigationTree } = this.props;
                const input = {
                  _id: defaultNavigationTreeId,
                  navigationTree: {
                    draftItems: this.sortableNavigationTreeToDraftItems(sortableNavigationTree)
                  }
                };

                updateNavigationTree({
                  variables: {
                    input
                  }
                });
              }}
            />
          )}
        </Mutation>
      );
    }
  }
);
