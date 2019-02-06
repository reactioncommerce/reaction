import React from "react";

export default (Component) => (
  class WithNavigationUIStore extends React.Component {
    state = {
      navigationItems: [],
      sortableNavigationTree: [],
      draggingNavigationTree: null,
      navigationTree: [],
      dragging: false
    }

    handleDiscardChanges = () => {
      this.setState(({ navigationTree }) => ({
        sortableNavigationTree: this.navigationTreeToSortable(navigationTree)
      }));
    }

    handleSetNavigationItems = (navigationItems) => {
      this.setState({ navigationItems });
    }

    handleAddNavigationItem = (navigationItem) => {
      this.setState((prevState) => ({
        navigationItems: [navigationItem, ...prevState.navigationItems]
      }));
    }

    handleSetNavigationTree = (navigationTree) => {
      const sortableNavigationTree = this.navigationTreeToSortable(navigationTree);
      this.setState({ navigationTree, sortableNavigationTree });
    }

    handleSetSortableNavigationTree = (sortableNavigationTree) => {
      this.setState({ sortableNavigationTree });
    }

    getNavigationItemTitle(navigationItem, language = "en") {
      return navigationItem.draftData.content.find((item) => item.language === language) || { value: "" };
    }

    navigationTreeToSortable(navigationTree) {
      return navigationTree.map((node) => {
        const newNode = {};
        newNode.id = node.navigationItem._id;
        newNode.title = this.getNavigationItemTitle(node.navigationItem).value;
        newNode.subtitle = node.navigationItem.draftData.url;
        newNode.navigationItem = { ...node.navigationItem };

        if (Array.isArray(node.items) && node.items.length) {
          newNode.children = this.navigationTreeToSortable(node.items);
        }

        return newNode;
      });
    }

    handleUpdateNavigationTree = (navigationTree) => {
      const { draftItems } = navigationTree;
      this.handleSetNavigationTree(draftItems);
    }

    render() {
      const { navigationItems, sortableNavigationTree } = this.state;

      return (
        <Component
          {...this.props}
          onUpdateNavigationTree={this.handleUpdateNavigationTree}
          sortableNavigationTree={sortableNavigationTree}
          onSetSortableNavigationTree={this.handleSetSortableNavigationTree}
          navigationItems={navigationItems}
          onAddNavigationItem={this.handleAddNavigationItem}
          onDiscardNavigationTreeChanges={this.handleDiscardChanges}
          onSetNavigationTree={this.handleSetNavigationTree}
          onSetNavigationItems={this.handleSetNavigationItems}
        />
      );
    }
  }
);
