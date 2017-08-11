import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Icon } from "../icon";

/**
 * @summary React component for displaying a not-found view
 * @param {Object} props - React PropTypes
 * @property {String|Object} className - String className or `classnames` compatible object for the base wrapper
 * @property {String|Object} contentClassName - String className or `classnames` compatible object for the content wrapper
 * @property {String} i18nKeyMessage - i18n key for message
 * @property {String} i18nKeyTitle - i18n key for title
 * @property {String} icon - icon font class names
 * @property {String} message - extra message text
 * @property {String} title - title of page
 * @return {Node} React node containing not-found view
 */
const NotFound = (props) => {
  // ClassName for base wrapper,
  // If one is provided in props, the default is not used
  const baseClassName = classnames({
    "container-fluid-sm": typeof props.className === "undefined"
  }, props.className);

  // ClassName for content wrapper
  // If one is provided in props, the default is not used
  const contentClassName = classnames({
    "empty-view-message": typeof props.contentClassName === "undefined"
  }, props.contentClassName);

  return (
    <div className={baseClassName}>
      <div className={contentClassName}>
        { props.icon &&
          <Icon icon={props.icon} />
        }

        { props.title &&
          <Components.Translation defaultValue={props.title} i18nKey={props.i18nKeyTitle} />
        }

        { props.message &&
          <Components.Translation defaultValue={props.message} i18nKey={props.i18nKeyMessage} />
        }

        {props.children}
      </div>
    </div>
  );
};

NotFound.propTypes = {
  children: PropTypes.node,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  contentClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  i18nKeyMessage: PropTypes.string,
  i18nKeyTitle: PropTypes.string,
  icon: PropTypes.string,
  message: PropTypes.string,
  title: PropTypes.string
};

registerComponent("NotFound", NotFound);

export default NotFound;
