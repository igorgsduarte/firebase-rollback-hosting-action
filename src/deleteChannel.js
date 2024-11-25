const { setFailed } = require("@actions/core");
const axios = require("axios");
const generateAccessToken = require("./generateAccessToken");

/**
 * Delete a channel from the specified Firebase project.
 */
async function deleteChannel({ gacJson, projectId, channelId }) {
  try {
    const token = await generateAccessToken(gacJson);

    const url = `https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/channels/${channelId}`;
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.error || error.message;
    setFailed(errorMessage);
    throw new Error(errorMessage);
  }
}

module.exports = deleteChannel;
