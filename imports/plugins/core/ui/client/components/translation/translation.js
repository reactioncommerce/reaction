import { camelCase } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";

const Translation = ({ i18nKey, defaultValue, ...rest }) => {
  const key = i18nKey || camelCase(defaultValue);
  const translation = i18next.t(key, { defaultValue });

  // i18next returns 'undefined' if the default value happens to be the key for a set of definitions
  // ```
  // "components": {
  //    "componentDef": "Translated Component Def"
  // }
  // ```
  // In this case, a request for i18next.t("components", "defaultValue") will return undefined
  // but i18next.t("components.componentDef", "defaultValue") will return correctly
  //
  // This checks to see if translation is undefined and returns the default value instead
  if (typeof translation === "undefined") {
    return (
      <span {...rest}>{defaultValue}</span>
    );
  }

  return (
    <span {...rest}>{translation}</span>
  );
};

Translation.propTypes = {
  defaultValue: PropTypes.string,
  i18nKey: PropTypes.string
};

registerComponent("Translation", Translation);

export default Translation;
