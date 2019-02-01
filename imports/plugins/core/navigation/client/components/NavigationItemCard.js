import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { DragSource, DropTarget } from "react-dnd";
import styled from "styled-components";
import Paper from "@material-ui/core/Paper";
import Link from "@reactioncommerce/components/Link/v1";
import iconEllipsisV from "../../../svg/iconEllipsisV";
import iconChevronDown from "../../../svg/iconChevronDown";
import iconChevronRight from "../../../svg/iconChevronRight";
import iconPencil from "../../../svg/iconPencil";
import iconTimes from "../../../svg/iconTimes";
import iconFile from "../../../svg/iconFile";
import iconTag from "../../../svg/iconTag";

const CardContainer = styled.div`
  margin-bottom: 5px;
`;
const CardContentContainer = styled.div`
  display: flex;
  padding: 10px 20px;
`;

const HandleIconSpan = styled.span`
  display: inline-block;
  height: 16px;
  width: 16px;
  color: #e6e6e6;
  cursor: pointer;
`;

const ChevronIconContainer = styled.div`
  width: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ChevronIconSpan = styled.span`
  display: inline-block;
  height: 16px;
  width: 16px;
  color: #666666;
`;

const NavDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 20px;
`;

const NavName = styled.p`
  font-weight: 700;
  margin: 0;
`;

const NavDesc = styled.p`
  font-weight: 400;
  margin: 0;
  color: #b3b3b3;
`;

const NavDescSpan = styled.span`
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-right: 10px;
`;

const ActionsContainer = styled.div`
  margin-left: auto;
  display: flex;
`;

const ActionIconContainer = styled.div`
  width: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
`;

const ActionIconSpan = styled.span`
  display: inline-block;
  height: 20px;
  width: 20px;
  color: #666666;
`;

const navigationItemSource = {
  beginDrag(props) {
    const { node: { navigationItem } } = props.row;
    const { _id, draftData } = navigationItem;
    const { value } = draftData.content.find((content) => content.language === "en");

    return {
      node: {
        id: _id,
        title: value
      }
    };
  }
};

/**
 * Specifies which props to inject into your component.
 */
function sourceCollect(connect, monitor) {
  return {
    connectDragPreview: connect.dragPreview(),
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

class NavigationItemCard extends Component {
  static propTypes = {
    onClickUpdateNavigationItem: PropTypes.func,
    onSetDraggingNavigationItemId: PropTypes.func,
    onToggleChildrenVisibility: PropTypes.func,
    row: PropTypes.object
  };

  get type() {
    const { row } = this.props;
    let type;
    if (row) {
      const { node: { navigationItem, tag } } = row;
      if (tag) {
        type = "tag";
      } else if (navigationItem) {
        type = "item";
      }
    }
    return type;
  }

  get isInTree() {
    const { row } = this.props;
    if (row) {
      const { treeIndex } = row;
      if (treeIndex !== undefined) {
        return true;
      }
    }
    return false;
  }

  handleClickEdit = () => {
    const { onClickUpdateNavigationItem, row: { node: { navigationItem } } } = this.props;
    onClickUpdateNavigationItem(navigationItem);
  }

  handleToggleVisibility = () => {
    const { onToggleChildrenVisibility, row: { path } } = this.props;
    onToggleChildrenVisibility(path);
  }

  renderActionButtons() {
    const removeActionButton = (
      <ActionIconContainer>
        <Link onClick={this.removeNavigationItem}>
          <ActionIconSpan>{iconTimes}</ActionIconSpan>
        </Link>
      </ActionIconContainer>
    );

    const editActionButton = (
      <ActionIconContainer>
        <Link onClick={this.handleClickEdit}>
          <ActionIconSpan>{iconPencil}</ActionIconSpan>
        </Link>
      </ActionIconContainer>
    );

    if (this.isInTree || this.type === "item") {
      return (
        <ActionsContainer>
          { this.type === "item" ? editActionButton : null }
          { this.isInTree ? removeActionButton : null }
        </ActionsContainer>
      );
    }
    return null;
  }

  renderChildrenToggleButton() {
    const { row: { node: { expanded, items } } } = this.props;
    if (this.isInTree && items && items.length > 0) {
      return (
        <ChevronIconContainer>
          <Link onClick={this.handleToggleVisibility}>
            <ChevronIconSpan>{expanded ? iconChevronDown : iconChevronRight }</ChevronIconSpan>
          </Link>
        </ChevronIconContainer>
      );
    }
    return null;
  }

  render() {
    const {
      connectDragPreview,
      connectDragSource,
      isDragging,
      row
    } = this.props;

    let title;
    let description;
    let type;

    if (row) {
      const { node: { tag, navigationItem } } = row;
      if (tag) {
        const { name } = tag;
        title = name;
        description = name;
        type = "tag";
      } else if (navigationItem) {
        const { draftData } = navigationItem;
        const { value } = draftData.content.find((content) => content.language === "en");
        title = value;
        ({ url: description } = draftData);
        type = "item";
      }
    }

    const toRender = (
      <div style={{ opacity: isDragging ? 0.5 : 1 }}>
        <CardContainer>
          <Paper>
            <CardContentContainer>
              {
                connectDragSource((
                  <div style={{ width: "20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <HandleIconSpan>{iconEllipsisV}</HandleIconSpan>
                  </div>
                ), {
                  dropEffect: "copy"
                })
              }
              {this.renderChildrenToggleButton()}
              <NavDetailContainer>
                <NavName>{title}</NavName>
                <NavDesc>
                  <NavDescSpan>
                    {type === "tag" ? iconTag : iconFile}
                  </NavDescSpan>
                  {description}
                </NavDesc>
              </NavDetailContainer>
              {this.renderActionButtons()}
            </CardContentContainer>
          </Paper>
        </CardContainer>
      </div>
    );

    return connectDragPreview(<div>{toRender}</div>);
  }
}

export default compose(DragSource("CARD", navigationItemSource, sourceCollect))(NavigationItemCard);
