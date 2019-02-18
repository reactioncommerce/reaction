import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { SortableTable } from "/imports/plugins/core/ui/client/components";
import { Jobs } from "/imports/utils/jobs";
import { i18next } from "/client/api";


class EmailLogs extends Component {
  renderEmailsTable() {
    const filteredFields = ["data.to", "updated", "data.subject", "status"];
    const noDataMessage = i18next.t("admin.logs.noEmails");

    // helper adds a class to every grid row
    const customRowMetaData = {
      bodyCssClassName: () => "email-grid-row"
    };

    // add i18n handling to headers
    const customColumnMetadata = [];
    filteredFields.forEach((field) => {
      let colWidth;
      let colStyle;
      let colClassName;

      if (field === "status") {
        colWidth = 70;
        colStyle = { textAlign: "center" };
        colClassName = "email-log-status";
      }

      // https://react-table.js.org/#/story/cell-renderers-custom-components
      const columnMeta = {
        accessor: field,
        Header: i18next.t(`admin.logs.headers.${field}`),
        Cell: (row) => (
          <Components.EmailTableColumn row={row} />
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
        externalLoadingComponent={Components.Loading}
      />
    );
  }

  render() {
    return (
      <Components.CardGroup>
        <Components.Card>
          <Components.CardHeader
            actAsExpander={true}
            i18nKeyTitle="admin.logs.headers.emailLogs"
            title="Email Logs"
          />
          <Components.CardBody expandable={true}>
            {this.renderEmailsTable()}
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
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
