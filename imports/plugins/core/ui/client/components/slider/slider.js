/**
 * Implementing No UI Slider
 * https://www.npmjs.com/package/react-nouislider
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import Nouislider from "react-nouislider";
import { registerComponent } from "@reactioncommerce/reaction-components";

class Slider extends Component {
  render() {
    return (
      <Nouislider
        range={this.props.range}
        start={this.props.start}
        tooltips={this.props.tooltips}
        connect={this.props.connect}
        step={this.props.step}
        orientation={this.props.orientation}
        margin={this.props.margin}
        padding={this.props.padding}
        onChange={this.props.onChange}
        onSlide={this.props.onSlide}
      />
    );
  }
}

Slider.propTypes = {
  connect: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  margin: PropTypes.number,
  onChange: PropTypes.func,
  onSlide: PropTypes.func,
  orientation: PropTypes.string,
  padding: PropTypes.number,
  range: PropTypes.object,
  start: PropTypes.arrayOf(PropTypes.number),
  step: PropTypes.number,
  tooltips: PropTypes.oneOfType([PropTypes.array, PropTypes.bool])
};

Slider.defaultProps = {
  range: {
    min: 0,
    max: 100
  },
  start: [0, 100],
  step: 5,
  orientation: "horizontal",
  tooltips: true,
  margin: 0,
  padding: 0
};

registerComponent("Slider", Slider);

export default Slider;
