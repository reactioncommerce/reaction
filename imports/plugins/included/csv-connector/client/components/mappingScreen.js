import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "@reactioncommerce/components/Button/v1";
import Checkbox from "@reactioncommerce/components/Checkbox/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import Select from "@reactioncommerce/components/Select/v1";
import SelectableList from "@reactioncommerce/components/SelectableList/v1";
import SelectableItem from "@reactioncommerce/components/SelectableItem/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { i18next } from "client/api";
import MappingTable from "./mappingTable";


class MappingScreen extends Component {
  componentDidMount() {
    this.props.onSetSampleData();
  }

  handleClickBack = () => {
    this.props.onSetActiveScreen("detail", false);
  }

  handleClickDone = () => {
    this.props.onDone();
  }

  handleChangeFieldMapping = (col) => (value) => {
    this.props.onSetFieldMapping(col, value);
  }

  handleChangeNewMappingName = (value) => {
    this.props.onSetField("newMappingName", value);
  }

  handleChangeSaveMappingAction = (value) => {
    this.props.onSetField("saveMappingAction", value);
  }

  handleChangeShouldSaveToNewMapping = (value) => {
    this.props.onSetField("shouldSaveToNewMapping", value);
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

  renderMatchFieldsRow() {
    const { fieldOptions, hasHeader, mappingByUser, sampleData } = this.props;
    const rows = [];
    for (const col in sampleData) {
      if ({}.hasOwnProperty.call(sampleData, col)) {
        let colName = col;
        if (!hasHeader) { // If no header cols are indices
          colName = `Column ${parseInt(col, 10) + 1}`;
        }
        rows.push((
          <tr key={`col-${col}`}>
            <td>
              <div className="csv-col-name">
                <p>{colName}</p>
              </div>
              <div className="mt20">
                {sampleData[col].map((item, index) => (<p key={`col-${col}-${index}`}>{item}</p>))}
              </div>
            </td>
            <td>
              <Select
                id={`field${col}Input`}
                name={col}
                options={fieldOptions}
                value={mappingByUser[col] !== undefined ? mappingByUser[col] : "ignore"}
                onChange={this.handleChangeFieldMapping(col)}
                isSearchable
              />
            </td>
          </tr>
        ));
      }
    }
    return rows;
  }

  renderMatchFieldsTable() {
    return (
      <div className="csv-table-container">
        <table className="table csv-table">
          <thead>
            <tr>
              <th width="50%">{i18next.t("admin.dashboard.csvColumnNames")}</th>
              <th>{i18next.t("admin.dashboard.reactionFields")}</th>
            </tr>
          </thead>
          <tbody>
            {this.renderMatchFieldsRow()}
          </tbody>
        </table>
      </div>
    );
  }

  renderNewMappingName() {
    const {
      errors: {
        newMappingName: newMappingNameErrors
      },
      mappingId,
      newMappingName,
      shouldSaveToNewMapping,
      saveMappingAction
    } = this.props;
    if ((mappingId === "default" && shouldSaveToNewMapping) || (mappingId !== "default" && saveMappingAction === "create")) {
      return (
        <div className="mt20 mr20">
          <Field
            errors={newMappingNameErrors}
            name="name"
            label={i18next.t("admin.dashboard.newMappingName")}
            labelFor="newMappingNameInput"
          >
            <TextInput
              errors={newMappingNameErrors}
              id="newMappingNameInput"
              name="newMappingName"
              value={newMappingName}
              onChanging={this.handleChangeNewMappingName}
            />
            <ErrorsBlock errors={newMappingNameErrors} />
          </Field>
        </div>
      );
    }
    return null;
  }

  renderSaveMapping() {
    const { mappingId, shouldSaveToNewMapping, saveMappingAction } = this.props;
    if (mappingId === "default") {
      return (
        <div>
          <Checkbox
            label={i18next("admin.dashboard.shouldSaveToNewMapping")}
            name="shouldSaveToNewMapping"
            onChange={this.handleChangeShouldSaveToNewMapping}
            value={shouldSaveToNewMapping}
          />
          {this.renderNewMappingName()}
        </div>
      );
    }

    const saveMappingOptions = [{
      id: "create",
      label: i18next.t("admin.dashboard.saveMappingCreate"),
      value: "create"
    },
    {
      id: "update",
      label: i18next.t("admin.dashboard.saveMappingUpdate"),
      value: "update"
    },
    {
      id: "none",
      label: i18next.t("admin.dashboard.saveMappingNone"),
      value: "none"
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
    const { mappingId, selectedMapping: { name: mappingName } } = this.props;
    if (mappingId !== "default" && mappingName) {
      return <p>{i18next.t("admin.dashboard.using")} <strong>{mappingName}</strong></p>;
    }
    return null;
  }

  render() {
    const {
      errors,
      fieldOptions,
      hasHeader,
      mappingByUser,
      onSetMappingByUser,
      onSetMappingByUserError,
      sampleData
    } = this.props;
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
          <div className="col-sm-12 col-md-7">
            <MappingTable
              errors={errors}
              fieldOptions={fieldOptions}
              hasHeader={hasHeader}
              mappingByUser={mappingByUser}
              onSetMappingByUser={onSetMappingByUser}
              onSetMappingByUserError={onSetMappingByUserError}
              sampleData={sampleData}
            />
          </div>
        </div>
        <div className="row pull-right mt20 mb20">
          <Button actionType="secondary" onClick={this.handleClickBack} className="mr20">{i18next.t("admin.dashboard.back")}</Button>
          <Button onClick={this.handleClickDone}>{i18next.t("admin.dashboard.done")}</Button>
        </div>
      </div>
    );
  }
}

MappingScreen.propTypes = {
  errors: PropTypes.object,
  fieldOptions: PropTypes.arrayOf(PropTypes.object),
  fileUpload: PropTypes.object,
  hasHeader: PropTypes.bool,
  mappingByUser: PropTypes.object,
  mappingId: PropTypes.string,
  mappingName: PropTypes.string,
  newMappingName: PropTypes.string,
  onDone: PropTypes.func,
  onSetActiveScreen: PropTypes.func,
  onSetField: PropTypes.func,
  onSetFieldMapping: PropTypes.func,
  onSetMappingByUser: PropTypes.func,
  onSetMappingByUserError: PropTypes.func,
  onSetSampleData: PropTypes.func,
  sampleData: PropTypes.object,
  saveMappingAction: PropTypes.string,
  selectedMapping: PropTypes.object,
  shouldSaveToNewMapping: PropTypes.bool
};

export default MappingScreen;
