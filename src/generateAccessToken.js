const { google } = require("googleapis");

const SCOPES = [
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/cloud-platform.read-only",
  "https://www.googleapis.com/auth/firebase",
  "https://www.googleapis.com/auth/firebase.readonly",
];

function generateAccessToken(gacJson) {
  return new Promise((resolve, reject) => {
    const jwtClient = new google.auth.JWT(
      gacJson.client_email,
      null,
      gacJson.private_key,
      SCOPES,
      null,
    );
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}

module.exports = generateAccessToken;
