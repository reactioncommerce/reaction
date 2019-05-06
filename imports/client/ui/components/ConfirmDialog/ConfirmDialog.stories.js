import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import Button from "@material-ui/core/Button";
import ConfirmDialog from "./ConfirmDialog";

// storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf("ConfirmDialog", module)
  // .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
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
    info: {
      text: `
        ### Notes

        ### Usage
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
      `
    }
  });
