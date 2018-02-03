import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class VariantEdit extends Component {
  static propTypes = {
    childVariants: PropTypes.arrayOf(PropTypes.object),
    countries: PropTypes.arrayOf(PropTypes.object),
    editFocus: PropTypes.string,
    handleCreateNewChildVariant: PropTypes.func,
    variant: PropTypes.object
  };

  handleCreateNewChildVariant = () => {
    if (this.props.handleCreateNewChildVariant) {
      this.props.handleCreateNewChildVariant(this.props.variant);
    }
  }

  renderVariant() {
    const { variant } = this.props;

    return (
      <Components.VariantForm
        editFocus={this.props.editFocus}
        countries={this.props.countries}
        variant={variant}
        type={"variant"}
      />
    );
  }

  renderOptionsCard() {
    return (
      <Components.CardGroup>
        <Components.Card
          expandable={false}
          name={"variantOptions"}
        >
          <Components.CardHeader
            i18nKeyTitle="productDetailEdit.variantsOptions"
            title="Variant Options"
          >
            <Components.Button
              icon="plus"
              className="rui btn btn-default btn-clone-variant flat"
              tooltip="Add Option"
              onClick={this.handleCreateNewChildVariant}
            />
          </Components.CardHeader>
        </Components.Card>
        {this.renderChildVariants()}
      </Components.CardGroup>
    );
  }

  renderChildVariants() {
    const { childVariants } = this.props;

    if (Array.isArray(childVariants)) {
      return childVariants.map((childVariant, index) => (
        <Components.VariantForm
          key={index}
          editFocus={this.props.editFocus}
          countries={this.props.countries}
          variant={childVariant}
          type={"option"}
        />
      ));
    }

    return null;
  }

  render() {
    return (
      <div>
        {this.renderVariant()}
        {this.renderOptionsCard()}
      </div>
    );
  }
}

export default VariantEdit;
