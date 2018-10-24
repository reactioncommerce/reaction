import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { withComponents } from "@reactioncommerce/components-context";
import { applyTheme, addTypographyStyles, CustomPropTypes } from "@reactioncommerce/components/utils";

const AddNewItemAction = styled.div`
  border-color: ${applyTheme("AddressBook.borderColor")};
  border-style: ${applyTheme("AddressBook.borderStyle")};
  border-width: ${applyTheme("AddressBook.borderWidth")};
  border-bottom-left-radius: ${applyTheme("AddressBook.borderRadius")};
  border-bottom-right-radius: ${applyTheme("AddressBook.borderRadius")};
  border-top: none;
  box-sizing: border-box;
  color: inherit;
  overflow: hidden;
  padding-bottom: ${applyTheme("AddressBook.addActionPaddingBottom")};
  padding-left: ${applyTheme("AddressBook.addActionPaddingLeft")};
  padding-right: ${applyTheme("AddressBook.addActionPaddingRight")};
  padding-top: ${applyTheme("AddressBook.addActionPaddingTop")};
`;

const AddNewItemActionButton = styled.div`
  ${addTypographyStyles("ActionButton", "labelText")};
  color: ${applyTheme("AddressBook.actionButtonColor")};
  cursor: pointer;
  display: table;
  &:hover {
    color: ${applyTheme("AddressBook.actionButtonHoverColor")};
    svg {
      color: inherit !important;
    }
  }
`;

const AddNewItemActionIcon = styled.span`
  color: inherit;
  height: ${applyTheme("AddressBook.actionButtonIconHeight")};
  margin: 0;
  margin-right: ${applyTheme("AddressBook.actionButtonIconMarginRight")};
  width: ${applyTheme("AddressBook.actionButtonIconWidth")};
  svg {
    color: ${applyTheme("AddressBook.actionButtonIconColor")};
    fill: currentColor;
    height: 1em;
    width: 1em;
    vertical-align: middle;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-bottom: ${applyTheme("AddressBook.actionPaddingBottom")};
  padding-left: ${applyTheme("AddressBook.actionPaddingLeft")};
  padding-right: ${applyTheme("AddressBook.actionPaddingRight")};
  padding-top: ${applyTheme("AddressBook.actionPaddingTop")};

  > div:last-of-type {
    margin-left: ${applyTheme("AddressBook.spaceBetweenActiveActionButtons")};
  }
`;

const FormActionDelete = styled.div`
  flex: 1 1 auto;

  > div {
    border: none;
    &:hover {
      background-color: transparent;
      color: ${applyTheme("AddressBook.actionDeleteButtonHoverColor")};
    }
  }
`;

const ENTRY = "entry";
const LIST = "list";

class AccordionFormList extends Component {
  static propTypes = {
    /**
     * Text to show on the button for adding a new item to the list
     */
    addNewItemButtonText: PropTypes.string,
    /**
     * You can provide a `className` prop that will be applied to the outermost DOM element
     * rendered by this component. We do not recommend using this for styling purposes, but
     * it can be useful as a selector in some situations.
     */
    className: PropTypes.string,
    /**
     * If you've set up a components context using @reactioncommerce/components-context
     * (recommended), then this prop will come from there automatically. If you have not
     * set up a components context or you want to override one of the components in a
     * single spot, you can pass in the components prop directly.
     */
    components: PropTypes.shape({
      /**
       * Pass either the Reaction Accordion component or your own component that
       * accepts compatible props.
       */
      Accordion: CustomPropTypes.component.isRequired,
      /**
       * Pass either the Reaction iconPlus component or your own component that
       * accepts compatible props.
       */
      iconPlus: PropTypes.node.isRequired,
      /**
       * The form component to render when adding a new item. It must have a
       * "submit" method on the instance or forward "ref" to a component that does.
       */
      ItemAddForm: CustomPropTypes.component.isRequired,
      /**
       * The form component to render when editing an item. It must have a
       * "submit" method on the instance or forward "ref" to a component that does.
       */
      ItemEditForm: CustomPropTypes.component.isRequired
    }).isRequired,
    /**
     * Text to show on the button for deleting an item from the list
     */
    deleteItemButtonText: PropTypes.string,
    /**
     * Text to show on the button for submitting the new item entry form
     */
    entryFormSubmitButtonText: PropTypes.string,
    /**
     * Is some async operation happening? Puts buttons into waiting state
     */
    isWaiting: PropTypes.bool,
    /**
     * Arbitrary props to pass to ItemAddForm instance
     */
    itemAddFormProps: PropTypes.object,
    /**
     * The list of items to show accordion edit forms for
     */
    items: PropTypes.arrayOf(PropTypes.shape({
      /**
       * Accordion detail
       */
      detail: PropTypes.string,
      /**
       * A unique ID
       */
      id: PropTypes.string.isRequired,
      /**
       * Arbitrary props to pass to ItemEditForm instance
       */
      itemEditFormProps: PropTypes.object,
      /**
       * Accordion label
       */
      label: PropTypes.string.isRequired
    })),
    /**
     * Handles item deletion from list
     */
    onItemDeleted: PropTypes.func
  };

  static defaultProps = {
    addNewItemButtonText: "Add an item",
    deleteItemButtonText: "Delete this item",
    entryFormSubmitButtonText: "Add item",
    isWaiting: false,
    onItemDeleted() {}
  };

  state = {
    status: LIST
  };

  _refs = {};

  //
  // Handler Methods
  //
  handleDeleteItem = (itemId) => {
    const { onItemDeleted } = this.props;
    onItemDeleted(itemId);
  };

  handleAddClick = () => {
    this.setState({ status: ENTRY });
  };

  handleEntryFormCancel = () => {
    this.setState({ status: LIST });
  };

  toggleAccordionForItem(itemId) {
    this._refs[`accordion_${itemId}`].toggle();
  }

  //
  // Render Methods
  //
  renderAddressSelect() {
    const {
      addNewItemButtonText,
      components: { Accordion, Button, iconPlus, ItemEditForm },
      deleteItemButtonText,
      isWaiting,
      items
    } = this.props;

    return (
      <Fragment>
        {items.map(({ detail, id, itemEditFormProps, label }) => (
          <Accordion
            key={id}
            label={label}
            detail={detail}
            ref={(el) => {
              this._refs[`accordion_${id}`] = el;
            }}
          >
            <ItemEditForm
              {...itemEditFormProps}
              ref={(el) => {
                this._refs[`editForm_${id}`] = el;
              }}
            />
            <FormActions>
              <FormActionDelete>
                <Button
                  actionType="secondaryDanger"
                  isTextOnlyNoPadding
                  isShortHeight
                  onClick={() => {
                    this.handleDeleteItem(id);
                  }}
                >
                  {deleteItemButtonText}
                </Button>
              </FormActionDelete>
              <Button
                actionType="secondary"
                isShortHeight
                onClick={() => {
                  this.toggleAccordionForItem(id);
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => this._refs[`editForm_${id}`].submit()} isShortHeight isWaiting={isWaiting}>
                Save Changes
              </Button>
            </FormActions>
          </Accordion>
        ))}
        <AddNewItemAction>
          <AddNewItemActionButton onClick={this.handleAddClick} tabIndex={0}>
            <AddNewItemActionIcon>{iconPlus}</AddNewItemActionIcon>
            {addNewItemButtonText}
          </AddNewItemActionButton>
        </AddNewItemAction>
      </Fragment>
    );
  }

  renderEntryForm() {
    const { components: { Button, ItemAddForm }, entryFormSubmitButtonText, isWaiting, itemAddFormProps } = this.props;
    return (
      <Fragment>
        <ItemAddForm
          {...itemAddFormProps}
          ref={(el) => {
            this._addItemForm = el;
          }}
        />
        <FormActions>
          <Button actionType="secondary" onClick={this.handleEntryFormCancel}>
            Cancel
          </Button>
          <Button onClick={() => this._addItemForm.submit()} isWaiting={isWaiting}>
            {entryFormSubmitButtonText}
          </Button>
        </FormActions>
      </Fragment>
    );
  }

  render() {
    const { className } = this.props;
    const { status } = this.state;
    return (
      <div className={className}>
        {status === LIST ? this.renderAddressSelect() : this.renderEntryForm()}
      </div>
    );
  }
}

export default withComponents(AccordionFormList);
