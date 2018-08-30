import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "@reactioncommerce/components/Button/v1";
import SelectableList from "@reactioncommerce/components/SelectableList/v1";
import SelectableItem from "@reactioncommerce/components/SelectableItem/v1";

class StartScreen extends Component {
  handleClickNext = () => {
    this.props.onSetActiveScreen("detail");
  }

  handleChangeJobType = (value) => {
    this.props.onSetJobItemField("jobType", value);
  }

  render() {
    const { jobItem: { jobType } } = this.props;
    const jobTypeOptions = [{
      id: "import",
      label: "Import from CSV",
      value: "import"
    },
    {
      id: "export",
      label: "Export to CSV",
      value: "export"
    }];

    return (
      <div>
        <div className="row">
          <h4>Start a new job</h4>
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
  jobItem: PropTypes.object,
  onSetActiveScreen: PropTypes.func,
  onSetJobItemField: PropTypes.func
};

export default StartScreen;
