import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { applyTheme } from "@reactioncommerce/components/utils";
import { Mutation } from "react-apollo";
import { orderBy, uniqueId } from "lodash";
import ReactDropzone from "react-dropzone";
import styled from "styled-components";
import { Form } from "reacto-form";
import Button from "@reactioncommerce/components/Button/v1";
import Checkbox from "@reactioncommerce/components/Checkbox/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import Grid from "@material-ui/core/Grid";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Card from "@material-ui/core/Card";
import Divider from "@material-ui/core/Divider";
import CardContent from "@material-ui/core/CardContent";
import MUICardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import { i18next } from "/client/api";
import { tagListingQuery, tagProductsQuery } from "../../lib/queries";
import { addTagMutation, updateTagMutation, removeTagMutation } from "../../lib/mutations";
import TagToolbar from "./TagToolbar";
import TagProductTable from "./TagProductTable";

const Title = styled.h3`
  margin-bottom: 16px;
`;

const CardActions = styled(MUICardActions)`
  justify-content: flex-end;
  padding-right: 0 !important;
`;

const PaddedField = styled(Field)`
  margin-bottom: 30px;
`;

const ContentGroup = styled.div`
  margin-bottom: 30px;
`;

const Dropzone = styled(ReactDropzone)`
  background-color: ${applyTheme("MediaUploader.backgroundColor")};
  border: ${applyTheme("MediaUploader.border")};
  min-height: 400px;
`;

// Metafied names

class TagForm extends Component {
  static propTypes = {
    isLoadingShopId: PropTypes.bool,
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
    shopId: PropTypes.string.isRequired,
    tag: PropTypes.object
  }

  static defaultProps = {
    tag: {}
  }

  state = {
    currentTab: 0
  }

  formValue = null;
  productOrderingPriorities = {}
  uploadedFiles = null

  uniqueInstanceIdentifier = uniqueId("URLRedirectEditForm");

  async handleSubmit(data, mutation) {
    const { shopId } = this.props;

    const input = {
      id: data._id,
      name: data.name,
      displayTitle: data.displayTitle,
      isVisible: data.isVisible || false,
      shopId,
      metafields: [
        { key: "keywords", value: data.keywords || "", namespace: "matatag" },
        { key: "description", value: data.description || "", namespace: "matatag" },
        { key: "og:title", value: data["og:title"] || "", namespace: "matatag" },
        { key: "og:description", value: data["og:description"] || "", namespace: "matatag" },
        { key: "og:url", value: data["og:url"] || "", namespace: "matatag" },
        { key: "og:image", value: data["og:image"] || "", namespace: "matatag" },
        { key: "og:locale", value: data["og:locale"] || "", namespace: "matatag" },
        { key: "fb:app_id", value: data["fb:app_id"] || "", namespace: "matatag" }
      ]
    };

    if (Object.keys(this.productOrderingPriorities).length) {
      const featured = [];
      Object.keys(this.productOrderingPriorities).forEach((productId) => {
        const priority = this.productOrderingPriorities[productId];

        if (isNaN(parseInt(priority, 10)) === false) {
          featured.push({ productId, priority });
        }
      });

      input.featuredProductIds = orderBy(featured, ["priority"]).map(({ productId }) => productId);
    } else {
      input.featuredProductIds = null;
    }

    const result = await mutation({
      refetchQueries: [{
        query: tagListingQuery,
        variables: {
          shopId
        }
      }, {
        query: tagProductsQuery,
        variables: {
          shopId,
          tagId: data._id
        }
      }],
      variables: {
        input
      }
    });

    return result;
  }

  handleRemove(id, mutation) {
    Alerts.alert({
      title: i18next.t("admin.routing.form.deleteConfirm"),
      type: "warning",
      showCancelButton: true
    }, async (isConfirm) => {
      if (isConfirm) {
        const { shopId } = this.props;

        await mutation({
          variables: {
            input: {
              id,
              shopId
            }
          }
        });
      }
    });
  }

  handleProductPriorityChange = (productId, priority) => {
    this.productOrderingPriorities[productId] = priority;
  }

  reset() {
    this.formValue = null;
  }

  handleCancel = () => {
    this.props.onCancel();
  }

  handleSubmitForm = () => {
    this.form.submit();
  }

  handleFormChange = (value) => {
    this.formValue = value;
  }

  handleTabChange = (event, value) => {
    this.setState({ currentTab: value });
  };

  handleDrop = (files) => {
    if (files.length === 0) return;
    this.uploadedFiles = files;
  };

  renderMediaGalleryUploader() {
    const { tag } = this.props;

    return (
      <Dropzone
        onDrop={this.handleDrop}
        ref={(inst) => { this.dropzone = inst; }}
        accept="image/jpg, image/png, image/jpeg"
      >
        {tag && tag.heroMediaUrl && <img src={tag.heroMediaUrl} width="100%" alt="" />}
      </Dropzone>
    );
  }

  get tagData() {
    const { tag } = this.props;

    if (tag) {
      let metafields = {};

      if (Array.isArray(tag.metafields)) {
        tag.metafields.forEach((field) => {
          metafields[field.key] = field.value;
        });
      }

      return {
        ...tag,
        ...metafields
      };
    }

    return {};
  }

  render() {
    const tag = this.tagData;
    const { shopId } = this.props;
    const { currentTab } = this.state;
    const nameInputId = `name_${this.uniqueInstanceIdentifier}`;
    const slugInputId = `slug_${this.uniqueInstanceIdentifier}`;
    const displayTitleInputId = `displayTitle_${this.uniqueInstanceIdentifier}`;
    const keywordsInputId = `keywords_${this.uniqueInstanceIdentifier}`;
    const descriptionInputId = `description_${this.uniqueInstanceIdentifier}`;
    const ogTitleInputId = `ogTitle_${this.uniqueInstanceIdentifier}`;
    const ogDescriptionInputId = `ogDescription${this.uniqueInstanceIdentifier}`;
    const ogUrlInputId = `ogUrl_${this.uniqueInstanceIdentifier}`;
    const ogImageUrlInputId = `ogImageUrl_${this.uniqueInstanceIdentifier}`;
    const fbAppIdInputId = `fbAppId_${this.uniqueInstanceIdentifier}`;
    const ogLocaleInputId = `ogLocale_${this.uniqueInstanceIdentifier}`;
    const isVisibleInputId = `isVisible_${this.uniqueInstanceIdentifier}`;

    let title = i18next.t("admin.tags.form.formTitleNew");
    let mutation = addTagMutation;

    if (tag._id) {
      title = i18next.t("admin.tags.form.formTitleUpdate");
      mutation = updateTagMutation;
    }

    return (
      <Mutation mutation={mutation}>
        {(mutationFunc) => (
          <Fragment>
            <Mutation mutation={removeTagMutation}>
              {(removeMutationFunc) => (
                <TagToolbar
                  onDelete={() => { this.handleRemove(tag._id, removeMutationFunc); }}
                  onCancel={this.handleCancel}
                  onSave={this.handleSave}
                />
              )}
            </Mutation>
            <Title>{title}</Title>
            <Form
              ref={(formRef) => { this.form = formRef; }}
              onChange={this.handleFormChange}
              onSubmit={(data) => this.handleSubmit(data, mutationFunc)}
              value={tag}
            >
              <ContentGroup>
                <PaddedField
                  helpText={i18next.t("admin.tags.form.nameHelpText")}
                  name="name"
                  label={i18next.t("admin.tags.form.name")}
                  labelFor={nameInputId}
                  isRequired
                >
                  <TextInput id={nameInputId} name="name" placeholder="i.e. womens-shoes" />
                  <ErrorsBlock names={["name"]} />
                </PaddedField>
              </ContentGroup>

              <ContentGroup>
                <Tabs value={currentTab} onChange={this.handleTabChange}>
                  <Tab label={i18next.t("admin.tags.form.tagListingPage")} />
                  <Tab label={i18next.t("admin.tags.form.metadata")} />
                  <Tab label={i18next.t("admin.tags.form.productOrdering")} />
                </Tabs>
                <Divider />
              </ContentGroup>

              <Card>
                <CardContent>
                  {currentTab === 0 &&
                    <Grid container spacing={24}>
                      <Grid item md={6}>
                        <PaddedField
                          helpText={i18next.t("admin.tags.form.displayTitleHelpText")}
                          name="displayTitle"
                          label={i18next.t("admin.tags.form.displayTitle")}
                          labelFor={displayTitleInputId}
                          isRequired
                        >
                          <TextInput id={displayTitleInputId} name="displayTitle" placeholder={i18next.t("admin.tags.form.displayTitlePlaceholder")} />
                          <ErrorsBlock names={["displayTitle"]} />
                        </PaddedField>

                        <PaddedField
                          helpText={i18next.t("admin.tags.form.slugHelpText")}
                          name="slug"
                          label={i18next.t("admin.tags.form.slug")}
                          labelFor={slugInputId}
                        >
                          <TextInput id={slugInputId} isReadOnly name="slug" placeholder={i18next.t("admin.tags.form.slugPlaceholder")} />
                          <ErrorsBlock names={["slug"]} />
                        </PaddedField>

                        <PaddedField
                          name="isVisible"
                          labelFor={isVisibleInputId}
                        >
                          <Checkbox
                            id={isVisibleInputId}
                            name="isVisible"
                            label={i18next.t("admin.tags.form.isVisible")}
                          />
                        </PaddedField>
                      </Grid>
                      <Grid item md={6}>
                        <Typography variant="h6">{i18next.t("admin.tags.form.tagListingHero")}</Typography>
                        <Typography>{i18next.t("admin.tags.form.tagListingHeroHelpText")}</Typography>
                        {this.renderMediaGalleryUploader()}
                      </Grid>
                    </Grid>
                  }

                  {currentTab === 1 &&
                    <Grid container spacing={24}>
                      <Grid item md={6}>
                        <Typography variant="h6">{i18next.t("admin.tags.form.keywords")}</Typography>
                        <PaddedField
                          name="keywords"
                          label={i18next.t("admin.tags.form.keywords")}
                          labelFor={keywordsInputId}
                          isRequired
                        >
                          <TextInput id={keywordsInputId} name="keywords" placeholder={i18next.t("admin.tags.form.keywordsPlaceholder")} />
                          <ErrorsBlock names={["keywords"]} />
                        </PaddedField>

                        <PaddedField
                          name="description"
                          label={i18next.t("admin.tags.form.description")}
                          labelFor={descriptionInputId}
                        >
                          <TextInput id={descriptionInputId} name="description" placeholder={i18next.t("admin.tags.form.descriptionPlaceholder")} />
                          <ErrorsBlock names={["description"]} />
                        </PaddedField>
                      </Grid>
                      <Grid item md={6}>
                        <Typography variant="h6">{i18next.t("admin.tags.form.openGraph")}</Typography>
                        <PaddedField
                          name="og:title"
                          label={i18next.t("admin.tags.form.ogTitle")}
                          labelFor={ogTitleInputId}
                        >
                          <TextInput id={ogTitleInputId} name="og:title" placeholder={i18next.t("admin.tags.form.ogTitlePlaceholder")} />
                          <ErrorsBlock names={["og:title"]} />
                        </PaddedField>

                        <PaddedField
                          name="og:description"
                          label={i18next.t("admin.tags.form.ogDescription")}
                          labelFor={ogDescriptionInputId}
                        >
                          <TextInput id={ogDescriptionInputId} name="og:description" placeholder={i18next.t("admin.tags.form.ogDescriptionPlaceholder")} />
                          <ErrorsBlock names={["og:description"]} />
                        </PaddedField>

                        <PaddedField
                          name="og:url"
                          label={i18next.t("admin.tags.form.ogUrl")}
                          labelFor={ogDescriptionInputId}
                        >
                          <TextInput id={ogUrlInputId} name="og:url" placeholder={i18next.t("admin.tags.form.ogUrlPlaceholder")} />
                          <ErrorsBlock names={["og:url"]} />
                        </PaddedField>

                        <PaddedField
                          name="og:image"
                          label={i18next.t("admin.tags.form.ogImageUrl")}
                          labelFor={ogImageUrlInputId}
                        >
                          <TextInput id={ogImageUrlInputId} name="og:image" placeholder={i18next.t("admin.tags.form.ogImageUrlPlaceholder")} />
                          <ErrorsBlock names={["og:image"]} />
                        </PaddedField>

                        <PaddedField
                          name="og:locale"
                          label={i18next.t("admin.tags.form.ogLocale")}
                          labelFor={ogLocaleInputId}
                        >
                          <TextInput id={ogLocaleInputId} name="og:locale" placeholder={i18next.t("admin.tags.form.ogLocalePlaceholder")} />
                          <ErrorsBlock names={["og:locale"]} />
                        </PaddedField>

                        <PaddedField
                          name="fb:app_id"
                          label={i18next.t("admin.tags.form.fbAppId")}
                          labelFor={fbAppIdInputId}
                        >
                          <TextInput id={fbAppIdInputId} name="fb:app_id" placeholder={i18next.t("admin.tags.form.fbAppIdPlaceholder")} />
                          <ErrorsBlock names={["fb:app_id"]} />
                        </PaddedField>
                      </Grid>
                    </Grid>
                  }

                  {currentTab === 2 &&
                    <TagProductTable
                      onProductPriorityChange={this.handleProductPriorityChange}
                      shopId={shopId}
                      tagId={tag._id}
                    />
                  }

                  <CardActions disableActionSpacing>
                    <Button actionType="secondary" onClick={this.handleSubmitForm}>
                      {i18next.t("admin.tags.form.save")}
                    </Button>
                  </CardActions>
                </CardContent>
              </Card>
            </Form>
          </Fragment>
        )}
      </Mutation>
    );
  }
}

export default TagForm;
