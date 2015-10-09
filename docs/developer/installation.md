# Installation
## Prerequisites
**Prerequisites**
- Npm and [Node.js](https://nodejs.org/)
- _`ImageMagick` - Optional but suggested_
- _For [windows installation](https://github.com/reactioncommerce/reaction/issues/363) you also need:_
  - Win32 OpenSSL
  - Visual Studio 2008 redistributables
  - Git / mysgit

## Install Meteor, Clone Repository

```bash
curl https://install.meteor.com | /bin/sh
git clone https://github.com/reactioncommerce/reaction.git
cd reaction && git checkout master
meteor
```

The `master` branch will ensure your initial installation is a stable release, and also should work with published packages from the [Meteor package manager](https://atmospherejs.com/). However, the most recent code is in `development`, which is the recommended branch if you are a developer.

When mixing branches and versions of published packages (versus local packages), you may get some package compatibility warnings. You can use `meteor --allow-incompatible-update` to resolve this.

See the [package development documentation](https://github.com/reactioncommerce/reaction/blob/master/docs/developer/packages.md) for details on working with the `development` branch, and using local package dependencies. You can clone or create new packages in `reaction/packages` for local package development.

**Start**

To start Reaction, run the `meteor` command:

Browse to [http://localhost:3000](https://localhost:3000) and you should see Reaction running (sample data same as on demo site)

The initial admin user for the site is auto generated, and displayed in your console (or see: env variables section to default these)

_Note: the [velocity](https://velocity.readme.io/ testing frameworks is installed by default, you can view results by clicking the "pulsing velocity circle-dot"_

**Reset**

To reset project data and give you a fresh test dataset from `packages/reaction-core/private/data/*.json`:

```
meteor reset
```

The  _packages/reaction-core/private/data_ folder contains fixture data  files that can be modified to the change initial data loaded.

See the [package development documentation](https://github.com/reactioncommerce/reaction/blob/master/docs/developer/packages.md)  and the [settings and fixture data documentation](https://github.com/reactioncommerce/reaction/blob/master/docs/developer/fixtures.md) for detailed instructions on modifying initial fixture data.

**Updates**

To update, `git pull` from the current branch.

```bash
cd reaction
git pull
meteor reset
meteor
```

You can also use `meteor upgrade` to pull the latest published packages.

_Note: currently there is not any data schema compatibility tests between releases, which is why we use `meteor reset` in this example. It's not necessary if you want to preserve your data, but there could be compatibility issues with the upgrade._

## Settings
Copy the optional `settings/dev.settings.json` to `<your-settings>.json` and run:

```
 meteor --settings settings/<your-settings>.json
```

**_settings/dev.settings.json_**

```
{
  "ROOT_URL": "",
  "MONGO_URL": "",
  "MAIL_URL": "",
  "reaction": {
    "REACTION_USER": "<username>",
    "REACTION_AUTH": "<password>",
    "REACTION_EMAIL": "<login email>"
  },
  "isDebug": "info"
}
```

Reaction also uses private/data/reaction.json for loading additional configuration settings.

See [settings and fixture data documentation](https://github.com/reactioncommerce/reaction/blob/master/docs/developer/deploying.md).

#Troubleshooting

**HTTPS Redirect**

You can use `meteor remove force-ssl` to remove redirection to the `https` protocol.  To restore, `meteor add force-ssl`.  When developing locally, you should not have to remove https as Meteor internally redirects all `localhost` requests to the `http` protocol. However, if you are running on a VM, or using Vagrant, you should run `meteor remove force-ssl` and remove this package.

**Failed to load c++ Json message**

You can ignore this error, but if it annoys you can run `xcode-select --install` (on a mac) or `sudo apt-get install gcc make build-essential` (on ubuntu)

**env: node: No such file or directory**

Caused by a broken node, npm installation. Reinstall Node.js with NPM (or when packaged separately, reinstall them both).

**windows OpenSSL errors prevent startup**

Install OpenSSL per: [https://github.com/meteor/meteor/blob/devel/packages/non-core/npm-node-aes-gcm/README.md](https://github.com/meteor/meteor/blob/devel/packages/non-core/npm-node-aes-gcm/README.md)

**windows bower install errors**

We use bower to install some core dependencies. To use Bower on Windows, you must install msysgit. See: [https://github.com/bower/bower/tree/master#windows-users](https://github.com/bower/bower/tree/master#windows-users)
