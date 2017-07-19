import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardBody, CardGroup, Loading, SortableTable } from "/imports/plugins/core/ui/client/components";
import EmailTableColumn from "./emailTableColumn";
import { Jobs } from "/lib/collections";
import { i18next } from "/client/api";


class EmailLogs extends Component {
  renderEmailsTable() {
    const filteredFields = ["data.to", "updated", "data.subject", "status"];
    const noDataMessage = i18next.t("admin.logs.noEmails");

    // helper adds a class to every grid row
    const customRowMetaData = {
      bodyCssClassName: () =>  {
        return "email-grid-row";
      }
    };

    // add i18n handling to headers
    const customColumnMetadata = [];
    filteredFields.forEach(function (field) {
      let colWidth = undefined;
      let colStyle = undefined;
      let colClassName = undefined;

      if (field === "status") {
        colWidth = 70;
        colStyle = { textAlign: "center" };
        colClassName = "email-log-status";
      }

      // https://react-table.js.org/#/story/cell-renderers-custom-components
      const columnMeta = {
        accessor: field,
        Header: i18next.t(`admin.logs.headers.${field}`),
        Cell: row => (
          <EmailTableColumn row={row} />
        ),
        className: colClassName,
        width: colWidth,
        style: colStyle
      };
      customColumnMetadata.push(columnMeta);
    });


    return (
      <SortableTable
        publication="Emails"
        collection={Jobs}
        matchingResultsCount="emails-count"
        showFilter={true}
        rowMetadata={customRowMetaData}
        filteredFields={filteredFields}
        noDataMessage={noDataMessage}
        columnMetadata={customColumnMetadata}
        externalLoadingComponent={Loading}
      />
    );
  }

  render() {
    return (
      <CardGroup>
        <Card
          expanded={true}
        >
          <CardHeader
            actAsExpander={true}
            i18nKeyTitle="admin.logs.headers.emailLogs"
            title="Email Logs"
          />
          <CardBody expandable={true}>
            {this.renderEmailsTable()}
          </CardBody>
        </Card>
      </CardGroup>
    );
  }
}

EmailLogs.propTypes = {
  emails: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    created: PropTypes.instanceOf(Date).isRequired,
    data: PropTypes.shape({
      to: PropTypes.string.isRequired,
      subject: PropTypes.string.isRequired
    }),
    status: PropTypes.string.isRequired
  })),
  limit: PropTypes.string
};

export default EmailLogs;
