import {
  endGroup,
  getInput,
  setFailed,
  setOutput,
  startGroup,
} from "@actions/core";
import { existsSync } from "fs";
import deleteChannel from "./deleteChannel";
import { getReleases, setRelease } from "./release";

// Inputs defined in action.yml
const projectId = getInput("projectId");
const googleApplicationCredentials = getInput("firebaseServiceAccount", {
  required: true,
});
const channelId = getInput("channelId") || "live";
const versionName = getInput("versionName");
const entryPoint = getInput("entryPoint");
const removeChannel = getInput("deleteChannel");

async function run() {
  let finish = (details: Object) => console.log(details);

  try {
    startGroup("Verifying firebase.json exists");

    if (entryPoint !== ".") {
      console.log(`Changing to directory: ${entryPoint}`);
      try {
        process.chdir(entryPoint);
      } catch (err) {
        throw Error(`Error changing to directory ${entryPoint}: ${err}`);
      }
    }

    if (existsSync("./firebase.json")) {
      console.log("firebase.json file found. Continuing deploy.");
    } else {
      throw Error(
        "firebase.json file not found. If your firebase.json file is not in the root of your repo, edit the entryPoint option of this GitHub action."
      );
    }
    endGroup();

    if (!removeChannel) {
      if (!versionName) {
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
            title: `The release list has been successfully retrieved!`,
            summary: {
              currenty_version: versions[0],
              all_versions: versions,
            },
          },
        });
        return;
      }

      startGroup("Start a version rollback ...");

      setRelease({
        gacJson: JSON.parse(googleApplicationCredentials),
        projectId,
        channelId,
        versionName,
      });

      endGroup();

      finish({
        conclusion: "success",
        output: {
          title: `The version ${versionName} as published with success!`,
        },
      });
    } else {
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
  } catch (e) {
    setFailed(e.message);

    finish({
      conclusion: "failure",
      output: {
        title: "Release rollback failed",
        summary: `Error: ${e.message}`,
      },
    });
  }
}

run();
