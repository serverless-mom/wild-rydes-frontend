const AWS = require("aws-sdk");
const fs = require("fs");
const fileName = "verify.html";

const s3 = new AWS.S3();

exports.handler = async event => {
  console.dir(event);
  const ports = JSON.parse(process.env.STACKERY_PORTS);
  let data = fs.readFileSync(`./${fileName}`, "utf8");
  let params = {
    Body: data,
    Key: `${fileName}`,
    Bucket: process.env.BUCKET_NAME
  };

  try {
    await s3.putObject(params);
  } catch (error) {
    console.log(err);
  } finally {
    return {};
  }
};
