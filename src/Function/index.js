const AWS = require("aws-sdk");
const fs = require("fs");
const fileName = "verify.html";
const folderPath = "./static";
const bucketName = process.env.BUCKET_NAME;

const s3 = new AWS.S3();

exports.handler = async event => {
  console.dir(event);
  console.dir(bucketName);
  const uploadDir = function(s3Path, bucketName) {
    let s3 = new AWS.S3();

    function walkSync(currentDirPath, callback) {
      fs.readdirSync(currentDirPath).forEach(function(name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
          callback(filePath, stat);
        } else if (stat.isDirectory()) {
          walkSync(filePath, callback);
        }
      });
    }

    walkSync(s3Path, function(filePath, stat) {
      let bucketPath = filePath.substring(s3Path.length + 1);
      let params = {
        Bucket: bucketName,
        Key: bucketPath,
        Body: fs.readFileSync(filePath)
      };
      console.dir(params);
      s3.putObject(params, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(
            "Successfully uploaded " + bucketPath + " to " + bucketName
          );
        }
      });
    });
  };

  try {
    console.log("the onion");
    await uploadDir(folderPath, bucketName);
  } catch (error) {
    console.log(err);
  } finally {
    return {};
  }
};
