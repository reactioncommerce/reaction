import React from "react";
import PropTypes from "prop-types";

/**
 * @see link Modification of https://github.com/ethanselzer/react-image-magnify/blob/master/src/hint/DefaultHint.js
 * @param {Object} props props to pass
 * @returns {Node} react node of Hint component
 */
function Hint({ isTouchDetected, hintTextMouse, hintTextTouch }) {
  return (
    <div style={{
      width: "100%",
      display: "flex",
      justifyContent: "center",
      position: "absolute",
      bottom: "15px"
    }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "5px 10px",
        backgroundColor: "#333",
        borderRadius: "16px",
        opacity: "0.90"
      }}
      >
        <span style={{
          padding: "2px 0 0 2px",
          fontSize: "14px",
          color: "white"
        }}
        >
          { isTouchDetected ? hintTextTouch : hintTextMouse }
        </span>
      </div>
    </div>
  );
}

Hint.displayName = "Hint";

Hint.propTypes = {
  hintTextMouse: PropTypes.string,
  hintTextTouch: PropTypes.string,
  isTouchDetected: PropTypes.bool
};

export default Hint;
