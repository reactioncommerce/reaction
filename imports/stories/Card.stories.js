import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Button from "@material-ui/core/Button";

import i18next from "i18next";

const options = {
  lng: "en",
  debug: true,
  resources: {
    en: {
      translation: {
        title: "hello world",
        button: "Action Button"
      }
    }
  }
};

(async () => {
  await i18next.init(options);

  storiesOf("Card", module)
    // .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
    .add("standard form card", () => (
      <Card>
        <CardHeader title={i18next.t("title")} />
        <CardContent>
          {/* ksdfksdhfkjshf */}
        </CardContent>
        <CardActions>
          <Button variant="outlined">{i18next.t("button")}</Button>
        </CardActions>
      </Card>
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
})();

