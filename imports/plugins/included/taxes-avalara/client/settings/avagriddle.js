/* eslint react/prop-types:0, react/jsx-sort-props:0, react/forbid-prop-types: 0, "react/prefer-es6-class": [1, "never"] */
import _ from "lodash";
import React from "react";
import createReactClass from "create-react-class";
import PropTypes from "prop-types";
import moment from "moment";
import Griddle from "griddle-react";
import { Meteor } from "meteor/meteor";
import { Counts } from "meteor/tmeasday:publish-counts";
import { ReactMeteorData } from "meteor/react-meteor-data";

const LogGriddle = createReactClass({
  propTypes: {
    collection: PropTypes.object,
    matchingResultsCount: PropTypes.string,
    publication: PropTypes.string,
    subscriptionParams: PropTypes.object
  },
  mixins: [ReactMeteorData],

  getInitialState() {
    return {
      currentPage: 0,
      maxPages: 0,
      externalResultsPerPage: this.props.externalResultsPerPage,
      externalSortColumn: this.props.externalSortColumn,
      externalSortAscending: this.props.externalSortAscending
    };
  },

  getMeteorData() {
    const matchingResults = Counts.get(this.props.matchingResultsCount);
    const pubHandle = Meteor.subscribe(this.props.publication, this.props.subscriptionParams);
    const rawResults = this.props.collection.find({}).fetch();
    let results;
    if (rawResults) {
      results = rawResults.map((o) => {
        return {
          date: moment(o.data).format("MM/DD/YYYY HH:mm:ss"),
          docType: _.get(o, "data.request.data.type", ""),
          request: JSON.stringify(o.data.request),
          result: JSON.stringify(o.data.result),
          _id: o._id
        };
      });
    }

    return {
      loading: !pubHandle.ready(),
      results,
      matchingResults
    };
  },

  setPage(index) {
    this.setState({ currentPage: index });
  },

  render() {
    const maxPages = Math.ceil(this.data.matchingResults / this.state.externalResultsPerPage);
    const allProps = this.props;

    return (
      <Griddle
        {...allProps}
        tableClassName="table"
        results={this.data.results}
        columnMetaData={this.props.columnMetaData}
        externalSetPage={this.setPage}
        externalSetPageSize={this.setPageSize}
        externalMaxPage={maxPages}
        externalSortColumn={this.state.externalSortColumn}
        externalSortAscending={this.state.externalSortAscending}
        externalIsLoading={this.data.loading}
      />
    );
  }

});

export default LogGriddle;
