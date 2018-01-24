import _ from "lodash";
import { check } from "meteor/check";
import * as Schemas from "/lib/collections/schemas";

/**
 * @file **PropTypes** - React Component PropTypes methods for validating Tags
 *
 * @namespace PropTypes
 */

const TagSchema = Schemas.Tag.newContext();

export const PropTypes = {};

/**
 * @name Tag
 * @summary React Component PropTypes validator for a single Tag
 * @method
 * @memberof PropTypes
 * @param  {Object} props An object containing all props passed into the component
 * @param  {String} propName Name of prop to validate
 * @return {Error|undefined} returns an error if validation us unseccessful
 */
PropTypes.Tag = (props, propName) => {
  check(props, Object);
  check(propName, String);

  if (_.isEmpty(props[propName]) === false) {
    if (TagSchema.validate(props[propName]) === false) {
      return new Error("Tag must be of type: Schemas.Tag");
    }
  }
};

/**
 * @name arrayOfTags
 * @summary React Component PropTypes validator for an array of Tags
 * @method
 * @memberof PropTypes
 * @param  {Object} props An object containing all props passed into the component
 * @param  {String} propName Name of prop to validate
 * @return {Error|undefined} returns an error if validation us unseccessful
 */
PropTypes.arrayOfTags = (props, propName) => {
  check(props, Object);
  check(propName, String);

  if (_.isEmpty(props[propName]) === false && _.isArray(props[propName])) {
    const valid = _.every(props[propName], (tag) => TagSchema.validate(tag));

    if (valid === false) {
      return new Error("Objects in array must be of type: Schemas.Tag");
    }
  }
};
