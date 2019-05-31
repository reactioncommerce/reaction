import React from "react";
import { storiesOf } from "@storybook/react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Blocks, registerBlock, loadRegisteredBlocks } from "../../lib/blocks";
import markdown from "../developer/blocks.md";

registerBlock({
  region: "main",
  name: "cardOne",
  component: () => (
    <Card>
      <CardContent>
        <span>Card 1</span>
      </CardContent>
    </Card>
  )
});

registerBlock({
  region: "main",
  name: "cardTwo",
  component: () => (
    <Card>
      <CardContent>
        <span>Card 2</span>
      </CardContent>
    </Card>
  )
});

loadRegisteredBlocks();

storiesOf("Blocks", module)
  .add("basic blocks demo", () => (
    <Blocks region="main" />
  ), {
    notes: { markdown }
  })
  .add("custom wrapper around blocks", () => (
    <Blocks region="main">
      {(blocks) =>
        blocks.map((block, index) => (
          <div style={{ marginBottom: 20 }} key={index}>
            {block}
          </div>
        ))
      }
    </Blocks>
  ), {
    notes: { markdown }
  });
