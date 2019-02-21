var AWS = require("aws-sdk");
var path = require("path");
var fs = require("fs");

const s3 = new AWS.S3();

exports.handler = async event => {
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
    uploadDir(`./static`, process.env.BUCKET_NAME);
  } catch (error) {
    console.dir(err);
  } finally {
    return {};
  }
};
