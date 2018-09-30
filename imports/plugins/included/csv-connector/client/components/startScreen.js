import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "@reactioncommerce/components/Button/v1";
import SelectableList from "@reactioncommerce/components/SelectableList/v1";
import SelectableItem from "@reactioncommerce/components/SelectableItem/v1";
import { i18next } from "/client/api";

class StartScreen extends Component {
  handleClickNext = () => {
    this.props.onSetActiveScreen("detail");
  }

  handleChangeJobType = (value) => {
    this.props.onSetField("jobType", value);
  }

  render() {
    const { jobType } = this.props;
    const jobTypeOptions = [{
      id: "import",
      label: i18next.t("admin.dashboard.importFromCSV"),
      value: "import"
    },
    {
      id: "export",
      label: i18next.t("admin.dashboard.exportToCSV"),
      value: "export"
    }];

    return (
      <div>
        <div className="row">
          <h4>{i18next.t("admin.dashboard.startNewJob")}</h4>
          <SelectableList
            components={{
              SelectableItem: (listProps) => (<SelectableItem item={listProps.item} />)
            }}
            options={jobTypeOptions}
            name="jobType"
            value={jobType}
            onChange={this.handleChangeJobType}
          />
        </div>
        <div className="row pull-right mt20 mb20">
          <Button onClick={this.handleClickNext}>Next</Button>
        </div>
      </div>
    );
  }
}

StartScreen.propTypes = {
  jobType: PropTypes.string,
  onSetActiveScreen: PropTypes.func,
  onSetField: PropTypes.func
};

export default StartScreen;
