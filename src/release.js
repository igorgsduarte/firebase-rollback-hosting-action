const { setFailed } = require("@actions/core");
const axios = require("axios");
const generateAccessToken = require("./generateAccessToken");

let cachedToken = null;
let tokenExpiration = null;

/**
 * Fetch releases for the specified Firebase project and channel.
 */
async function getReleases({ gacJson, projectId, channelId }) {
  try {
    const token = await generateAccessToken(gacJson);
    const url = `https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/channels/${channelId}/releases`;

    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return (data?.releases || []).map((release) => ({
      ...release,
      releaseTime: new Date(release.releaseTime),
    }));
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Set a new release for the specified Firebase project and channel.
 */
async function setRelease({ gacJson, projectId, channelId, versionName }) {
  try {
    const token = await generateAccessToken(gacJson);
    const url = `https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/channels/${channelId}/releases`;

    const { data } = await axios.post(url, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        versionName,
      },
    });

    return data;
  } catch (error) {
    if (isCurrentVersionError(error, versionName)) {
      return { message: `${versionName} is the current active version.` };
    }
    handleApiError(error);
  }
}

/**
 * Determine if the error indicates the version is already active.
 */
function isCurrentVersionError(error, versionName) {
  const errData = error?.response?.data?.error;
  return (
    errData?.code === 400 &&
    errData?.message?.includes(`${versionName} is the current active version.`)
  );
}

/**
 * Handle API errors gracefully.
 */
function handleApiError(error) {
  const message = error?.response?.data?.error || error.message;
  setFailed(message);
  console.error(message);
  throw new Error(message);
}

module.exports = { getReleases, setRelease };
