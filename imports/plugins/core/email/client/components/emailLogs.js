import React, { Component, PropTypes } from "react";
import moment from "moment";
import { Card, CardHeader, CardBody, CardGroup, Loading } from "/imports/plugins/core/ui/client/components";
import MeteorGriddle from "/imports/plugins/core/ui-grid/client/griddle";
import { Jobs } from "/lib/collections";
import { i18next } from "/client/api";


class EmailLogs extends Component {

  renderEmailsTable() {
    const filteredFields = ["data.to", "data.subject"];
    const filteredFieldsColumns = ["data.to", "data.subject", "resend"];
    // const filteredFields = ["data.to", "data.subject", "status"];
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
      const columnMeta = {
        columnName: field,
        displayName: i18next.t(`admin.logs.headers.${field}`)
      };
      customColumnMetadata.push(columnMeta);
    });

    return (
      <MeteorGriddle
        publication="Emails"
        collection={Jobs}
        matchingResultsCount="emails-count"
        showFilter={true}
        useGriddleStyles={false}
        rowMetadata={customRowMetaData}
        filteredFields={filteredFields}
        columns={filteredFieldsColumns}
        noDataMessage={noDataMessage}
        externalLoadingComponent={Loading}
      />
    );
  }

  render() {
    return (
      <CardGroup>
        <Card
          expanded={false}
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
