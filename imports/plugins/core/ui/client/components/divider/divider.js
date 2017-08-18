import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
// import { pure } from "recompose"; // See comment on `registerComponent()`
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const Divider = (props) => {
  const { label, i18nKeyLabel } = props;

  const classes = classnames({
    rui: true,
    separator: true,
    divider: true,
    labeled: label || i18nKeyLabel
  });

  if (label) {
    return (
      <div className={classes} id={props.id}>
        <hr />
        <span className="label">
          <Components.Translation defaultValue={label} i18nKey={i18nKeyLabel} />
        </span>
        <hr />
      </div>
    );
  }

  return (
    <div className={classes}>
      <hr />
    </div>
  );
};

Divider.propTypes = {
  i18nKeyLabel: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string
};

// This cannot be a pure component, as the i18nKey never changes,
// even with a language switch, it's still an `i18nKey` like `app.public`.
// Since the key stays the same, the props don't change, the text doesn't update.
// We can revisit this in React 16
// - EK 8/2/17
// registerComponent("Divider", Divider, pure);
registerComponent("Divider", Divider);

export default Divider;
