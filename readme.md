# Serverless Deploy And Run

In this module we'll breakdown the Wild Rydes application into two separate microservices.

Both microservices and monolith are valid serverless architecture choices. We use a microservices architecture here because it reduces the complexity of a single service and its configuration is easier to understand.

## Goals and Objectives:

**Objectives:**

- Understand constructing a serverless application with microservices

**Goals:**

- Deploy separate microservices to create Wild Rydes.

## Tech Stack

The Wild Rydes application has been broken down into two separate services. They are:

- [wild-rydes](https://github.com/tobyfee/wild-rydes-frontend) - frontend website and ride request service.
- [wild-rydes-ride-fleet](https://github.com/tobyfee/wild-rydes) - Manages the available ride fleet.

![Wild Rydes Microservices](/images/wild-rydes-arch.png)

## Instructions

### 1. Create your Wild Rydes frontend

Create the stack that will host the frontend service, it will consist of an S3 bucket to host the static site, a Lambda to populate that bucket, and an API gateway, with another lambda to handle that traffic.

1. create a new Stack on Stackery
   In this case we'll start with a blank canvas and add all the resources. The process will take less than 10 minutes
   ![A new Stack](/images/new-stack.png)
   Choose a hosting provider, set a stack name, and pick 'create new repo,' the other settings can stay at default.

2. Add an S3 bucket
   Click 'add resource' then click on an AWS Simple Storage Solution (S3) bucket. This bucket will host our frontend static site.

   ![Add resource](/images/add-resource.png)

   once you've added a bucket to the canvas you can click it to set a display name and a logical ID
   ![S3 Bucket](/images/object-store.png)

Q: What is a logical name used for?

<details>
<summary><strong>Answer</strong></summary>
<p>
The name used for a resource within the template is a logical name. When AWS CloudFormation creates the resource, it generates a physical name that is based on the combination of the logical name, the stack name, and a unique ID.
</p>
</details>

3. Add a Lambda to populate the S3 bucket
   Click 'Add Resource' and this time add an AWS Serverless Function (Lambda)

We want to give that lambda access to write to our S3 bucket, so drag a line from the right side of the lambda over to the S3 bucket
![create a connection](/images/connection.png)

<details>
<summary><strong>What does connecting that line do?</strong></summary>
<p>

- save you ten minutes of clicking around the AWS console creating the necessary permissions.

- add a few environment variables so that it's easy to write code pointing to the S3 bucket

Click the lambda to see the new permission settings and the environment variables listed toward the bottom of the settings pane.

![Prepare Deployment](/images/lambda-vars.png)

</p>
</details>

you can click in to the lambda to give it a name or change its memory and language settings, but we can stick with the defaults.

4. commit your changes and download your stack

click the 'commit' button at the right, it might be informative here to look at the changes [made to the Serverless Application Model (SAM)](https://www.stackery.io/blog/aws-sam-yaml-intro/) template changes in this commit. Following these changes progressively can give you some understanding of how the template works.

After that click the commit ID to go to your code repository,
![Prepare Deployment](/images/commit-repo.png)

And clone it locally!

5. work with your code locally
   In your favorite IDE, take a look at your project to see what structure Stackery has created. Your placeholder function will be in the src/ directory

   ![view of the project code](/images/project-view.png)

   First let's grab the source for our frontend code, clone [the demo repository](https://github.com/ServerlessOpsIO/wild-rydes) and move the 'static' directory to the same directory as your lambda

   Now let's give our lambda the code to automatically populate the S3 bucket. In `src/Function/index.js` add:

   ```
   var AWS = require("aws-sdk");
   var path = require("path");
   var fs = require("fs");
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

   ```

6. prepare a deployment
   from the 'deploy' tab at the left, prepare a deployment in the dev environment

![Prepare Deployment](/images/prepare.png)

When it's ready hit 'deploy', you'll be taken to the CloudFormation dashboard, where you can deploy these changes

10. Exercise your Lambda

From the Stackery dashboard, click your "populate your S3 Bucket" lambda to go to the AWS console, create a test event, and exercise that lambda, triggering this lambda just once will populate your S3 bucket with the necessary frontend content

<details>
<summary><strong>Adding automation</strong></summary>
<p>

you can greatly streamline this process by triggering this lambda [automatically whenever you deploy to this stack](https://support.stackery.io/hc/en-us/articles/360003803151-Automatically-deploying-html-from-Github-to-S3) using a custom CloudFormation resource

</p>
</details>

11. Add the API endpoint and connected Lambda

- within the Stackery UI add a lambda and an API gateway
- click the API gateway to add an endpoint to POST `/ride`
- add a connecting line from the gateway to the lambda
- Click on the Lambda and change its runtime to Python 3.6 and its source location to `Handlers/RequestRide`
- Commit these changes with the button at the left
- `git pull` the changes to your local copy.
- Within `Handlers/` you'll see a new function. Into that function add the following Python Code

```
'''Request a ride'''

from datetime import datetime
import logging
import json
import os
import uuid

import requests

log_level = os.environ.get('LOG_LEVEL', 'INFO')
logging.root.setLevel(logging.getLevelName(log_level))  # type:ignore
_logger = logging.getLogger(__name__)

REQUEST_UNICORN_URL = os.environ.get('REQUEST_UNICORN_URL')


def _generate_ride_id():
    '''Generate a ride ID.'''
    return uuid.uuid1()


def _get_ride(pickup_location):
    '''Get a ride.'''
    ride_id = _generate_ride_id()
    unicorn = _get_unicorn()

    # NOTE: upstream they replace Rider with User but that seems silly.
    resp = {
        'RideId': str(ride_id),
        'Unicorn': unicorn,
        'RequestTime': str(_get_timestamp_from_uuid(ride_id)),
    }
    return resp


def _get_timestamp_from_uuid(u):
    '''Return a timestamp from the given UUID'''
    return datetime.fromtimestamp((u.time - 0x01b21dd213814000) * 100 / 1e9)


def _get_unicorn(url=REQUEST_UNICORN_URL):
    '''Return a unicorn from the fleet'''
    unicorn = requests.get(REQUEST_UNICORN_URL)
    return unicorn.json()


def _get_pickup_location(body):
    '''Return pickup location from event'''
    return body.get('PickupLocation')


def handler(event, context):
    '''Function entry'''
    _logger.info('Request: {}'.format(json.dumps(event)))

    body = json.loads(event.get('body'))
    pickup_location = _get_pickup_location(body)
    ride_resp = _get_ride(pickup_location)

    resp = {
        'statusCode': 201,
        'body': json.dumps(ride_resp),
        'headers': {
            "Access-Control-Allow-Origin": "*",
        }
    }

    _logger.info('Response: {}'.format(json.dumps(resp)))
    return resps

```

- push your changes
- prepare and deploy in the Stackery UI

12. viewing/testing these pieces

The 'view' tab at the left of the Stackery UI will show you all of the resources that are currently deployed on AWS. The distinction between the Edit view is that the edit view shows changes that are _planned_ but may wait for other things to be deployed.

click on either the S3 bucket or the API endpoint, both will show you the URL that they're deployed to. Use this to test your API or preview your site!

##### A word on secrets

The Lambda dashboard within Stackery lets you set config variables but _these will be visible as part of your repository code_

For API keys and the like, the Environments tab lets you set all the secret config values you need.

![Stackery Secrets](/images/secrets.png)

### 2. Deploy wild-rydes-ride-fleet

Deploy _wild-rydes-fleet_. This is composed of an API endpoint, a lambda to serve that data, a DynamoDB table, and a final utility Lambda to populate the dynamoDB table

1. create a 'new stack' from within the [Stackery UI](https://app.stackery.io/)
2. Add the required components

We want to have a public API available to grab data from our database

- within the Stackery UI add a lambda and an API gateway, and a DynamoDB Table
- click the API gateway to add an endpoint to GET `/unicorn`
- add a connecting line from the gateway to the lambda, and from the Lambda to the DynamoDB table
- Click on the Lambda and change its runtime to Python 3.6 and its source location to `Handlers/RequestUnicorn`
- Commit these changes with the button at the left
- `git pull` the changes to your local copy.
- Within `Handlers/` you'll see a new function. Into that function add the following Python Code

```
'''Request a ride'''

import logging
import json
import os
import random

import boto3

log_level = os.environ.get('LOG_LEVEL', 'INFO')
logging.root.setLevel(logging.getLevelName(log_level))  # type:ignore
_logger = logging.getLogger(__name__)

# DynamoDB
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE')
UNICORN_HASH_KEY = os.environ.get('UNICORN_HASH_KEY')
dynamodb = boto3.resource('dynamodb')
DDT = dynamodb.Table(DYNAMODB_TABLE)

def _get_unicorn():
    '''Return a unicorn from the fleet'''
    # Get a few of them and return one at random. Need to eventually randomize
    # where in the table we start our lookup.
    results = DDT.scan(
        Limit=5,
    )
    unicorns = results.get('Items')
    unicorn = unicorns[random.randint(0, len(unicorns) - 1)]

    return unicorn

def handler(event, context):
    '''Function entry'''
    _logger.debug('Request: {}'.format(json.dumps(event)))

    resp = _get_unicorn()

    resp = {
        'statusCode': 200,
        'body': json.dumps(resp),
    }
    _logger.debug('Response: {}'.format(json.dumps(resp)))
    return resp

```

- push your changes
- prepare and deploy in the Stackery UI

![Stackery Setup](/images/setup.png)

3. deploy your new stack

Q: What domain will my new service have?

<details>
<summary><strong>Answer</strong></summary>
<p>
Stackery will automatically issue a domain for API gateways you create, you can see which URL's have been issued after deploying by going to the 'view' menu.

</p>
</details>

Q: What Are Custom Resources??

<details>
<summary><strong>Answer</strong></summary>
<p>
Custom resources are virtual CloudFormation resources that can invoke AWS Lambda functions. Inside the Lambda function you have access to the properties of the custom resource (which can include information about other resources in the same CloudFormation stack by way of [Ref](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ref.html) and [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html) functions). The function can then do anything in the world as long as it (or another resource it invokes) reports success or failure back to CloudFormation within one hour.
</p>
</details>

Q: how does Stackery (and CloudFormation) store the information about the serverless stack?

<details>
<summary><strong>Answer</strong></summary>
<p>
AWS uses the [Serverless Application Model (SAM)](https://www.stackery.io/blog/aws-sam-yaml-intro/) yaml format, an open source standard for creating a template for your stack.
</p>
</details>
```
