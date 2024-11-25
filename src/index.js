const {
  endGroup,
  getInput,
  setFailed,
  setOutput,
  startGroup,
} = require("@actions/core");
const { existsSync } = require("fs");
const deleteChannel = require("./deleteChannel");
const { getReleases, setRelease } = require("./release");

// Inputs defined in action.yml
const projectId = getInput("projectId");
const googleApplicationCredentials = getInput("firebaseServiceAccount", {
  required: true,
});
const channelId = getInput("channelId") || "live";
const versionName = getInput("versionName");
const entryPoint = getInput("entryPoint");
const removeChannel = getInput("deleteChannel");

/**
 * Main function to run the deployment process.
 */
async function run() {
  const finish = function (details) {
    console.log(details);
  };

  try {
    verifyFirebaseJson();

    if (!removeChannel) {
      if (!versionName) {
        await handleGetReleases(finish);
      } else {
        await handleVersionRollback(finish);
      }
    } else {
      await handleChannelRemoval(finish);
    }
  } catch (error) {
    handleFailure(finish, error);
  }
}

/**
 * Verify that the firebase.json file exists.
 */
function verifyFirebaseJson() {
  startGroup("Verifying firebase.json exists");

  if (entryPoint !== ".") {
    console.log(`Changing to directory: ${entryPoint}`);
    try {
      process.chdir(entryPoint);
    } catch (err) {
      throw new Error(`Error changing to directory ${entryPoint}: ${err}`);
    }
  }

  if (existsSync("./firebase.json")) {
    console.log("firebase.json file found. Continuing deploy.");
  } else {
    throw new Error(
      "firebase.json file not found. If your firebase.json file is not in the root of your repo, edit the entryPoint option of this GitHub action.",
    );
  }

  endGroup();
}

/**
 * Handle the process of getting the latest hosting releases.
 */
async function handleGetReleases(finish) {
  startGroup("Get last hosting releases");

  const releases = await getReleases({
    gacJson: JSON.parse(googleApplicationCredentials),
    projectId,
    channelId,
  });

  const versions = releases.map((release) => release.version.name);

  setOutput("releases", versions);
  setOutput("current_version", versions[0] || null);
  endGroup();

  finish({
    conclusion: "success",
    output: {
      title: "The release list has been successfully retrieved!",
      summary: {
        current_version: versions[0],
        all_versions: versions,
      },
    },
  });
}

/**
 * Handle the rollback to a specific version.
 */
async function handleVersionRollback(finish) {
  startGroup("Start a version rollback ...");

  await setRelease({
    gacJson: JSON.parse(googleApplicationCredentials),
    projectId,
    channelId,
    versionName,
  });

  endGroup();

  finish({
    conclusion: "success",
    output: {
      title: `The version ${versionName} was published successfully!`,
    },
  });
}

/**
 * Handle the removal of a channel.
 */
async function handleChannelRemoval(finish) {
  startGroup("Start remove channel");

  await deleteChannel({
    gacJson: JSON.parse(googleApplicationCredentials),
    projectId,
    channelId: removeChannel,
  });

  endGroup();

  finish({
    conclusion: "success",
    output: {
      title: `The channel ${removeChannel} was removed!`,
    },
  });
}

/**
 * Handle failures by logging and setting failure states.
 */
function handleFailure(finish, error) {
  setFailed(error.message);

  finish({
    conclusion: "failure",
    output: {
      title: "Failed",
      summary: `Error: ${error.message}`,
    },
  });
}

run();
