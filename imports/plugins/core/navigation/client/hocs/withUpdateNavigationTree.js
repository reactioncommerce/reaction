import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { navigationTreeWith10LevelsFragment } from "./fragments";

const updateNavigationTreeMutation = gql`
  mutation updateNavigationTreeMutation($input: UpdateNavigationTreeInput!) {
    updateNavigationTree(input: $input) {
      navigationTree {
        ...NavigationTreeWith10Levels
      }
    }
  }
  ${navigationTreeWith10LevelsFragment}
`;

export default (Component) => (
  class WithUpdateNavigationTree extends React.Component {
    static propTypes = {
      defaultNavigationTreeId: PropTypes.string,
      navigationShopSettings: PropTypes.shape({
        shouldNavigationTreeItemsBeAdminOnly: PropTypes.bool,
        shouldNavigationTreeItemsBePubliclyVisible: PropTypes.bool,
        shouldNavigationTreeItemsBeSecondaryNavOnly: PropTypes.bool
      }),
      onUpdateNavigationTree: PropTypes.func,
      publishNavigationChanges: PropTypes.func,
      sortableNavigationTree: PropTypes.arrayOf(PropTypes.object)
    }

    handleUpdateNavigationTree = (data) => {
      const { updateNavigationTree: { navigationTree } } = data;
      this.props.onUpdateNavigationTree(navigationTree);
      this.props.publishNavigationChanges();
    }

    sortableNavigationTreeToDraftItems(sortableNavigationTree) {
      const {
        shouldNavigationTreeItemsBeAdminOnly,
        shouldNavigationTreeItemsBePubliclyVisible,
        shouldNavigationTreeItemsBeSecondaryNavOnly
      } = this.props.navigationShopSettings;

      return sortableNavigationTree.map((node) => {
        const newNode = {};
        newNode.navigationItemId = node.id;
        newNode.expanded = node.expanded;
        newNode.isVisible = typeof node.isVisible === "boolean" ? node.isVisible : shouldNavigationTreeItemsBePubliclyVisible;
        newNode.isPrivate = typeof node.isPrivate === "boolean" ? node.isPrivate : shouldNavigationTreeItemsBeAdminOnly;
        newNode.isSecondary = typeof node.isSecondary === "boolean" ? node.isSecondary : shouldNavigationTreeItemsBeSecondaryNavOnly;

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
