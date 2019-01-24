/**
 * Performs a depth-first traversal over all of the node descendants,
 * incrementing currentIndex by 1 for each
 */
function getNodeDataAtTreeIndexOrNextIndex({
  targetIndex,
  node,
  currentIndex,
  getNodeKey,
  path = [],
  lowerSiblingCounts = [],
  ignoreCollapsed = true,
  isPseudoRoot = false
}) {
  // The pseudo-root is not considered in the path
  const selfPath = !isPseudoRoot
    ? [...path, getNodeKey({ node, treeIndex: currentIndex })]
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
  if (!node.children || (ignoreCollapsed && node.expanded !== true)) {
    return { nextIndex: currentIndex + 1 };
  }

  // Iterate over each child and their descendants and return the
  // target node if childIndex reaches the targetIndex
  let childIndex = currentIndex + 1;
  const childCount = node.children.length;
  for (let i = 0; i < childCount; i += 1) {
    const result = getNodeDataAtTreeIndexOrNextIndex({
      ignoreCollapsed,
      getNodeKey,
      targetIndex,
      node: node.children[i],
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

export function getDescendantCount({ node, ignoreCollapsed = true }) {
  return (
    getNodeDataAtTreeIndexOrNextIndex({
      getNodeKey: () => {},
      ignoreCollapsed,
      node,
      currentIndex: 0,
      targetIndex: -1
    }).nextIndex - 1
  );
}

/**
 * Walk all descendants of the given node, depth-first
 *
 * @param {Object} args - Function parameters
 * @param {function} args.callback - Function to call on each node
 * @param {function} args.getNodeKey - Function to get the key from the nodeData and tree index
 * @param {boolean} args.ignoreCollapsed - Ignore children of nodes without `expanded` set to `true`
 * @param {boolean=} args.isPseudoRoot - If true, this node has no real data, and only serves
 *                                        as the parent of all the nodes in the tree
 * @param {Object} args.node - A tree node
 * @param {Object=} args.parentNode - The parent node of `node`
 * @param {number} args.currentIndex - The treeIndex of `node`
 * @param {number[]|string[]} args.path - Array of keys leading up to node to be changed
 * @param {number[]} args.lowerSiblingCounts - An array containing the count of siblings beneath the
 *                                             previous nodes in this path
 *
 * @return {number|false} nextIndex - Index of the next sibling of `node`,
 *                                    or false if the walk should be terminated
 */
function walkDescendants({
  callback,
  getNodeKey,
  ignoreCollapsed,
  isPseudoRoot = false,
  node,
  parentNode = null,
  currentIndex,
  path = [],
  lowerSiblingCounts = []
}) {
  // The pseudo-root is not considered in the path
  const selfPath = isPseudoRoot
    ? []
    : [...path, getNodeKey({ node, treeIndex: currentIndex })];
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
    !node.children ||
    (node.expanded !== true && ignoreCollapsed && !isPseudoRoot)
  ) {
    return currentIndex;
  }

  // Get all descendants
  let childIndex = currentIndex;
  const childCount = node.children.length;
  if (typeof node.children !== "function") {
    for (let i = 0; i < childCount; i += 1) {
      childIndex = walkDescendants({
        callback,
        getNodeKey,
        ignoreCollapsed,
        node: node.children[i],
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

/**
 * Perform a change on the given node and all its descendants, traversing the tree depth-first
 *
 * @param {Object} args - Function parameters
 * @param {function} args.callback - Function to call on each node
 * @param {function} args.getNodeKey - Function to get the key from the nodeData and tree index
 * @param {boolean} args.ignoreCollapsed - Ignore children of nodes without `expanded` set to `true`
 * @param {boolean=} args.isPseudoRoot - If true, this node has no real data, and only serves
 *                                        as the parent of all the nodes in the tree
 * @param {Object} args.node - A tree node
 * @param {Object=} args.parentNode - The parent node of `node`
 * @param {number} args.currentIndex - The treeIndex of `node`
 * @param {number[]|string[]} args.path - Array of keys leading up to node to be changed
 * @param {number[]} args.lowerSiblingCounts - An array containing the count of siblings beneath the
 *                                             previous nodes in this path
 *
 * @return {number|false} nextIndex - Index of the next sibling of `node`,
 *                                    or false if the walk should be terminated
 */
function mapDescendants({
  callback,
  getNodeKey,
  ignoreCollapsed,
  isPseudoRoot = false,
  node,
  parentNode = null,
  currentIndex,
  path = [],
  lowerSiblingCounts = []
}) {
  const nextNode = { ...node };

  // The pseudo-root is not considered in the path
  const selfPath = isPseudoRoot
    ? []
    : [...path, getNodeKey({ node: nextNode, treeIndex: currentIndex })];
  const selfInfo = {
    node: nextNode,
    parentNode,
    path: selfPath,
    lowerSiblingCounts,
    treeIndex: currentIndex
  };

  // Return self on nodes with no children or hidden children
  if (
    !nextNode.children ||
    (nextNode.expanded !== true && ignoreCollapsed && !isPseudoRoot)
  ) {
    return {
      treeIndex: currentIndex,
      node: callback(selfInfo)
    };
  }

  // Get all descendants
  let childIndex = currentIndex;
  const childCount = nextNode.children.length;
  if (typeof nextNode.children !== "function") {
    nextNode.children = nextNode.children.map((child, i) => {
      const mapResult = mapDescendants({
        callback,
        getNodeKey,
        ignoreCollapsed,
        node: child,
        parentNode: isPseudoRoot ? null : nextNode,
        currentIndex: childIndex + 1,
        lowerSiblingCounts: [...lowerSiblingCounts, childCount - i - 1],
        path: selfPath
      });
      childIndex = mapResult.treeIndex;

      return mapResult.node;
    });
  }

  return {
    node: callback(selfInfo),
    treeIndex: childIndex
  };
}

/**
 * Count all the visible (expanded) descendants in the tree data.
 *
 * @param {!Object[]} treeData - Tree data
 *
 * @return {number} count
 */
export function getVisibleNodeCount({ treeData }) {
  const traverse = (node) => {
    if (
      !node.children ||
      node.expanded !== true ||
      typeof node.children === "function"
    ) {
      return 1;
    }

    return (
      1 +
      node.children.reduce(
        (total, currentNode) => total + traverse(currentNode),
        0
      )
    );
  };

  return treeData.reduce(
    (total, currentNode) => total + traverse(currentNode),
    0
  );
}

/**
 * Get the <targetIndex>th visible node in the tree data.
 *
 * @param {!Object[]} treeData - Tree data
 * @param {!number} targetIndex - The index of the node to search for
 * @param {!function} getNodeKey - Function to get the key from the nodeData and tree index
 *
 * @return {{
 *      node: Object,
 *      path: []string|[]number,
 *      lowerSiblingCounts: []number
 *  }|null} node - The node at targetIndex, or null if not found
 */
export function getVisibleNodeInfoAtIndex({
  treeData,
  index: targetIndex,
  getNodeKey
}) {
  if (!treeData || treeData.length < 1) {
    return null;
  }

  // Call the tree traversal with a pseudo-root node
  const result = getNodeDataAtTreeIndexOrNextIndex({
    targetIndex,
    getNodeKey,
    node: {
      children: treeData,
      expanded: true
    },
    currentIndex: -1,
    path: [],
    lowerSiblingCounts: [],
    isPseudoRoot: true
  });

  if (result.node) {
    return result;
  }

  return null;
}

/**
 * Walk descendants depth-first and call a callback on each
 *
 * @param {!Object[]} treeData - Tree data
 * @param {!function} getNodeKey - Function to get the key from the nodeData and tree index
 * @param {function} callback - Function to call on each node
 * @param {boolean=} ignoreCollapsed - Ignore children of nodes without `expanded` set to `true`
 *
 * @return void
 */
export function walk({
  treeData,
  getNodeKey,
  callback,
  ignoreCollapsed = true
}) {
  if (!treeData || treeData.length < 1) {
    return;
  }

  walkDescendants({
    callback,
    getNodeKey,
    ignoreCollapsed,
    isPseudoRoot: true,
    node: { children: treeData },
    currentIndex: -1,
    path: [],
    lowerSiblingCounts: []
  });
}

/**
 * Perform a depth-first transversal of the descendants and
 *  make a change to every node in the tree
 *
 * @param {!Object[]} treeData - Tree data
 * @param {!function} getNodeKey - Function to get the key from the nodeData and tree index
 * @param {function} callback - Function to call on each node
 * @param {boolean=} ignoreCollapsed - Ignore children of nodes without `expanded` set to `true`
 *
 * @return {Object[]} changedTreeData - The changed tree data
 */
export function map({
  treeData,
  getNodeKey,
  callback,
  ignoreCollapsed = true
}) {
  if (!treeData || treeData.length < 1) {
    return [];
  }

  return mapDescendants({
    callback,
    getNodeKey,
    ignoreCollapsed,
    isPseudoRoot: true,
    node: { children: treeData },
    currentIndex: -1,
    path: [],
    lowerSiblingCounts: []
  }).node.children;
}

/**
 * Expand or close every node in the tree
 *
 * @param {!Object[]} treeData - Tree data
 * @param {?boolean} expanded - Whether the node is expanded or not
 *
 * @return {Object[]} changedTreeData - The changed tree data
 */
export function toggleExpandedForAll({ treeData, expanded = true }) {
  return map({
    treeData,
    callback: ({ node }) => ({ ...node, expanded }),
    getNodeKey: ({ treeIndex }) => treeIndex,
    ignoreCollapsed: false
  });
}

/**
 * Replaces node at path with object, or callback-defined object
 *
 * @param {!Object[]} treeData
 * @param {number[]|string[]} path - Array of keys leading up to node to be changed
 * @param {function|any} newNode - Node to replace the node at the path with, or a function producing the new node
 * @param {!function} getNodeKey - Function to get the key from the nodeData and tree index
 * @param {boolean=} ignoreCollapsed - Ignore children of nodes without `expanded` set to `true`
 *
 * @return {Object[]} changedTreeData - The changed tree data
 */
export function changeNodeAtPath({
  treeData,
  path,
  newNode,
  getNodeKey,
  ignoreCollapsed = true
}) {
  const RESULT_MISS = "RESULT_MISS";
  const traverse = ({
    isPseudoRoot = false,
    node,
    currentTreeIndex,
    pathIndex
  }) => {
    if (
      !isPseudoRoot &&
      getNodeKey({ node, treeIndex: currentTreeIndex }) !== path[pathIndex]
    ) {
      return RESULT_MISS;
    }

    if (pathIndex >= path.length - 1) {
      // If this is the final location in the path, return its changed form
      return typeof newNode === "function"
        ? newNode({ node, treeIndex: currentTreeIndex })
        : newNode;
    }
    if (!node.children) {
      // If this node is part of the path, but has no children, return the unchanged node
      throw new Error("Path referenced children of node with no children.");
    }

    let nextTreeIndex = currentTreeIndex + 1;
    for (let i = 0; i < node.children.length; i += 1) {
      const result = traverse({
        node: node.children[i],
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
            children: [
              ...node.children.slice(0, i),
              result,
              ...node.children.slice(i + 1)
            ]
          };
        }
        // If the result was falsy (returned from the newNode function), then
        //  delete the node from the array.
        return {
          ...node,
          children: [
            ...node.children.slice(0, i),
            ...node.children.slice(i + 1)
          ]
        };
      }

      nextTreeIndex +=
        1 + getDescendantCount({ node: node.children[i], ignoreCollapsed });
    }

    return RESULT_MISS;
  };

  // Use a pseudo-root node in the beginning traversal
  const result = traverse({
    node: { children: treeData },
    currentTreeIndex: -1,
    pathIndex: -1,
    isPseudoRoot: true
  });

  if (result === RESULT_MISS) {
    throw new Error("No node found at the given path.");
  }

  return result.children;
}

/**
 * Removes the node at the specified path and returns the resulting treeData.
 *
 * @param {!Object[]} treeData
 * @param {number[]|string[]} path - Array of keys leading up to node to be deleted
 * @param {!function} getNodeKey - Function to get the key from the nodeData and tree index
 * @param {boolean=} ignoreCollapsed - Ignore children of nodes without `expanded` set to `true`
 *
 * @return {Object[]} changedTreeData - The tree data with the node removed
 */
export function removeNodeAtPath({
  treeData,
  path,
  getNodeKey,
  ignoreCollapsed = true
}) {
  return changeNodeAtPath({
    treeData,
    path,
    getNodeKey,
    ignoreCollapsed,
    newNode: null // Delete the node
  });
}

/**
 * Removes the node at the specified path and returns the resulting treeData.
 *
 * @param {!Object[]} treeData
 * @param {number[]|string[]} path - Array of keys leading up to node to be deleted
 * @param {!function} getNodeKey - Function to get the key from the nodeData and tree index
 * @param {boolean=} ignoreCollapsed - Ignore children of nodes without `expanded` set to `true`
 *
 * @return {Object} result
 * @return {Object[]} result.treeData - The tree data with the node removed
 * @return {Object} result.node - The node that was removed
 * @return {number} result.treeIndex - The previous treeIndex of the removed node
 */
export function removeNode({
  treeData,
  path,
  getNodeKey,
  ignoreCollapsed = true
}) {
  let removedNode = null;
  let removedTreeIndex = null;
  const nextTreeData = changeNodeAtPath({
    treeData,
    path,
    getNodeKey,
    ignoreCollapsed,
    newNode: ({ node, treeIndex }) => {
      // Store the target node and delete it from the tree
      removedNode = node;
      removedTreeIndex = treeIndex;

      return null;
    }
  });

  return {
    treeData: nextTreeData,
    node: removedNode,
    treeIndex: removedTreeIndex
  };
}

/**
 * Gets the node at the specified path
 *
 * @param {!Object[]} treeData
 * @param {number[]|string[]} path - Array of keys leading up to node to be deleted
 * @param {!function} getNodeKey - Function to get the key from the nodeData and tree index
 * @param {boolean=} ignoreCollapsed - Ignore children of nodes without `expanded` set to `true`
 *
 * @return {Object|null} nodeInfo - The node info at the given path, or null if not found
 */
export function getNodeAtPath({
  treeData,
  path,
  getNodeKey,
  ignoreCollapsed = true
}) {
  let foundNodeInfo = null;

  try {
    changeNodeAtPath({
      treeData,
      path,
      getNodeKey,
      ignoreCollapsed,
      newNode: ({ node, treeIndex }) => {
        foundNodeInfo = { node, treeIndex };
        return node;
      }
    });
  } catch (err) {
    // Ignore the error -- the null return will be explanation enough
  }

  return foundNodeInfo;
}

/**
 * Adds the node to the specified parent and returns the resulting treeData.
 *
 * @param {!Object[]} treeData
 * @param {!Object} newNode - The node to insert
 * @param {number|string} parentKey - The key of the to-be parentNode of the node
 * @param {!function} getNodeKey - Function to get the key from the nodeData and tree index
 * @param {boolean=} ignoreCollapsed - Ignore children of nodes without `expanded` set to `true`
 * @param {boolean=} expandParent - If true, expands the parentNode specified by parentPath
 * @param {boolean=} addAsFirstChild - If true, adds new node as first child of tree
 *
 * @return {Object} result
 * @return {Object[]} result.treeData - The updated tree data
 * @return {number} result.treeIndex - The tree index at which the node was inserted
 */
export function addNodeUnderParent({
  treeData,
  newNode,
  parentKey = null,
  getNodeKey,
  ignoreCollapsed = true,
  expandParent = false,
  addAsFirstChild = false
}) {
  if (parentKey === null) {
    return {
      treeData: [...(treeData || []), newNode],
      treeIndex: (treeData || []).length
    };
  }

  let insertedTreeIndex = null;
  let hasBeenAdded = false;
  const changedTreeData = map({
    treeData,
    getNodeKey,
    ignoreCollapsed,
    callback: ({ node, treeIndex, path }) => {
      const key = path ? path[path.length - 1] : null;
      // Return nodes that are not the parent as-is
      if (hasBeenAdded || key !== parentKey) {
        return node;
      }
      hasBeenAdded = true;

      const parentNode = {
        ...node
      };

      if (expandParent) {
        parentNode.expanded = true;
      }

      // If no children exist yet, just add the single newNode
      if (!parentNode.children) {
        insertedTreeIndex = treeIndex + 1;
        return {
          ...parentNode,
          children: [newNode]
        };
      }

      if (typeof parentNode.children === "function") {
        throw new Error("Cannot add to children defined by a function");
      }

      let nextTreeIndex = treeIndex + 1;
      for (let i = 0; i < parentNode.children.length; i += 1) {
        nextTreeIndex +=
          1 +
          getDescendantCount({ node: parentNode.children[i], ignoreCollapsed });
      }

      insertedTreeIndex = nextTreeIndex;

      const children = addAsFirstChild
        ? [newNode, ...parentNode.children]
        : [...parentNode.children, newNode];

      return {
        ...parentNode,
        children
      };
    }
  });

  if (!hasBeenAdded) {
    throw new Error("No node found with the given key.");
  }

  return {
    treeData: changedTreeData,
    treeIndex: insertedTreeIndex
  };
}

function addNodeAtDepthAndIndex({
  targetDepth,
  minimumTreeIndex,
  newNode,
  ignoreCollapsed,
  expandParent,
  isPseudoRoot = false,
  isLastChild,
  node,
  currentIndex,
  currentDepth,
  getNodeKey,
  path = []
}) {
  const selfPath = (n) =>
    (isPseudoRoot
      ? []
      : [...path, getNodeKey({ node: n, treeIndex: currentIndex })]);

  // If the current position is the only possible place to add, add it
  if (
    currentIndex >= minimumTreeIndex - 1 ||
    (isLastChild && !(node.children && node.children.length))
  ) {
    if (typeof node.children === "function") {
      throw new Error("Cannot add to children defined by a function");
    } else {
      const extraNodeProps = expandParent ? { expanded: true } : {};
      const nextNode = {
        ...node,

        ...extraNodeProps,
        children: node.children ? [newNode, ...node.children] : [newNode]
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
      !node.children ||
      typeof node.children === "function" ||
      (node.expanded !== true && ignoreCollapsed && !isPseudoRoot)
    ) {
      return { node, nextIndex: currentIndex + 1 };
    }

    // Scan over the children to see if there's a place among them that fulfills
    // the minimumTreeIndex requirement
    let childIndex = currentIndex + 1;
    let insertedTreeIndex = null;
    let insertIndex = null;
    for (let i = 0; i < node.children.length; i += 1) {
      // If a valid location is found, mark it as the insertion location and
      // break out of the loop
      if (childIndex >= minimumTreeIndex) {
        insertedTreeIndex = childIndex;
        insertIndex = i;
        break;
      }

      // Increment the index by the child itself plus the number of descendants it has
      childIndex +=
        1 + getDescendantCount({ node: node.children[i], ignoreCollapsed });
    }

    // If no valid indices to add the node were found
    if (insertIndex === null) {
      // If the last position in this node's children is less than the minimum index
      // and there are more children on the level of this node, return without insertion
      if (childIndex < minimumTreeIndex && !isLastChild) {
        return { node, nextIndex: childIndex };
      }

      // Use the last position in the children array to insert the newNode
      insertedTreeIndex = childIndex;
      insertIndex = node.children.length;
    }

    // Insert the newNode at the insertIndex
    const nextNode = {
      ...node,
      children: [
        ...node.children.slice(0, insertIndex),
        newNode,
        ...node.children.slice(insertIndex)
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
    !node.children ||
    typeof node.children === "function" ||
    (node.expanded !== true && ignoreCollapsed && !isPseudoRoot)
  ) {
    return { node, nextIndex: currentIndex + 1 };
  }

  // Get all descendants
  let insertedTreeIndex = null;
  let pathFragment = null;
  let parentNode = null;
  let childIndex = currentIndex + 1;
  let newChildren = node.children;
  if (typeof newChildren !== "function") {
    newChildren = newChildren.map((child, i) => {
      if (insertedTreeIndex !== null) {
        return child;
      }

      const mapResult = addNodeAtDepthAndIndex({
        targetDepth,
        minimumTreeIndex,
        newNode,
        ignoreCollapsed,
        expandParent,
        isLastChild: isLastChild && i === newChildren.length - 1,
        node: child,
        currentIndex: childIndex,
        currentDepth: currentDepth + 1,
        getNodeKey,
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

/**
 * Insert a node into the tree at the given depth, after the minimum index
 *
 * @param {!Object[]} treeData - Tree data
 * @param {!number} depth - The depth to insert the node at (the first level of the array being depth 0)
 * @param {!number} minimumTreeIndex - The lowest possible treeIndex to insert the node at
 * @param {!Object} newNode - The node to insert into the tree
 * @param {boolean=} ignoreCollapsed - Ignore children of nodes without `expanded` set to `true`
 * @param {boolean=} expandParent - If true, expands the parent of the inserted node
 * @param {!function} getNodeKey - Function to get the key from the nodeData and tree index
 *
 * @return {Object} result
 * @return {Object[]} result.treeData - The tree data with the node added
 * @return {number} result.treeIndex - The tree index at which the node was inserted
 * @return {number[]|string[]} result.path - Array of keys leading to the node location after insertion
 * @return {Object} result.parentNode - The parent node of the inserted node
 */
export function insertNode({
  treeData,
  depth: targetDepth,
  minimumTreeIndex,
  newNode,
  getNodeKey = () => {},
  ignoreCollapsed = true,
  expandParent = false
}) {
  if (!treeData && targetDepth === 0) {
    return {
      treeData: [newNode],
      treeIndex: 0,
      path: [getNodeKey({ node: newNode, treeIndex: 0 })],
      parentNode: null
    };
  }

  const insertResult = addNodeAtDepthAndIndex({
    targetDepth,
    minimumTreeIndex,
    newNode,
    ignoreCollapsed,
    expandParent,
    getNodeKey,
    isPseudoRoot: true,
    isLastChild: true,
    node: { children: treeData },
    currentIndex: -1,
    currentDepth: -1
  });

  if (!("insertedTreeIndex" in insertResult)) {
    throw new Error("No suitable position found to insert.");
  }

  const treeIndex = insertResult.insertedTreeIndex;
  return {
    treeData: insertResult.node.children,
    treeIndex,
    path: [
      ...insertResult.parentPath,
      getNodeKey({ node: newNode, treeIndex })
    ],
    parentNode: insertResult.parentNode
  };
}

/**
 * Get tree data flattened.
 *
 * @param {!Object[]} treeData - Tree data
 * @param {!function} getNodeKey - Function to get the key from the nodeData and tree index
 * @param {boolean=} ignoreCollapsed - Ignore children of nodes without `expanded` set to `true`
 *
 * @return {{
 *      node: Object,
 *      path: []string|[]number,
 *      lowerSiblingCounts: []number
 *  }}[] nodes - The node array
 */
export function getFlatDataFromTree({
  treeData,
  getNodeKey,
  ignoreCollapsed = true
}) {
  if (!treeData || treeData.length < 1) {
    return [];
  }

  const flattened = [];
  walk({
    treeData,
    getNodeKey,
    ignoreCollapsed,
    callback: (nodeInfo) => {
      flattened.push(nodeInfo);
    }
  });

  return flattened;
}

/**
 * Generate a tree structure from flat data.
 *
 * @param {!Object[]} flatData
 * @param {!function=} getKey - Function to get the key from the nodeData
 * @param {!function=} getParentKey - Function to get the parent key from the nodeData
 * @param {string|number=} rootKey - The value returned by `getParentKey` that corresponds to the root node.
 *                                  For example, if your nodes have id 1-99, you might use rootKey = 0
 *
 * @return {Object[]} treeData - The flat data represented as a tree
 */
export function getTreeFromFlatData({
  flatData,
  getKey = (node) => node.id,
  getParentKey = (node) => node.parentId,
  rootKey = "0"
}) {
  if (!flatData) {
    return [];
  }

  const childrenToParents = {};
  flatData.forEach((child) => {
    const parentKey = getParentKey(child);

    if (parentKey in childrenToParents) {
      childrenToParents[parentKey].push(child);
    } else {
      childrenToParents[parentKey] = [child];
    }
  });

  if (!(rootKey in childrenToParents)) {
    return [];
  }

  const trav = (parent) => {
    const parentKey = getKey(parent);
    if (parentKey in childrenToParents) {
      return {
        ...parent,
        children: childrenToParents[parentKey].map((child) => trav(child))
      };
    }

    return { ...parent };
  };

  return childrenToParents[rootKey].map((child) => trav(child));
}

/**
 * Check if a node is a descendant of another node.
 *
 * @param {!Object} older - Potential ancestor of younger node
 * @param {!Object} younger - Potential descendant of older node
 *
 * @return {boolean}
 */
export function isDescendant(older, younger) {
  return (
    !!older.children &&
    typeof older.children !== "function" &&
    older.children.some((child) => child === younger || isDescendant(child, younger))
  );
}

/**
 * Get the maximum depth of the children (the depth of the root node is 0).
 *
 * @param {!Object} node - Node in the tree
 * @param {?number} depth - The current depth
 *
 * @return {number} maxDepth - The deepest depth in the tree
 */
export function getDepth(node, depth = 0) {
  if (!node.children) {
    return depth;
  }

  if (typeof node.children === "function") {
    return depth + 1;
  }

  return node.children.reduce(
    (deepest, child) => Math.max(deepest, getDepth(child, depth + 1)),
    depth
  );
}

/**
 * Find nodes matching a search query in the tree,
 *
 * @param {!function} getNodeKey - Function to get the key from the nodeData and tree index
 * @param {!Object[]} treeData - Tree data
 * @param {?string|number} searchQuery - Function returning a boolean to indicate whether the node is a match or not
 * @param {!function} searchMethod - Function returning a boolean to indicate whether the node is a match or not
 * @param {?number} searchFocusOffset - The offset of the match to focus on
 *                                      (e.g., 0 focuses on the first match, 1 on the second)
 * @param {boolean=} expandAllMatchPaths - If true, expands the paths to any matched node
 * @param {boolean=} expandFocusMatchPaths - If true, expands the path to the focused node
 *
 * @return {Object[]} matches - An array of objects containing the matching `node`s, their `path`s and `treeIndex`s
 * @return {Object[]} treeData - The original tree data with all relevant nodes expanded.
 *                               If expandAllMatchPaths and expandFocusMatchPaths are both false,
 *                               it will be the same as the original tree data.
 */
export function find({
  getNodeKey,
  treeData,
  searchQuery,
  searchMethod,
  searchFocusOffset,
  expandAllMatchPaths = false,
  expandFocusMatchPaths = true
}) {
  let matchCount = 0;
  const trav = ({ isPseudoRoot = false, node, currentIndex, path = [] }) => {
    let matches = [];
    let isSelfMatch = false;
    let hasFocusMatch = false;
    // The pseudo-root is not considered in the path
    const selfPath = isPseudoRoot
      ? []
      : [...path, getNodeKey({ node, treeIndex: currentIndex })];
    const extraInfo = isPseudoRoot
      ? null
      : {
        path: selfPath,
        treeIndex: currentIndex
      };

    // Nodes with with children that aren't lazy
    const hasChildren =
      node.children &&
      typeof node.children !== "function" &&
      node.children.length > 0;

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
      newNode.children = newNode.children.map((child) => {
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

  const result = trav({
    node: { children: treeData },
    isPseudoRoot: true,
    currentIndex: -1
  });

  return {
    matches: result.matches,
    treeData: result.node.children
  };
}
