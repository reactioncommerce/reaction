import { camelCase } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";

const Translation = ({ i18nKey, defaultValue, ...rest }) => {
  const key = i18nKey || camelCase(defaultValue);
  const translation = i18next.t(key, { defaultValue });

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
