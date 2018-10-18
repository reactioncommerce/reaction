import React from "react";
import BadgeOverlay from "@reactioncommerce/components/BadgeOverlay/v1";
import Button from "@reactioncommerce/components/Button/v1";
import CatalogGrid from "@reactioncommerce/components/CatalogGrid/v1";
import CatalogGridItem from "@reactioncommerce/components/CatalogGridItem/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import { Link } from "/imports/plugins/core/ui/client/components/link";
import PhoneNumberInput from "@reactioncommerce/components/PhoneNumberInput/v1";
import Price from "@reactioncommerce/components/Price/v1";
import ProgressiveImage from "@reactioncommerce/components/ProgressiveImage/v1";
import Select from "@reactioncommerce/components/Select/v1";
import spinner from "@reactioncommerce/components/svg/spinner";
import TextInput from "@reactioncommerce/components/TextInput/v1";

/* eslint-disable max-len */

const iconClear = (
  // credit: https://fontawesome.com/icons/times-circle?style=regular
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    style={{ height: "100%", maxHeight: "100%", verticalAlign: "middle" }}
  >
    <path
      fill="#3c3c3c"
      d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"
    />
  </svg>
);

const iconError = (
  // credit: https://fontawesome.com/icons/exclamation-triangle?style=solid
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 576 512"
  >
    <path
      fill="#cd3f4c"
      d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"
    />
  </svg>
);

const iconValid = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    style={{ height: "100%", maxHeight: "100%", verticalAlign: "middle" }}
  >
    <g id="Symbols" fill="none" fillRule="evenodd">
      <g id="Text-field-/-@fill-states-/-validated-field" transform="translate(-342 -10)">
        <g id="Group" transform="translate(342 10)">
          <circle id="Oval" fill="#158562" cx="10" cy="10"
            r="10"
          />
          <path
            d="M9.09817861,10.8533939 L13.3817633,5.70835779 C13.5584492,5.49613933 13.8737186,5.46733456 14.085937,5.64402054 C14.0864297,5.64443069 14.0869215,5.64484179 14.0874126,5.64525384 L15.4038701,6.74989283 C15.6148323,6.92691118 15.6429374,7.24119179 15.4667318,7.45283332 L9.68800426,14.3936934 C9.51131828,14.6059119 9.19604894,14.6347167 8.98383048,14.4580307 C8.98333784,14.4576205 8.98284599,14.4572094 8.98235494,14.4567974 L7.66589745,13.3521584 C7.65157762,13.3401426 7.63810031,13.3274944 7.62547222,13.3142888 L4.59464425,10.7711222 C4.38310692,10.5936213 4.35551493,10.2782435 4.53301583,10.0667062 C4.53570056,10.0635066 4.53842527,10.0603409 4.54118933,10.0572096 L5.75381491,8.68348828 C5.9333307,8.48012404 6.24225889,8.45699274 6.45005744,8.63135642 L9.09817861,10.8533939 Z"
            id="Combined-Shape"
            fill="#FFF"
          />
        </g>
      </g>
    </g>
  </svg>
);

/* eslint-enable max-len */

export default {
  BadgeOverlay,
  Button,
  CatalogGrid,
  CatalogGridItem,
  ErrorsBlock,
  Field,
  Link,
  iconClear,
  iconError,
  iconValid,
  PhoneNumberInput,
  Price,
  ProgressiveImage,
  Select,
  spinner,
  TextInput
};
