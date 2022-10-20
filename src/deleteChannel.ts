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

    const { data } = await axios(
      `https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/channels/${channelId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    return data;
  } catch (error) {
    if (
      error?.response?.data?.error?.code === 400 &&
      error?.response?.data?.error?.message.indexOf(
        "is the current active version."
      ) >= 0
    ) {
      return { message: `${channelId} was removed.` };
    }
    console.error(error?.response?.data?.error || error.message);
  }
}

export default deleteChannel;
