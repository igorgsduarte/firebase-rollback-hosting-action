# 🌎 Firebase Rollback Hosting Deploy GitHub Action

- List deployed versions
- Ger current active version
- Rollack a specified version

---

## Usage

### Rollback version

```yaml
name: Rollback deploy

on:
  push:
    - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
        - uses: actions/checkout@v3

        # Get current active version
        - uses: igorgottschalg/firebase-rollback-hosting-action@v1
            id: current_version
            with:
            firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
            projectId: your-Firebase-project-ID

        # Deploy a new version
        - uses: FirebaseExtended/action-hosting-deploy@v0
            with:
            repoToken: ${{ secrets.GITHUB_TOKEN }}
            firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
            projectId: your-Firebase-project-ID

        # Rollback to last active version of step id current_version
        - uses: igorgottschalg/firebase-rollback-hosting-action@v1
            with:
            firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
            projectId: your-Firebase-project-ID
            versionName: ${{ steps.current_version.outputs.current_version }}
```

## Options

### `firebaseServiceAccount` _{string}_ (required)

This is a service account JSON key. The easiest way to set it up is to run `firebase init hosting:github`. However, it can also be [created manually](./docs/service-account.md).

It's important to store this token as an
[encrypted secret](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets)
to prevent unintended access to your Firebase project. Set it in the "Secrets" area
of your repository settings and add it as `FIREBASE_SERVICE_ACCOUNT`:
`https://github.com/USERNAME/REPOSITORY/settings/secrets`.

### `projectId` _{string}_

The Firebase project that contains the Hosting site to which you
want to deploy. If left blank, you need to check in a `.firebaserc`
file so that the Firebase CLI knows which Firebase project to use.

### `channelId` _{string}_

The ID of the channel to deploy to. If you leave this blank,
a preview channel and its ID will be auto-generated per branch or PR.
If you set it to **`live`**, the action deploys to the live channel of your default Hosting site.

_You usually want to leave this blank_ so that each PR gets its own preview channel.
An exception might be that you always want to deploy a certain branch to a
long-lived preview channel (for example, you may want to deploy every commit
from your `next` branch to a `preprod` preview channel).

### `versionName` _{string}_

The versionName of the deployed version of site to rollback. If you leave this blank,
the action will return all version and current active version on outputs.

If you specify, will be rollback to version.

### `entryPoint` _{string}_

The directory containing your [`firebase.json`](https://firebase.google.com/docs/cli#the_firebasejson_file)
file relative to the root of your repository. Defaults to `.` (the root of your repo).

## Outputs

Values emitted by this action that can be consumed by other actions later in your workflow

### `releases`

The deployed releases version

### `current_version`

The current active version
