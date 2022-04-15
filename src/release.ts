import { setFailed } from "@actions/core";
import axios from "axios";
import generateAccessToken, { GacObject } from "./generateAccessToken";
type GetReleaseProps = {
  gacJson: GacObject;
  projectId: string;
  channelId?: string;
};

type SetReleaseProps = GetReleaseProps & {
  versionName: string;
};

const getToken = async (gacJson: GacObject) => {
  const token = await generateAccessToken(gacJson);

  if (!token) {
    setFailed("Invalid credentials!");
    throw "Invalid credentials!";
  }

  return token;
};
export const getReleases = async ({
  gacJson,
  projectId,
  channelId,
}: GetReleaseProps) => {
  try {
    const token = await getToken(gacJson);

    const { data } = await axios(
      `https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/channels/${channelId}/releases`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    return (
      data?.releases?.map((release) => {
        release.releaseTime = new Date(release.releaseTime);
        return release;
      }) || []
    );
  } catch (error) {
    setFailed(error?.response?.data || error.message);
  }
};

export async function setRelease({
  gacJson,
  projectId,
  channelId,
  versionName,
}: SetReleaseProps) {
  try {
    const token = await getToken(gacJson);

    const { data } = await axios(
      `https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/channels/${channelId}/releases`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        params: {
          versionName,
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
      return { message: `${versionName} is the current active version.` };
    }
    console.error(error?.response?.data?.error || error.message);
  }
}
