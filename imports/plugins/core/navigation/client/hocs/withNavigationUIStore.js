import React from "react";

export default (Component) => (
  class WithNavigationUIStore extends React.Component {
    state = {
      navigationItems: [],
      draggingNavigationTree: null,
      navigationTree: [],
      tags: [],
      targetDepth: 0,
      targetTreeIndex: -1,
      dragging: false
    }

    getNodeDataAtTreeIndexOrNextIndex({
      targetIndex,
      node,
      currentIndex,
      path = [],
      lowerSiblingCounts = [],
      ignoreCollapsed = true,
      isPseudoRoot = false
    }) {
      // The pseudo-root is not considered in the path
      const selfPath = !isPseudoRoot
        ? [...path, currentIndex]
        : [];

      // Return target node when found
      if (currentIndex === targetIndex) {
        return {
          node,
          lowerSiblingCounts,
          path: selfPath
        };
      }

      // Add one and continue for nodes with no children or hidden children
      if (!node.items || (ignoreCollapsed && node.expanded !== true)) {
        return { nextIndex: currentIndex + 1 };
      }

      // Iterate over each child and their descendants and return the
      // target node if childIndex reaches the targetIndex
      let childIndex = currentIndex + 1;
      const childCount = node.items.length;
      for (let i = 0; i < childCount; i += 1) {
        const result = this.getNodeDataAtTreeIndexOrNextIndex({
          ignoreCollapsed,
          targetIndex,
          node: node.items[i],
          currentIndex: childIndex,
          lowerSiblingCounts: [...lowerSiblingCounts, childCount - i - 1],
          path: selfPath
        });

        if (result.node) {
          return result;
        }

        childIndex = result.nextIndex;
      }

      // If the target node is not found, return the farthest traversed index
      return { nextIndex: childIndex };
    }

    getDescendantCount({ node, ignoreCollapsed = true }) {
      return (
        this.getNodeDataAtTreeIndexOrNextIndex({
          ignoreCollapsed,
          node,
          currentIndex: 0,
          targetIndex: -1
        }).nextIndex - 1
      );
    }

    changeNodeAtPath({ navigationTree, path, newNode, ignoreCollapsed = true }) {
      const RESULT_MISS = "RESULT_MISS";
      const traverse = ({
        isPseudoRoot = false,
        node,
        currentTreeIndex,
        pathIndex
      }) => {
        if (
          !isPseudoRoot &&
          currentTreeIndex !== path[pathIndex]
        ) {
          return RESULT_MISS;
        }

        if (pathIndex >= path.length - 1) {
          // If this is the final location in the path, return its changed form
          return typeof newNode === "function"
            ? newNode({ node, treeIndex: currentTreeIndex })
            : newNode;
        }

        if (!node.items) {
          // If this node is part of the path, but has no children, return the unchanged node
          throw new Error("Path referenced children of node with no children.");
        }

        let nextTreeIndex = currentTreeIndex + 1;
        for (let i = 0; i < node.items.length; i += 1) {
          const result = traverse({
            node: node.items[i],
            currentTreeIndex: nextTreeIndex,
            pathIndex: pathIndex + 1
          });

          // If the result went down the correct path
          if (result !== RESULT_MISS) {
            if (result) {
              // If the result was truthy (in this case, an object),
              //  pass it to the next level of recursion up
              return {
                ...node,
                items: [
                  ...node.items.slice(0, i),
                  result,
                  ...node.items.slice(i + 1)
                ]
              };
            }
            // If the result was falsy (returned from the newNode function), then
            //  delete the node from the array.
            return {
              ...node,
              items: [
                ...node.items.slice(0, i),
                ...node.items.slice(i + 1)
              ]
            };
          }

          nextTreeIndex += 1 + this.getDescendantCount({ node: node.items[i], ignoreCollapsed });
        }

        return RESULT_MISS;
      };

      // Use a pseudo-root node in the beginning traversal
      const result = traverse({
        node: { items: navigationTree },
        currentTreeIndex: -1,
        pathIndex: -1,
        isPseudoRoot: true
      });

      return result.items;
    }

    walkDescendants = ({
      callback,
      ignoreCollapsed,
      isPseudoRoot = false,
      node,
      parentNode = null,
      currentIndex,
      path = [],
      lowerSiblingCounts = []
    }) => {
      // The pseudo-root is not considered in the path

      const selfPath = isPseudoRoot
        ? []
        : [...path, currentIndex];
      const selfInfo = isPseudoRoot
        ? null
        : {
          node,
          parentNode,
          path: selfPath,
          lowerSiblingCounts,
          treeIndex: currentIndex
        };

      if (!isPseudoRoot) {
        const callbackResult = callback(selfInfo);

        // Cut walk short if the callback returned false
        if (callbackResult === false) {
          return false;
        }
      }

      // Return self on nodes with no children or hidden children
      if (
        !node.items ||
        (node.expanded !== true && ignoreCollapsed && !isPseudoRoot)
      ) {
        return currentIndex;
      }

      // Get all descendants
      let childIndex = currentIndex;
      const childCount = node.items.length;
      if (typeof node.items !== "function") {
        for (let i = 0; i < childCount; i += 1) {
          childIndex = this.walkDescendants({
            callback,
            ignoreCollapsed,
            node: node.items[i],
            parentNode: isPseudoRoot ? null : node,
            currentIndex: childIndex + 1,
            lowerSiblingCounts: [...lowerSiblingCounts, childCount - i - 1],
            path: selfPath
          });
          // Cut walk short if the callback returned false
          if (childIndex === false) {
            return false;
          }
        }
      }
      return childIndex;
    }

    walk = ({ navigationTree, ignoreCollapsed = true, callback }) => {
      if (!navigationTree || navigationTree.length < 1) {
        return;
      }

      this.walkDescendants({
        callback,
        ignoreCollapsed,
        isPseudoRoot: true,
        node: { items: navigationTree },
        currentIndex: -1,
        path: [],
        lowerSiblingCounts: []
      });
    }

    addNodeAtDepthAndIndex = ({
      targetDepth,
      targetTreeIndex,
      newNode,
      ignoreCollapsed,
      expandParent,
      isPseudoRoot = false,
      isLastChild,
      node,
      currentIndex,
      currentDepth,
      path = []
    }) => {
      const selfPath = () => (isPseudoRoot ? [] : [...path, currentIndex]);

      // If the current position is the only possible place to add, add it
      if (
        currentIndex >= targetTreeIndex - 1 ||
        (isLastChild && !(node.items && node.items.length))
      ) {
        if (typeof node.items === "function") {
          throw new Error("Cannot add to children defined by a function");
        } else {
          const extraNodeProps = expandParent ? { expanded: true } : {};
          const nextNode = {
            ...node,

            ...extraNodeProps,
            items: node.items ? [newNode, ...node.items] : [newNode]
          };

          return {
            node: nextNode,
            nextIndex: currentIndex + 2,
            insertedTreeIndex: currentIndex + 1,
            parentPath: selfPath(nextNode),
            parentNode: isPseudoRoot ? null : nextNode
          };
        }
      }

      // If this is the target depth for the insertion,
      // i.e., where the newNode can be added to the current node's children
      if (currentDepth >= targetDepth - 1) {
        // Skip over nodes with no children or hidden children
        if (
          !node.items ||
          typeof node.items === "function" ||
          (node.expanded !== true && ignoreCollapsed && !isPseudoRoot)
        ) {
          return { node, nextIndex: currentIndex + 1 };
        }

        // Scan over the children to see if there's a place among them that fulfills
        // the minimumTreeIndex requirement
        let childIndex = currentIndex + 1;
        let insertedTreeIndex = null;
        let insertIndex = null;
        for (let i = 0; i < node.items.length; i += 1) {
          // If a valid location is found, mark it as the insertion location and
          // break out of the loop
          if (childIndex >= targetTreeIndex) {
            insertedTreeIndex = childIndex;
            insertIndex = i;
            break;
          }

          // Increment the index by the child itself plus the number of descendants it has
          childIndex +=
            1 + this.getDescendantCount({ node: node.items[i], ignoreCollapsed });
        }

        // If no valid indices to add the node were found
        if (insertIndex === null) {
          // If the last position in this node's children is less than the minimum index
          // and there are more children on the level of this node, return without insertion
          if (childIndex < targetTreeIndex && !isLastChild) {
            return { node, nextIndex: childIndex };
          }

          // Use the last position in the children array to insert the newNode
          insertedTreeIndex = childIndex;
          insertIndex = node.items.length;
        }

        // Insert the newNode at the insertIndex
        const nextNode = {
          ...node,
          items: [
            ...node.items.slice(0, insertIndex),
            newNode,
            ...node.items.slice(insertIndex)
          ]
        };

        // Return node with successful insert result
        return {
          node: nextNode,
          nextIndex: childIndex,
          insertedTreeIndex,
          parentPath: selfPath(nextNode),
          parentNode: isPseudoRoot ? null : nextNode
        };
      }

      // Skip over nodes with no children or hidden children
      if (
        !node.items ||
        typeof node.items === "function" ||
        (node.expanded !== true && ignoreCollapsed && !isPseudoRoot)
      ) {
        return { node, nextIndex: currentIndex + 1 };
      }

      // Get all descendants
      let insertedTreeIndex = null;
      let pathFragment = null;
      let parentNode = null;
      let childIndex = currentIndex + 1;
      let newChildren = node.items;
      if (typeof newChildren !== "function") {
        newChildren = newChildren.map((child, i) => {
          if (insertedTreeIndex !== null) {
            return child;
          }

          const mapResult = this.addNodeAtDepthAndIndex({
            targetDepth,
            targetTreeIndex,
            newNode,
            ignoreCollapsed,
            expandParent,
            isLastChild: isLastChild && i === newChildren.length - 1,
            node: child,
            currentIndex: childIndex,
            currentDepth: currentDepth + 1,
            path: [] // Cannot determine the parent path until the children have been processed
          });

          if ("insertedTreeIndex" in mapResult) {
            ({
              insertedTreeIndex,
              parentNode,
              parentPath: pathFragment
            } = mapResult);
          }

          childIndex = mapResult.nextIndex;

          return mapResult.node;
        });
      }

      const nextNode = { ...node, children: newChildren };
      const result = {
        node: nextNode,
        nextIndex: childIndex
      };

      if (insertedTreeIndex !== null) {
        result.insertedTreeIndex = insertedTreeIndex;
        result.parentPath = [...selfPath(nextNode), ...pathFragment];
        result.parentNode = parentNode;
      }

      return result;
    }

    insertNode = ({
      navigationTree,
      targetDepth,
      targetTreeIndex,
      newNode,
      ignoreCollapsed = true,
      expandParent = false
    }) => {
      if (!navigationTree && targetDepth === 0) {
        return {
          navigationTree: [newNode],
          treeIndex: 0,
          path: [0],
          parentNode: null
        };
      }
      const insertResult = this.addNodeAtDepthAndIndex({
        targetDepth,
        targetTreeIndex,
        newNode,
        ignoreCollapsed,
        expandParent,
        isPseudoRoot: true,
        isLastChild: true,
        node: { items: navigationTree },
        currentIndex: -1,
        currentDepth: -1
      });

      if (!("insertedTreeIndex" in insertResult)) {
        throw new Error("No suitable position found to insert.");
      }

      const treeIndex = insertResult.insertedTreeIndex;
      return {
        navigationTree: insertResult.node.items,
        treeIndex,
        path: [
          ...insertResult.parentPath,
          treeIndex
        ],
        parentNode: insertResult.parentNode
      };
    }

    find = ({
      searchQuery,
      searchMethod,
      searchFocusOffset,
      expandAllMatchPaths = false,
      expandFocusMatchPaths = true
    }) => {
      let matchCount = 0;
      const trav = ({ isPseudoRoot = false, node, currentIndex, path = [] }) => {
        let matches = [];
        let isSelfMatch = false;
        let hasFocusMatch = false;
        // The pseudo-root is not considered in the path
        const selfPath = isPseudoRoot
          ? []
          : [...path, currentIndex];
        const extraInfo = isPseudoRoot
          ? null
          : {
            path: selfPath,
            treeIndex: currentIndex
          };

        // Nodes with with children that aren't lazy
        const hasChildren =
          node.items &&
          typeof node.items !== "function" &&
          node.items.length > 0;

        // Examine the current node to see if it is a match
        if (!isPseudoRoot && searchMethod({ ...extraInfo, node, searchQuery })) {
          if (matchCount === searchFocusOffset) {
            hasFocusMatch = true;
          }

          // Keep track of the number of matching nodes, so we know when the searchFocusOffset
          //  is reached
          matchCount += 1;

          // We cannot add this node to the matches right away, as it may be changed
          //  during the search of the descendants. The entire node is used in
          //  comparisons between nodes inside the `matches` and `treeData` results
          //  of this method (`find`)
          isSelfMatch = true;
        }

        let childIndex = currentIndex;
        const newNode = { ...node };
        if (hasChildren) {
          // Get all descendants
          newNode.items = newNode.items.map((child) => {
            const mapResult = trav({
              node: child,
              currentIndex: childIndex + 1,
              path: selfPath
            });

            // Ignore hidden nodes by only advancing the index counter to the returned treeIndex
            // if the child is expanded.
            //
            // The child could have been expanded from the start,
            // or expanded due to a matching node being found in its descendants
            if (mapResult.node.expanded) {
              childIndex = mapResult.treeIndex;
            } else {
              childIndex += 1;
            }

            if (mapResult.matches.length > 0 || mapResult.hasFocusMatch) {
              matches = [...matches, ...mapResult.matches];
              if (mapResult.hasFocusMatch) {
                hasFocusMatch = true;
              }

              // Expand the current node if it has descendants matching the search
              // and the settings are set to do so.
              if (
                (expandAllMatchPaths && mapResult.matches.length > 0) ||
                ((expandAllMatchPaths || expandFocusMatchPaths) &&
                  mapResult.hasFocusMatch)
              ) {
                newNode.expanded = true;
              }
            }

            return mapResult.node;
          });
        }

        // Cannot assign a treeIndex to hidden nodes
        if (!isPseudoRoot && !newNode.expanded) {
          matches = matches.map((match) => ({
            ...match,
            treeIndex: null
          }));
        }

        // Add this node to the matches if it fits the search criteria.
        // This is performed at the last minute so newNode can be sent in its final form.
        if (isSelfMatch) {
          matches = [{ ...extraInfo, node: newNode }, ...matches];
        }

        return {
          node: matches.length > 0 ? newNode : node,
          matches,
          hasFocusMatch,
          treeIndex: childIndex
        };
      };

      const { navigationTree } = this.state;
      const result = trav({
        node: { items: navigationTree },
        isPseudoRoot: true,
        currentIndex: -1
      });

      return {
        matches: result.matches,
        navigationTree: result.node.items
      };
    }

    getFlatDataFromNavigationTree = (navigationTree, ignoreCollapsed) => {
      if (!navigationTree || navigationTree.length < 1) {
        return [];
      }

      const flattened = [];
      this.walk({
        navigationTree,
        ignoreCollapsed,
        callback: (nodeInfo) => {
          flattened.push(nodeInfo);
        }
      });

      return flattened;
    }

    getRows = (navigationTree) => this.getFlatDataFromNavigationTree(navigationTree, true);

    handleSetTags = (tags) => {
      this.setState({ tags });
    }

    handleSetNavigationItems = (navigationItems) => {
      this.setState({ navigationItems });
    }

    handleAddNavigationItem = (navigationItem) => {
      this.setState((prevState) => ({
        navigationItems: [navigationItem, ...prevState.navigationItems]
      }));
    }

    handleDragHover = ({
      depth: targetDepth,
      draggedNode,
      treeIndex: targetTreeIndex
    }) => {
      const { targetDepth: currentTargetDepth, targetTreeIndex: currentTargetTreeIndex } = this.state;
      if (
        targetDepth === currentTargetDepth &&
        targetTreeIndex === currentTargetTreeIndex
      ) {
        return;
      }

      this.setState(({ navigationTree, draggingNavigationTree }) => {
        const addedResult = this.insertNode({
          navigationTree,
          newNode: draggedNode,
          targetDepth,
          targetTreeIndex,
          expandParent: true
        });

        const rows = this.getRows(addedResult.navigationTree);
        const expandedParentPath = rows[addedResult.treeIndex].path;
        console.log("ROWS", rows);
        console.log(expandedParentPath);
        return {
          draggedNode,
          targetDepth,
          targetTreeIndex,
          draggingNavigationTree: this.changeNodeAtPath({
            navigationTree: draggingNavigationTree,
            path: expandedParentPath.slice(0, -1),
            newNode: ({ node }) => ({ ...node, expanded: true })
          }),
          // reset the scroll focus so it doesn't jump back
          // to a search result while dragging
          searchFocusTreeIndex: null,
          dragging: true
        };
      });
    }

    handleToggleChildrenVisibility = (path) => {
      const { navigationTree: currentNavigationTree } = this.state;
      const navigationTree = this.changeNodeAtPath({
        navigationTree: currentNavigationTree,
        path,
        newNode: ({ node }) => ({ ...node, expanded: !node.expanded })
      });

      this.setState({ navigationTree });
    }

    handleUpdateNavigationItem = (navigationItem) => {
      this.setState((prevState) => {
        const { navigationTree: prevNavigationTree } = prevState;
        const result = this.find({
          searchMethod: ({ node, searchQuery }) => node.navigationItem._id === searchQuery,
          searchQuery: navigationItem._id,
          searchFocusOffset: 0
        });
        const navigationTree = result.matches.reduce((newNavigationTree, row) => {
          const { path } = row;
          return this.changeNodeAtPath({
            navigationTree: newNavigationTree,
            path,
            newNode: ({ node }) => ({ ...node, navigationItem }),
            ignoreCollapsed: false
          });
        }, prevNavigationTree);
        return { navigationTree };
      });
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
      const { navigationItems, navigationTree, dragging, draggingNavigationTree, sortableNavigationTree, tags } = this.state;
      let currentNavigationTree = navigationTree;
      if (dragging) {
        currentNavigationTree = draggingNavigationTree;
      }
      // console.log(this.state);
      const navigationTreeRows = this.getFlatDataFromNavigationTree(currentNavigationTree, true);

      return (
        <Component
          {...this.props}
          onUpdateNavigationTree={this.handleUpdateNavigationTree}
          sortableNavigationTree={sortableNavigationTree}
          onSetSortableNavigationTree={this.handleSetSortableNavigationTree}
          navigationItems={navigationItems}
          navigationTreeRows={navigationTreeRows}
          onDragHover={this.handleDragHover}
          tags={tags}
          onAddNavigationItem={this.handleAddNavigationItem}
          onSetNavigationTree={this.handleSetNavigationTree}
          onSetTags={this.handleSetTags}
          onSetNavigationItems={this.handleSetNavigationItems}
          onToggleChildrenVisibility={this.handleToggleChildrenVisibility}
          onUpdateNavigationItem={this.handleUpdateNavigationItem}
        />
      );
    }
  }
);
