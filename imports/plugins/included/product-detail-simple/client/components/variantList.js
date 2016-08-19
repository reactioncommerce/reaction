import React, { Component, PropTypes} from "react"

class VariantList extends Component {

  renderVariants() {
    return this.props.variants && this.props.variants.map((variant, index) => {
      return (
        <li className="variant-list-item" id="variant-list-item-{variant._id}" key={variant._id}>
          <div className="variant-detail {{selectedVariant}}">
            <div className="title">
              <span className="variant-title">{variant.title}</span>
            </div>

            <div className="actions">
              <span className="variant-price">price</span>
            </div>
          </div>
        </li>

      )
    });
    /*
    {{#each variants}}
      {{> variant}}
    {{else}}
      <a href="#" id="create-variant">+ <span data-i18n="variantList.createVariant">Create Variant</span></a>
    {{/each}}
    </ul>
  </div>
     */
  }

  render() {
    return (
      <div className="product-variants">
        <ul className="variant-list list-unstyled" id="variant-list">
          {this.renderVariants()}
        </ul>
      </div>
    );
  }
}

export default VariantList;
