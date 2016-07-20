import React, { Component, PropTypes } from "react";
import { default as MBColorPikcer } from  "react-colorpickr";
import TetherComponent from "react-tether";

class ColorPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      color: props.color || "#000000",
      isOpen: false
    };

    // Bind event handlers
    this.handleColorClick = this.handleColorClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.closePopover = this.closePopover.bind(this);

    document.body.addEventListener("reactionCloseAllPopovers", this.closePopover);
  }

  componentWillUnmount() {
    document.body.removeEventListener("reactionCloseAllPopovers", this.closePopover);
  }

  closePopover() {
    this.setState({
      isOpen: false
    });
  }

  handleClickOutside(event) {
    // TODO: Don't mix jQuery and react
    if ($(event.target).closest(".color-picker").length === 0) {
      this.closePopover();
    }
  }

  handleColorClick() {
    document.body.dispatchEvent(new Event("reactionCloseAllPopovers"));

    this.setState({
      isOpen: !this.state.isOpen
    }, () => {
      if (this.state.isOpen === true) {
        document.body.addEventListener("click", this.handleClickOutside);
      } else {
        document.body.removeEventListener("click", this.handleClickOutside);
      }
    });
  }

  handleChange(color) {
    const rgba = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;

    this.setState({color: rgba});

    this.props.onChange && this.props.onChange(rgba);
  }

  render() {
    return (
      <div className="rui swatch" ref="colorPicker">
        <TetherComponent
          attachment="top left"
          className="rui popover color-picker open"
          constraints={[{
            to: "scrollParent",
            attachment: "together"
          }]}
          targetAttachment="bottom right"
        >
          <div
            className="color"
            onClick={this.handleColorClick}
            style={{backgroundColor: this.state.color}}
          />

          {this.state.isOpen &&
            <div className="rui over">
              <div className="popover-title">
                  <button
                    className="btn btn-link"
                    onClick={this.handleColorClick}
                  >
                    {"Close"}
                  </button>
              </div>

              <MBColorPikcer
                onChange={this.handleChange}
                value={this.state.color}
              />
            </div>
          }
        </TetherComponent>
      </div>
    );
  }
}

ColorPicker.propTypes = {
  color: PropTypes.string,
  handleChange: PropTypes.func,
  onChange: PropTypes.func
};

export default ColorPicker;
