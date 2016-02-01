// TODO: Placeholder imports
// import React from "react"
// import TextField from "reaction-ui/textfield"
// TODO: For now lets pretend we have to do imports
const Item = ReactionUI.Components.Item;
const Items = ReactionUI.Components.Items;
const Media = ReactionUI.Components.Media;
const Metadata = ReactionUI.Components.Metadata;
const Tags = ReactionUI.Components.Tags;
const TextField = ReactionUI.Components.TextField;
const Seperator = ReactionUI.Components.Seperator;
const VariantSelector = ReactionProductSimple.Components.VariantSelector;

ProductDetail = React.createClass({
  displayName: "Product Detail - Simple",

  mixins: [ReactMeteorData],

  getMeteorData() {
    let data = {};
    const handle = Meteor.subscribe("Product", ReactionRouter.getParam("_id");

    data = {
      isLoadingProduct: handle.ready(),
      product: selectedProduct(),
      tags: ReactionSimpleProduct.tags(),
      media: ReactionCore.Media.getProductMedia(),
      variants: ReactionSimpleProduct.variants,
      childVariants: ReactionSimpleProduct.childVariants,
      editable: ReactionCore.hasPermission("createProduct")
    };

    return data;
  },

  handleFieldUpdate(event) {
    ReactionSimpleProduct.updateProduct(
      this.data.product._id,
      event.target.name,
      event.target.value
    );
  },

  onTagUpdate(value) {

  },

  handleTagSort(newTagOrder) {
    Meteor.call("products/updateProductField",
      selectedProductId(), "hashtags", _.uniq(newTagOrder));
  },

  handleTagCreate(value) {
    console.log("create tag, maybe?", value);
    ReactionSimpleProduct.createTag(this.data.product._id, value);
  },

  handleTagRemove(tagId) {
    ReactionSimpleProduct.removeTag(this.data.product._id, tagId);
    console.log("remove a tag", tagId);
  },


  handleTagUpdate(tagId) {
    // ReactionSimpleProduct.removeTag(this.data.product._id, value);
    console.log("remove a tag", tagId);
  },

  handleTagBookmark(tagId) {
    // ReactionSimpleProduct.removeTag(this.data.product._id, value);
    console.log("remove a tag", tagId);
  },


  renderMediaGallery() {

    if (this.data.media.length) {
      return this.data.media.map((image, index) => {
        return <ProductMedia key={index} type="product" media={image}></ProductMedia>;
      });
    }

    return <Media type="product"></Media>;
  },





  renderTags() {
    if (this.data.tags) {
      console.log("1st tag", this.data.tags[0]._id);
      return (
        <div className="rui group">
          <h3>Tags</h3>
          <Tags
            tags={this.data.tags}
            editable={this.data.editable}
            refocusAfterCreate={true}
            onTagBookmark={this.handleTagBookmark}
            onTagCreate={this.handleTagCreate}
            onTagRemove={this.handleTagRemove}
            onTagUpdate={this.handleTagUpdate}
            onTagSort={this.handleTagSort}
          />
        </div>
      );
    }
  },

  renderDetails() {
    if (this.data.product.metafields) {
      return (
        <div className="rui details">
          <h3>Details</h3>
          <Metadata
            editable={this.data.editable}
            metafields={this.data.product.metafields}
          />
        </div>
      );
    }
  },


  render() {
    const product = this.data.product || {};

    return (
      <div className="rui productDetail" itemScope={true} itemType="http://schema.org/Product">
        <Items>
          <Item size="full">
            <div className="header">
              <Items autoWrap={true} static={true}>
                <h1 id="title">
                  <TextField
                    align="center"
                    name="title"
                    onBlur={this.handleFieldUpdate}
                    value={product.title}
                  />
                </h1>
                <div className="pageTitle" itemProp="name">
                  <TextField
                    align="center"
                    name="pageTitle"
                    onValueChange={this.handleFieldUpdate}
                    value={product.pageTitle}
                  />
                </div>
              </Items>
            </div>
          </Item>

          <Item size="half">
            <Items autoWrap={true} static={true}>
              {this.renderMediaGallery()}
              {this.renderTags()}
              {this.renderDetails()}
            </Items>
          </Item>

          <Item size="half">
            <Items autoWrap={true} static={true}>
              <TextField name="pageTitle" value={product.vendor} />
              <TextField multiline={true} name="description" value={product.description} />
              <Seperator label="options"/>
              <VariantSelector editable={this.props.editable} variants={this.data.variants} />
              <Seperator label="more options"/>
              <VariantSelector variants={this.data.childVariants} />
            </Items>
          </Item>
        </Items>
      </div>
    );
  }
});

/*
<Items>
  <Item size="full">
    <div className="header">
      <Items autoWrap={true} static={true}>
        <h1 id="title">
          <TextField
            align="center"
            name="title"
            onBlur={this.handleFieldUpdate}
            value={product.title}
          />
        </h1>
        <div className="pageTitle" itemProp="name">
          <TextField
            align="center"
            name="pageTitle"
            onValueChange={this.handleFieldUpdate}
            value={product.pageTitle}
          />
        </div>
      </Items>
    </div>
  </Item>

  <Item size="half">
    <Items autoWrap={true} static={true}>
      {this.renderMediaGallery()}
      {this.renderTags()}
      {this.renderDetails()}
    </Items>
  </Item>

  <Item size="half">
    <Items autoWrap={true} static={true}>
      <TextField name="pageTitle" value={product.vendor} />
      <TextField multiline={true} name="description" value={product.description} />
      <Seperator label="options"/>
      <VariantSelector editable={this.props.editable} variants={this.data.variants} />
      <Seperator label="more options"/>
      <VariantSelector variants={this.data.childVariants} />
    </Items>
  </Item>
</Items>

 */
