import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Select from "@reactioncommerce/components/Select/v1";
import { i18next } from "client/api";

class MappingTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps, prevState) {
    const { mappingByUser, onSetMappingByUserError, sampleData } = this.props;
    if (!_.isEqual(prevProps.sampleData, sampleData)) {
      // validate the file uploaded here
      let error;
      const field = "mappingByUser";
      if (_.isEmpty(sampleData)) {
        error = [{ name: field, message: "We encountered a problem reading your file. Please upload another file." }];
      } else if (this.sampleDataHasNoContent()) {
        error = [{ name: field, message: "Your file has no content. Please upload another file." }];
      }
      if (error) {
        onSetMappingByUserError(error);
      } else {
        onSetMappingByUserError([]);
      }
    }
    if (!_.isEqual(prevState, this.state)) {
      this.props.onSetMappingByUser(this.state);
    }
    if (!_.isEqual(prevProps.mappingByUser, mappingByUser)) {
      this.setNewMapping();
    }
  }

  setNewMapping = () => {
    const { fieldOptions, mappingByUser, onSetMappingByUserError } = this.props;
    this.setState(mappingByUser);

    let error;
    const fieldCount = _.countBy(_.values(mappingByUser));

    const dupedFieldKeys = [];
    _.forIn(fieldCount, (value, key) => {
      if (key && key !== "ignore" && value > 1) {
        dupedFieldKeys.push(key);
      }
    });

    if (dupedFieldKeys.length > 0) {
      const dupedFieldValues = dupedFieldKeys.map((key) => {
        const fieldOption = fieldOptions.find((option) => option.value === key);
        return fieldOption.label;
      });
      const dupedFields = dupedFieldValues.join(", ");
      error = [{ name: "mappingByUser", message: `The following fields are mapped to more than one CSV column: ${dupedFields}.` }];
    }

    if (error) {
      onSetMappingByUserError(error);
    } else {
      onSetMappingByUserError([]);
    }
  }

  handleChangeFieldMapping= (col) => (value) => {
    this.setState({ [col]: value });
  }

  sampleDataHasNoContent() {
    const { sampleData } = this.props;
    if (_.isEqual(sampleData, { "": [] })) {
      return true;
    }
    return false;
  }

  renderMatchFieldsRow() {
    const {
      errors: { mappingByUser: mappingByUserErrors },
      fieldOptions,
      hasHeader,
      sampleData
    } = this.props;
    const rows = [];
    if (mappingByUserErrors && mappingByUserErrors.length > 0) {
      rows.push((
        <tr key="error-row">
          <td colSpan="2">
            <ErrorsBlock errors={mappingByUserErrors} />
          </td>
        </tr>
      ));
    }

    if (sampleData) {
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
                  value={this.state[col] !== undefined ? this.state[col] : "ignore"}
                  onChange={this.handleChangeFieldMapping(col)}
                  isSearchable
                />
              </td>
            </tr>
          ));
        }
      }
    }

    return rows;
  }

  render() {
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
}

MappingTable.propTypes = {
  errors: PropTypes.object,
  fieldOptions: PropTypes.arrayOf(PropTypes.object),
  hasHeader: PropTypes.bool,
  mappingByUser: PropTypes.object,
  onSetMappingByUser: PropTypes.func,
  onSetMappingByUserError: PropTypes.func,
  sampleData: PropTypes.object
};

export default MappingTable;
