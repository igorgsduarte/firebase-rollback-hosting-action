import { getReleases, setRelease } from "./release";
import { config } from "dotenv";

config();

describe("rollback last deploy", () => {
  const gacJson = JSON.parse(process.env.GAC || null);
  const projectId = process.env.PROJECT_ID || null;
  const channelId = process.env.CHANNEL_ID || null;
  const versionName = process.env.VERSION_NAME || null;

  it.concurrent("Check env", () => {
    expect(gacJson).not.toBeNull();
    expect(projectId).not.toBeNull();
    expect(channelId).not.toBeNull();
    expect(versionName).not.toBeNull();
  });

  it.concurrent("list versions", async () => {
    const releases = await getReleases({
      gacJson,
      projectId,
      channelId,
    });

    expect(Array.isArray(releases)).toBe(true);
  });

  it.concurrent("set a reselase", async () => {
    const rollback = await setRelease({
      gacJson,
      projectId,
      channelId,
      versionName,
    });

    expect(typeof rollback).toBe("object");
  });
});
