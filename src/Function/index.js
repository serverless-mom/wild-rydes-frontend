const AWS = require("aws-sdk");
const fs = require("fs");
const fileName = "verify.html";
//const rookout = require("rookout/lambda");

const s3 = new AWS.S3();

exports.handler = async event => {
  let data = fs.readFileSync(`./${fileName}`, "utf8");
  let params = {
    Body: data,
    Key: `${fileName}`,
    Bucket: process.env.BUCKET_NAME
  };

  console.dir(params);

  try {
    const s3Response = await s3.putObject(params).promise();
    console.log(s3Response);
  } catch (error) {
    console.dir(err);
  } finally {
    return {};
  }
};
