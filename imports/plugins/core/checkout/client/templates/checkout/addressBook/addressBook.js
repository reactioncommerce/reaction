import { Template } from "meteor/templating";
import { Components } from "@reactioncommerce/reaction-components";

Template.checkoutAddressBook.helpers({
  /**
   * @method AddressBook
   * @summary returns a component for updating a user's address.
   * @since 2.0.0
   * @return {Object} - contains the component for updating a user's address.
   * @ignore
   */
  AddressBook() {
    const { status, position } = Template.currentData();
    return {
      component: Components.AddressBook,
      heading: {
        defaultValue: "Choose shipping & billing address",
        i18nKey: "addressBookGrid.chooseAddress",
        checkout: {
          icon: (status === true || status === this.template) ? "active" : "",
          position
        }
      }
    };
  }
});
