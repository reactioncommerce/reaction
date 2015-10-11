# Fixtures
Multiple ways to load fixture data and configurations.

## Meteor settings
A Meteor settings file can be used with the `meteor --settings` option.

Copy [settings/dev.settings.json](https://github.com/reactioncommerce/reaction/blob/master/settings/dev.settings.json) and create a new `settings.json` file, for example:

```json
{
  "ROOT_URL": "",
  "MONGO_URL": "",
  "MAIL_URL": "",
  "reaction": {
    "REACTION_USER": "",
    "REACTION_AUTH": "",
    "REACTION_EMAIL": ""
  },
  "isDebug": "info",
  "public": {
    "velocity:html-reporter": {
      "position": "bottom right",
      "tab-index" : 1
    }
  }
}
```

After you've created the `settings` file, add `--settings settings/settings.json` to the `meteor` startup command.

```
meteor --settings settings/settings.json --raw-logs
```

### Environment variables
You can also use environment variables for settings, useful for headless and automated vm configuration.

```bash
export ROOT_URL=""
export MONGO_URL="<your mongodb connect string>"
export MAIL_URL="<smtp connection string>"

export REACTION_USER="<username>"
export REACTION_AUTH="<password>"
export REACTION_EMAIL="<login email>"
```

The `REACTION_EMAIL`, `REACTION_USER`, `REACTION_AUTH` environment variables will configure the default administrator account.

_Note: Environment variables will override variables set in settings.json_

**ROOT_URL**

_Export `ROOT_URL` and `packages/reaction-core/fixtures.coffee` will update the domain in the `shops` collection to match the domain from `ROOT_URL`._ This lets you use alternate domains, or enforce SSL on a fresh installation.  An empty ROOT_URL will just default to _localhost_.

**MAIL_URL** To send email you should configure the administrative SMTP email server. [env MAIL_URL variable](https://docs.meteor.com/#email_send)

_Note: This is not required, but password reset, and a few other items that use email templates won't work unless you configure this._

**isDebug** Sets debugging levels. Accepts `true`,`false` or logging level.

See: [conventions#logging](https://github.com/reactioncommerce/reaction/blob/development/docs/developer/conventions.md#logging).

**These are the only `reaction specific` variables used from settings.json.**

## Fixture Data
The `reaction-core` package installs sample data, translations, and other fixture defaults from `packages/reaction-core/private/data/`.

The `Fixtures.loadData` server method is available in any package for inserting collection fixture data:

_server/fixtures.coffee_

```
Meteor.startup ->
  jsonFile =  Assets.getText("private/data/Shipping.json")
  Fixtures.loadData ReactionCore.Collections.Shipping, jsonFile
```

Each installed package ('Reaction App') can also provide fixture data.

See [the packages development documentation](https://github.com/reactioncommerce/reaction/blob/master/docs/developer/packages.md) for more details on using `Packages` fixture data with the `ReactionCore.registerPackage` method.

**Reaction package settings**

The `Fixtures.loadSettings` method makes it easy to update Reaction package settings on startup. To use, create the app file: `private/settings/reaction.json` with package settings.

Example _private/settings/reaction.json_

```json
[
    {
        "name": "reaction-paypal",
        "settings": {
            "mode": false,
            "client_id": "<client_id>",
            "client_secret": "<client_secret"
        }
    }
]
```

Note: _Where `name` is Reaction package name, the `settings` object will update the `Packages` collection on every restart/reload._
