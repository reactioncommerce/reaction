import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Button from "@material-ui/core/Button";
import ConfirmDialog from "./ConfirmDialog";

const markdown = `
# Confirm Dialog

A component that provides a button guarded by a alert dialog for actions that require user confirmation.

## Usage
~~~js
<ConfirmDialog
  title="Are you sure?"
  message="Are you sure you want to do this?"
  onConfirm={() => { }}
>
  {({ openDialog }) => (
    <Button onClick={openDialog}>{"Show dialog"}</Button>
  )}
</ConfirmDialog>
~~~
`;

storiesOf("ConfirmDialog", module)
  .add("standard dialog", () => (
    <ConfirmDialog
      title="Are you sure?"
      message="Are you sure you want to do this?"
      onConfirm={action("confirmation clicked")}
    >
      {({ openDialog }) => (
        <Button onClick={openDialog}>{"Show dialog"}</Button>
      )}
    </ConfirmDialog>
  ), {
    notes: { markdown }
  });
