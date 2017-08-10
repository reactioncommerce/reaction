import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Icon } from "../icon";

/**
 * React component for displaying a not-found view
 * @param {Object} props React props
 * @return {Node} React node containing not-found view
 */
const NotFound = (props) => {
  // ClassName for base wrapper,
  // If one is provied in props, the default is not used
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
  /**
   * Children
   * @type {Node}
   */
  children: PropTypes.node,

  /**
   * Base wrapper className
   * @summary String className or `classnames` compatable object for the base wrapper
   * @type {String|Object}
   */
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

  /**
   * Content className
   * @summary String className or `classnames` compatable object for the content wrapper
   * @type {String|Object}
   */
  contentClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

  /**
   * i18n key for message
   * @type {String}
   */
  i18nKeyMessage: PropTypes.string,

  /**
   * i18n key for title
   * @type {String}
   */
  i18nKeyTitle: PropTypes.string,

  /**
   * Icon name
   * @type {String}
   */
  icon: PropTypes.string,

  /**
   * Message text
   * @type {String}
   */
  message: PropTypes.string,

  /**
   * Title
   * @type {String}
   */
  title: PropTypes.string
};

registerComponent("NotFound", NotFound);

export default NotFound;
