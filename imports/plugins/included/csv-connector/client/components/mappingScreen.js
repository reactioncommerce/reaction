import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import Button from "@reactioncommerce/components/Button/v1";
import SelectableList from "@reactioncommerce/components/SelectableList/v1";
import SelectableItem from "@reactioncommerce/components/SelectableItem/v1";


class MappingScreen extends Component {
  handleClickBack = () => {
    this.props.onSetActiveScreen("detail", false);
  };

  handleClickDone = () => {
    this.props.onDone();
  };

  handleFieldChange = (event, value, field) => {
    this.props.onSetJobItemField(field, value);
  }

  handleChangeSaveMappingAction = (value) => {
    this.props.onSetJobItemField("saveMappingAction", value);
  }

  handleToggleSaveToNewMapping = (event, value) => {
    this.props.onSetJobItemField("saveToNewMapping", value);
  }

  renderFileName = () => {
    const { fileUpload: { name: fileName } } = this.props;
    if (fileName) {
      if (fileName.length < 30) {
        return (<p>{fileName}</p>);
      }
      const subFileName = `...${fileName.substring(fileName.length - 27, fileName.length)}`;
      return (<p>{subFileName}</p>);
    }
    return null;
  }

  renderNewMappingName() {
    const { jobItem: { mappingId, newMappingName, saveMappingAction, saveToNewMapping } } = this.props;
    if ((mappingId === "create" && saveToNewMapping) || saveMappingAction === "create") {
      return (
        <div className="mt20">
          <Components.TextField
            i18nKeyLabel="admin.dashboard.jobName"
            label="New mapping template name"
            name="newMappingName"
            onChange={this.handleFieldChange}
            ref="newMappingNameInput"
            value={newMappingName || ""}
          />
        </div>
      );
    }
    return null;
  }

  renderSaveMapping() {
    const { jobItem: { mappingId, saveToNewMapping, saveMappingAction } } = this.props;
    if (mappingId === "create") {
      return (
        <div>
          <Components.Switch
            name="saveToNewMapping"
            label={"Save to new mapping template"}
            checked={saveToNewMapping}
            onChange={this.handleToggleSaveToNewMapping}
          />
          {this.renderNewMappingName()}
        </div>
      );
    }

    const saveMappingOptions = [{
      id: "create",
      label: "Save as new mapping template",
      value: "create"
    },
    {
      id: "update",
      label: "Update current mapping template",
      value: "update"
    },
    {
      id: "pass",
      label: "Do not update current mapping template",
      value: "pass"
    }];

    return (
      <div>
        <SelectableList
          components={{
            SelectableItem: (listProps) => (<SelectableItem item={listProps.item} />)
          }}
          options={saveMappingOptions}
          name="saveMappingAction"
          value={saveMappingAction || "pass"}
          onChange={this.handleChangeSaveMappingAction}
        />
        {this.renderNewMappingName()}
      </div>
    );
  }

  renderMappingName() {
    const { jobItem: { mappingId }, mappingName } = this.props;
    if (mappingId !== "create" && mappingName) {
      return <p>Using <strong>{mappingName}</strong></p>;
    }
    return null;
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-md-12">
            <h4>Import</h4>
          </div>
          <div className="col-sm-12 col-md-5">
            <div className="mt20">
              {this.renderMappingName()}
              {this.renderFileName()}
            </div>
            <div className="mt20">
              {this.renderSaveMapping()}
            </div>
          </div>
        </div>
        <div className="row pull-right mt20 mb20">
          <Button actionType="secondary" onClick={this.handleClickBack} className="mr20">Back</Button>
          <Button onClick={this.handleClickDone}>Done</Button>
        </div>
      </div>
    );
  }
}

MappingScreen.propTypes = {
  fileUpload: PropTypes.object,
  jobItem: PropTypes.object,
  mappingName: PropTypes.string,
  onDone: PropTypes.func,
  onSetActiveScreen: PropTypes.func,
  onSetJobItemField: PropTypes.func
};

export default MappingScreen;
