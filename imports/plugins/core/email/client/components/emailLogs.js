import React, { Component, PropTypes } from "react";
import moment from "moment";
import { Card, CardHeader, CardBody, CardGroup, Icon, Loading } from "/imports/plugins/core/ui/client/components";
import MeteorGriddle from "/imports/plugins/core/ui-grid/client/griddle";
import { Jobs } from "/lib/collections";
import { i18next } from "/client/api";
import "./emailConfig.css";


class EmailLogs extends Component {

  renderEmailsTable() {
    const filteredFields = ["data.to", "updated", "data.subject", "status"];
    const filteredFieldsColumns = ["data.to", "updated", "data.subject", "status"];
    const noDataMessage = i18next.t("admin.logs.noEmails");


    // helper adds a class to every grid row
    const customRowMetaData = {
      bodyCssClassName: () =>  {
        return "email-grid-row";
      }
    };


    const ColumnData = React.createClass({

      handleAction() {
        const emailId = this.props.rowData._id;
        const emailAddress = this.props.rowData.data.to;

        Meteor.call("emails/retryFailed", emailId, (err) => {
          if (err) {
            return Alerts.toast(i18next.t("app.error", { error: err.reason }), "error");
          }
          return Alerts.toast(i18next.t("mail.alerts.resendSuccess", { email: emailAddress }), "success");
        });
      },
      render() {
        const renderColumn = this.props.metadata.columnName;

        if (renderColumn === "status") {
          if (this.props.data === "completed") {
            return (
              <span>
                <Icon icon="fa fa-circle" className="pull-left valid" />
              </span>
            );
          }
          return (
            <span>
              <Icon icon="fa fa-circle" className="pull-left error" />
              <span onClick={this.handleAction} title={this.props.data}><Icon icon="fa fa-share" className="pull-right" /></span>
            </span>
          );
        }
        if (renderColumn === "updated") {
          const createdDate = moment(this.props.data).format("LLL");
          return (
            <span>{createdDate}</span>
          );
        }
        return (
          <span>{this.props.data}</span>
        );
      }
    });


    // add i18n handling to headers
    const customColumnMetadata = [];
    filteredFields.forEach(function (field) {
      const columnMeta = {
        columnName: field,
        displayName: i18next.t(`admin.logs.headers.${field}`),
        customComponent: ColumnData
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
        columnMetadata={customColumnMetadata}
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
