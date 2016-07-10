import _ from "lodash";
import * as Schemas from "/lib/collections/schemas";

const TagSchema = Schemas.Tag.newContext();

export const PropTypes = {};

/**
 * React Component propType validator for a single Tag
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
 * React Component propType validator for an array of Tags
 * @param  {Object} props An object containing all props passed into the component
 * @param  {String} propName Name of prop to validate
 * @return {Error|undefined} returns an error if validation us unseccessful
 */
PropTypes.arrayOfTags = (props, propName) => {
  check(props, Object);
  check(propName, String);

  if (_.isEmpty(props[propName]) === false && _.isArray(props[propName])) {
    const valid = _.every(props[propName], (tag) => {
      return TagSchema.validate(tag);
    });

    if (valid === false) {
      return new Error("Objects in array must be of type: Schemas.Tag");
    }
  }
};
