/**
 * @summary Returns an disjoint object as right join. For a visualization, see:
 *          http://www.codeproject.com/KB/database/Visual_SQL_Joins/Visual_SQL_JOINS_orig.jpg
 *          Additionally, the join is done recursively on properties of
 *          nested objects as well. Nested arrays are handled like
 *          primitive values.
 * @author Tom De Caluwé
 * @memberof Core
 * @param {Object} leftSet An object that can contain nested sub-objects
 * @param {Object} rightSet An object that can contain nested sub-objects
 * @returns {Object} The disjoint object that does only contain properties
 *                   from the rightSet. But only those, that were not present
 *                   in the leftSet.
 */
const doRightJoinNoIntersection = (leftSet, rightSet) => {
  if (rightSet === null) return null;

  let rightJoin;
  if (Array.isArray(rightSet)) {
    rightJoin = [];
  } else {
    rightJoin = {};
  }
  const findRightOnlyProperties = () => Object.keys(rightSet).filter((key) => {
    if (typeof (rightSet[key]) === "object" &&
        !Array.isArray(rightSet[key])) {
      // Nested objects are always considered
      return true;
    }
    // Array or primitive value
    return !{}.hasOwnProperty.call(leftSet, key);
  });

  for (const key of findRightOnlyProperties()) {
    if (typeof (rightSet[key]) === "object") {
      // subobject or array
      if ({}.hasOwnProperty.call(leftSet, key) && (typeof (leftSet[key]) !== "object" ||
           Array.isArray(leftSet[key]) !== Array.isArray(rightSet[key]))) {
        // This is not expected!
        throw new Error(`${"Left object and right object's internal structure must be congruent! Offending key: "}${key}`);
      }
      const rightSubJoin = doRightJoinNoIntersection(
        {}.hasOwnProperty.call(leftSet, key) ? leftSet[key] : {},
        rightSet[key]
      );

      const obj = {};
      if (rightSubJoin === null) {
        obj[key] = null;
      } else if (Object.keys(rightSubJoin).length !== 0 ||
                 Array.isArray(rightSubJoin)) {
        // object or (empty) array
        obj[key] = rightSubJoin;
      }
      rightJoin = Object.assign(rightJoin, obj);
    } else if (Array.isArray(rightSet)) { // primitive value (or array)
      rightJoin.push(rightSet[key]);
    } else {
      const obj = {};
      obj[key] = rightSet[key];
      rightJoin = Object.assign(rightJoin, obj);
    }
  }
  return rightJoin;
};

export default doRightJoinNoIntersection;
