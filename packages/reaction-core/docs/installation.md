#Installation

**Prerequisites**

- Install npm and [node.js](http://nodejs.org/)
- Install Meteor
- Clone the `reactioncommerce/reaction` repo
- *Optional, suggested: install `graphicsmagick`*

**Installation**

```bash
curl https://install.meteor.com | /bin/sh
git clone https://github.com/reactioncommerce/reaction.git
cd reaction && git checkout master
meteor
```

The `master` branch will ensure your initial installation is a stable release, and also should work with published packages from the [Meteor package manager](https://atmospherejs.com/).

See the [package development documentation](https://github.com/reactioncommerce/reaction-core/blob/master/docs/packages.md) for details on working with the `development` branch, and using local package dependencies.

**Start**

To start Reaction, run the `meteor` command:

Browse to [http://localhost:3000](http://localhost:3000) and you should see Reaction running (sample data same as on demo site)

The initial admin user for the site is auto generated, and displayed in your console (or see: env variables section to default these)

**Reset**

To reset project data and give you a fresh test dataset from `packages/reaction-core/private/data/*.json`:

    meteor reset

The  *packages/reaction-core/private/data* folder contains fixture data  files that can be modified to the change initial data loaded.

See the [package development documentation](https://github.com/reactioncommerce/reaction-core/blob/master/docs/packages.md)  and the [settings and fixture data documentation](https://github.com/reactioncommerce/reaction-core/blob/master/docs/deploying.md) for detailed instructions on modifying initial fixture data.

**Updates**

To update, `git pull` from the current branch.

```bash
cd reaction
git pull
meteor reset
meteor
```

You can also use `meteor upgrade` to pull the latest published packages.

*Note: currently there is not any data schema compatibility tests between releases, which is why we use `meteor reset` in this example. It's not necessary if you want to preserve your data, but there could be compatibility issues with the upgrade.*

##Settings

Copy the optional `settings/dev.sample.json` to `<your-settings>.json` and run `meteor --settings settings/<your-settings>.json`.

***settings/dev.sample.json***
```json
{
  "ROOT_URL": "",
  "MONGO_URL": "",
  "MAIL_URL": "",
  "reaction": {
    "METEOR_USER": "<username>",
    "METEOR_AUTH": "<password>",
    "METEOR_EMAIL": "<login email>"
  },
  "isDebug": "info"
}
```

See [settings and fixture data documentation](https://github.com/reactioncommerce/reaction-core/blob/master/docs/deploying.md).

#Troubleshooting

**HTTPS Redirect**

You can use `meteor remove force-ssl` to remove redirection to the `https` protocol.  To restore, `meteor add force-ssl`.  When developing locally, you should not have to remove https as Meteor internally redirects all `localhost` requests to the `http` protocol. However, if you are running on a VM, or using Vagrant, you should run `meteor remove force-ssl` and remove this package.

**Failed to load c++ Json message**

You can ignore this error, but if it annoys you can run
`xcode-select --install` (on a mac) or
`sudo apt-get install gcc make build-essential` (on ubuntu)

**env: node: No such file or directory**

Caused by a broken node, npm installation.
Reinstall Node.js with NPM (or when packaged seperately, reinstall them both).

