import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Select from "@reactioncommerce/components/Select/v1";


class MappingTable extends Component {
  constructor(props) {
    super(props);
    this.state = props.mappingByUser;
  }

  componentDidMount() {
    const { onSetMappingByUserError, sampleData } = this.props;
    // validate the file uploaded here
    let error;
    const field = "mappingByUser";
    if (_.isEmpty(sampleData)) {
      error = [{ name: field, message: "We encountered a problem reading your file. Please upload another file." }];
    } else if (this.sampleDataHasNoContent()) {
      error = [{ name: field, message: "We encountered a problem reading your file. Please upload another file." }];
    }
    if (error) {
      onSetMappingByUserError(error);
    } else {
      onSetMappingByUserError([]);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const isEqual = _.isEqual(prevState, this.state);
    if (!isEqual) {
      this.props.onSetMappingByUser(this.state);
    }
  }

  handleChangeFieldMapping= (col) => (value) => {
    if (value === this.state[col]) {
      return;
    }
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
      return (
        <tr>
          <td colSpan="2">
            <ErrorsBlock errors={mappingByUserErrors} />
          </td>
        </tr>
      );
    }
    for (const col in sampleData) {
      if (col in sampleData) {
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
    return rows;
  }

  render() {
    return (
      <div className="csv-table-container">
        <table className="table csv-table">
          <thead>
            <tr>
              <th width="50%">CSV Column Names</th>
              <th>Reaction Fields</th>
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
