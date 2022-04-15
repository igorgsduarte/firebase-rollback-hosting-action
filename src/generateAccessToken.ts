import { google } from "googleapis";

export type GacObject = {
  type: string;
  project_id: string;
  project_key_id: string;
  private_key: string;
  client_email: string;
  auth_url: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
};

const SCOPES = [
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/cloud-platform.read-only",
  "https://www.googleapis.com/auth/firebase",
  "https://www.googleapis.com/auth/firebase.readonly",
];

const generateAccessToken = (gacJson: GacObject) =>
  new Promise((resolve, reject) => {
    const jwtClient = new google.auth.JWT(
      gacJson.client_email,
      null,
      gacJson.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });

export default generateAccessToken;
