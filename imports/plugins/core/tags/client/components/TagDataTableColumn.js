import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import { Components, registerComponent, withMoment } from "@reactioncommerce/reaction-components";
import styled from "styled-components";

const EnabledLabel = styled.span`
  padding-left: 8px;
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

    if (renderColumn === "isVisible") {
      return (
        <span>
          <Components.Icon icon="fa fa-circle" className={row.value ? "valid" : "error"} />
          <EnabledLabel>{i18next.t(row.value ? "admin.tags.visible" : "admin.tags.hidden")}</EnabledLabel>
        </span>
      );
    } else if (renderColumn === "edit") {
      return (
        <span>
          <Components.Icon icon="fa fa-pencil" />
        </span>
      );
    }

    return (
      <span>{row.value}</span>
    );
  }
}

registerComponent("TagDataTableColumn", TagDataTableColumn, withMoment);

export default withMoment(TagDataTableColumn);
