// eslint-disable react/no-multi-comp to allow Loadable to dynamically load DayPickerRangeController
/* eslint-disable react/no-multi-comp */
import React from "react";
import "react-dates/initialize";
import Loadable from "react-loadable";
import { Components } from "@reactioncommerce/reaction-components";

const DayPickerRangeController = Loadable({
  loader: () => import("react-dates"),
  loading() {
    return (
      <Components.Loading />
    );
  },
  render(loaded, props) {
    const DayPicker = loaded.DayPickerRangeController;
    return <DayPicker {...props}/>;
  }
});

export default DayPickerRangeController;
