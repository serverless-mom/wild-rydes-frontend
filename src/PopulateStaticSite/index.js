var AWS = require("aws-sdk");
var path = require("path");
var fs = require("fs");
const cfnCR = require("cfn-custom-resource");

const s3 = new AWS.S3();

exports.handler = async event => {
  function uploadArtifactsToS3() {
    const artifactFolder = `logs/test/test-results`;
    const testResultsPath = "./wild-rydes/static";
    console.dir(artifactFolder);

    const walkSync = (currentDirPath, callback) => {
      fs.readdirSync(currentDirPath).forEach(name => {
        const filePath = path.join(currentDirPath, name);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          callback(filePath, stat);
        } else if (stat.isDirectory()) {
          walkSync(filePath, callback);
        }
      });
    };

    walkSync(testResultsPath, async filePath => {
      let bucketPath = filePath.substring(testResultsPath.length - 1);
      let params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${artifactFolder}/${bucketPath}`,
        Body: fs.readFileSync(filePath)
      };
      try {
        await s3.putObject(params).promise();
        console.log(`Successfully uploaded ${bucketPath} to s3 bucket`);
      } catch (error) {
        console.error(`error in uploading ${bucketPath} to s3 bucket`);
        throw new Error(`error in uploading ${bucketPath} to s3 bucket`);
      }
    });
  }

  try {
    await uploadArtifactsToS3();
  } catch (error) {
    console.log(err);
  } finally {
    return {};
  }
};
