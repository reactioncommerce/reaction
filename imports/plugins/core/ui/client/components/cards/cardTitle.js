import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const CardTitle = (props) => {
  const { element, ...rest } = props;

  if (element) {
    return React.cloneElement(element, rest);
  }

  return (
    <h3 className="panel-title">
      <Components.Translation defaultValue={props.title} i18nKey={props.i18nKeyTitle} />
      {props.children}
    </h3>
  );
};

CardTitle.propTypes = {
  children: PropTypes.node,
  element: PropTypes.node,
  i18nKeyTitle: PropTypes.string,
  title: PropTypes.string
};

registerComponent("CardTitle", CardTitle);

export default CardTitle;
