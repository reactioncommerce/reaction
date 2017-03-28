import React, { PropTypes } from "react";

const ButtonSelect = (props) => {
  const { toggleIcon, defaultBgClassNames,
    currentButton, handleToggle, handleButtonChange, toggleClassNames,
    nonActiveButtons } = props;
  return (
    <div className={defaultBgClassNames}>
      <div className="button-group">
        {currentButton}
        {/* <button className="btn btn-info">Approve</button> */}
        <div className="button-toggle" onClick={handleToggle}>
          <i className={toggleIcon} aria-hidden="true" />
        </div>
      </div>
      <div className={toggleClassNames}>
        {nonActiveButtons.map((button, key) => {
          return (<div className="button-item" key={key} onClick={() => handleButtonChange(button)}>{button.name}</div>);
        })}
      </div>
    </div>
  );
};

ButtonSelect.propTypes = {
  currentButton: PropTypes.node,
  defaultBgClassNames: PropTypes.string,
  handleButtonChange: PropTypes.func,
  handleToggle: PropTypes.func,
  nonActiveButtons: PropTypes.array,
  toggleClassNames: PropTypes.string,
  toggleIcon: PropTypes.string
};

export default ButtonSelect;
