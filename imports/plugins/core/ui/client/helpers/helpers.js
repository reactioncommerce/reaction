import _ from "lodash";
import classnames from "classnames";

export const templateClassName = (templateInstance, defaults, key) => {
  const classNameData = templateInstance.data.classNames || {};
  const classNameOverrides = classNameData[key];

  if (_.isString(classNameOverrides)) {
    return classnames(defaults, classNameOverrides);
  }

  return classnames({
    ...defaults || {},
    ...classNameOverrides
  });
};
