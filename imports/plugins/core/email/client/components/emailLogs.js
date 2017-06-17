import React, { Component, PropTypes } from "react";
import { Card, CardHeader, CardBody, CardGroup, Icon, Loading, SortableTable } from "/imports/plugins/core/ui/client/components";
import EmailTableColumn from "./emailTableColumn";
import { Jobs } from "/lib/collections";
import { i18next } from "/client/api";
import "./emailConfig.css";


class EmailLogs extends Component {
  renderEmailsTable() {
    const filteredFields = ["data.to", "data.subject", "status"];
    // const filteredFields = ["data.to", "updated", "data.subject", "status"];
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
      console.log("field", field);
      if (field === "status") {
        // customComponent: EmailTableColumn
        // https://react-table.js.org/#/story/cell-renderers-custom-components
        const columnMeta = {
          accessor: field,
          Header: i18next.t(`admin.logs.headers.${field}`),
          width: 50,
          Cell: row => (
            <span>{
                row.value === "complete" ? <Icon icon="fa fa-circle" className="pull-left valid" />
              : <span><Icon icon="fa fa-circle" className="pull-left error" />
                <span>
                  <Icon icon="fa fa-share" className="pull-right" />
                </span></span>
              }
            </span>
          )
        };
        customColumnMetadata.push(columnMeta);
      } else {
        const columnMeta = {
          accessor: field,
          Header: i18next.t(`admin.logs.headers.${field}`)
        };
        customColumnMetadata.push(columnMeta);
      }
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
