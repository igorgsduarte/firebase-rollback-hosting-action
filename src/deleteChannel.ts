import { setFailed } from "@actions/core";
import axios from "axios";
import generateAccessToken, { GacObject } from "./generateAccessToken";
type GetReleaseProps = {
  gacJson: GacObject;
  projectId: string;
  channelId?: string;
};

const getToken = async (gacJson: GacObject) => {
  const token = await generateAccessToken(gacJson);

  if (!token) {
    setFailed("Invalid credentials!");
    throw "Invalid credentials!";
  }

  return token;
};

async function deleteChannel({
  gacJson,
  projectId,
  channelId,
}: GetReleaseProps) {
  try {
    const token = await getToken(gacJson);

    return await axios(
      `https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/channels/${channelId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
  } catch (error) {
    return error?.response?.data?.error || error.message;
  }
}

export default deleteChannel;
