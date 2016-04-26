import classnames from "classnames";

const templateClassName = (templateInstance, defaults, key) => {
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


export { templateClassName };
