import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import { Components, registerComponent, withMoment } from "@reactioncommerce/reaction-components";
import styled from "styled-components";
import Tooltip from "@material-ui/core/Tooltip";

const EnabledLabel = styled.span`
  padding-left: 8px;
`;

const TooltipLabel = styled.div`
  word-break: break-all;
  font-size: 12px;
  padding: 3px;
  line-height: 18px
`;

const StatusLabel = styled.span`
  text-transform: capitalize
`;

class TagDataTableColumn extends Component {
  static propTypes = {
    data: PropTypes.object,
    moment: PropTypes.func,
    row: PropTypes.object
  }

  render() {
    const { row } = this.props;

    const renderColumn = row.column.id;

    if (renderColumn === "enabled") {
      return (
        <span>
          <Components.Icon icon="fa fa-circle" className={row.value ? "valid" : "error"} />
          <EnabledLabel>{i18next.t(row.value ? "admin.routing.enabled" : "admin.routing.disabled")}</EnabledLabel>
        </span>
      );
    } else if (renderColumn === "edit") {
      return (
        <span>
          <Components.Icon icon="fa fa-pencil" />
        </span>
      );
    } else if (renderColumn === "status") {
      const status = row.original.type === "rewrite" ? row.original.type : row.value;
      return <StatusLabel>{status}</StatusLabel>;
    } else if (renderColumn === "updated") {
      const { moment } = this.props;
      const createdDate = (moment && moment(row.value).format("LLL")) || row.value.toLocaleString();
      return (
        <span>{createdDate}</span>
      );
    }

    if (renderColumn === "from" || renderColumn === "to") {
      return (
        <Tooltip title={<TooltipLabel>{row.value}</TooltipLabel>}>
          <span>{row.value}</span>
        </Tooltip>
      );
    }

    return (
      <span>{row.value}</span>
    );
  }
}

registerComponent("TagDataTableColumn", TagDataTableColumn, withMoment);

export default withMoment(TagDataTableColumn);
