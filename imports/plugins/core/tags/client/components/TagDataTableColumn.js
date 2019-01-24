import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import { Components, registerComponent, withMoment } from "@reactioncommerce/reaction-components";
import { applyTheme } from "@reactioncommerce/components/utils";
import colors from "/imports/plugins/core/router/client/theme/colors.js";
import styled, { css } from "styled-components";
import CircleIcon from "mdi-material-ui/CheckboxBlankCircle";

const Cell = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const CenteredCell = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const EnabledLabel = styled.span`
  padding-left: 8px;
`;

const HeroMedia = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 30px;
  height: 100%;
`;

const HeroMediaImage = styled.img`
  object-fit: cover;
  width: 53px;
  height: 30px
  border-radius: 2px;
  border: ${applyTheme("HeroMediaSmall.border")}
`;

const StatusIcon = styled(({ isVisible, ...rest }) => <CircleIcon {...rest} />)`
  ${({ isVisible }) => (isVisible && css`color: ${colors.forestGreen300}`) || css`color: ${colors.black40}`};
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
        <Cell>
          <StatusIcon isVisible={row.value} fontSize="small" />
          <EnabledLabel>{i18next.t(row.value ? "admin.tags.visible" : "admin.tags.hidden")}</EnabledLabel>
        </Cell>
      );
    } else if (renderColumn === "edit") {
      return (
        <CenteredCell>
          <Components.Icon icon="fa fa-pencil" />
        </CenteredCell>
      );
    } else if (renderColumn === "heroMediaUrl") {
      return (
        <HeroMedia>
          {(row.value && <HeroMediaImage src={row.value} width="100%" alt="" />) || "-"}
        </HeroMedia>
      );
    }

    return (
      <Cell>{row.value}</Cell>
    );
  }
}

registerComponent("TagDataTableColumn", TagDataTableColumn, withMoment);

export default withMoment(TagDataTableColumn);
