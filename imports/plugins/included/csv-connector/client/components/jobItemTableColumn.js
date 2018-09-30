import React, { Component } from "react";
import PropTypes from "prop-types";
import Alert from "sweetalert2";
import { withMoment, Components } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { i18next } from "/client/api";

class JobItemTableColumn extends Component {
  static propTypes = {
    data: PropTypes.object,
    moment: PropTypes.func,
    row: PropTypes.object
  }

  handleAction = () => {
    const { row: { original: { _id } } } = this.props;
    Meteor.call("csvConnector/removeJobItem", _id, (error) => {
      if (error) {
        return Alert(i18next.t("app.error"), error.message, "error");
      }
      return Alert(i18next.t("app.success"), i18next.t("admin.alerts.jobItemRemoved"), "success");
    });
  }

  render() {
    const { row } = this.props;
    const {
      column: { id: renderColumn },
      original: { errorFileId, exportFileId, _id: jobItemId, status },
      value
    } = row;
    if (renderColumn === "jobType") {
      if (value === "import") {
        return <span>Import</span>;
      }
      return <span>Export</span>;
    } else if (renderColumn === "status") {
      if (value === "pending") {
        return <span>Pending</span>;
      } else if (value === "inProgress") {
        return <span>In Progress</span>;
      } else if (value === "completed") {
        if (errorFileId) {
          return (
            <div>
              <span>Completed</span>
              <br />
              <a
                href={`/jobFiles/JobFiles/${errorFileId}/jobFiles/${jobItemId}.csv`}
                target="_blank"
              >
                {i18next.t("admin.dashboard.downloadErrors")}
              </a>
            </div>
          );
        } else if (exportFileId) {
          return (
            <div>
              <span>Completed</span>
              <br />
              <a
                href={`/jobFiles/JobFiles/${exportFileId}/jobFiles/${jobItemId}.csv`}
                target="_blank"
              >
                {i18next.t("admin.dashboard.downloadData")}
              </a>
            </div>
          );
        }
        return <span>Completed</span>;
      }
      return <span>Failed</span>;
    } else if (["uploadedAt", "completedAt"].includes(renderColumn)) {
      const { moment } = this.props;
      if (value) {
        const displayDate = (moment && moment(value).format("ll")) || value.toLocaleString();
        const displayTime = (moment && moment(value).format("LTS")) || value.toLocaleString();
        return (
          <div>
            <span>{displayDate}</span>
            <br />
            <span>{displayTime}</span>
          </div>
        );
      }
      return null;
    } else if (renderColumn === "delete") {
      if (status === "inProgress") {
        return <span />;
      }
      return (
        <span>
          <Components.Button
            className={{
              "btn": false,
              "btn-default": false
            }}
            tagName="span"
            onClick={this.handleAction}
            title="Delete"
          >
            <Components.Icon icon="fa fa-trash" />
          </Components.Button>
        </span>
      );
    }
    return (
      <span>{value}</span>
    );
  }
}

export default withMoment(JobItemTableColumn);
