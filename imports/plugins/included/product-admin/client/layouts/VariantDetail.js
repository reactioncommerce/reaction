import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Blocks, Components } from "@reactioncommerce/reaction-components";
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";

const styles = (theme) => ({
  block: {
    marginBottom: theme.spacing(3)
  }
});

/**
 * VariantDetail layout component
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function VariantDetail(props) {
  const { classes, ...blockProps } = props;

  return (
    <Fragment>
      <Components.ProductPublish />
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <Blocks region="VariantDetailHeader" blockProps={blockProps} />
        </Grid>
        <Grid item sm={4}>
          <Blocks region="VariantDetailSidebar" blockProps={blockProps} />
        </Grid>
        <Grid item sm={8}>
          <Blocks region="VariantDetailMain" blockProps={blockProps}>
            {(blocks) =>
              blocks.map((block, index) => (
                <div className={classes.block} key={index}>
                  {block}
                </div>
              ))
            }
          </Blocks>
        </Grid>
      </Grid>
    </Fragment>
  );
}

VariantDetail.propTypes = {
  classes: PropTypes.object
};

export default withStyles(styles, { name: "RuiVariantDetail" })(VariantDetail);
