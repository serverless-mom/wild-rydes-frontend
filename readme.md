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

### 1. Deploy wild-rydes-ride-fleet

Deploy the _wild-rydes-ride-fleet_ service. This service is a RESTful API that fetches available unicorns and returns their info to the requesting service. The service is composed of API Gateway, an AWS Lambda function, and a DynamoDB table.

1. create a 'new stack' from within the [Stackery UI](https://app.stackery.io/)
2. Select 'Use Existing Repo' and point to https://github.com/tobyfee/wild-rydes

![Stackery Setup](/images/setup.png)

3. clone the repo locally to view the source code and make changes as needed.

```
$ cd $WORKSHOP
$ git clone https://github.com/tobyfee/wild-rydes.git

```

<details>
<summary><strong>Output</strong></summary>
<p>

```
$ cd $WORKSHOP

$ git clone https://github.com/tobyfee/wild-rydes-frontend
Cloning into 'wild-rydes-frontend'...
remote: Counting objects: 30, done.
remote: Total 30 (delta 0), reused 0 (delta 0), pack-reused 30
Unpacking objects: 100% (30/30), done.

```

</p>
</details>

4. Deploy the stack

![Prepare Deployment](/images/prepare.png)

##### A word on secrets

The Lambda dashboard within Stackery lets you set config variables but _these will be visible as part of your repository code_

![Stackery Secrets](/images/secrets.png)

For API keys and the like, the Environments tab lets you set all the secret config values you need.

### 2. Deploy wild-rydes-frontend

Deploy _wild-rydes_. This composed of a RESTful web API that fetches an available ride from the wild-rydes-ride-fleet and the website frontend used by users. The service is composed of API Gateway, an AWS Lambda function, and static web content served from an S3 bucket.

1. create a 'new stack' from within the [Stackery UI](https://app.stackery.io/)
2. Select 'Use Existing Repo' and point to https://github.com/tobyfee/wild-rydes-frontend

![Stackery Setup](/images/setup.png)

3. clone the repo locally to view the source code and make changes as needed.

```
$ cd $WORKSHOP
$ git clone https://github.com/tobyfee/wild-rydes-frontend.git
$ cd wild-rydes
$ npm install
```

<details>
<summary><strong>Output</strong></summary>
<p>

```
$ cd $WORKSHOP

$ git clone https://github.com/tobyfee/wild-rydes.git
Cloning into 'wild-rydes'...
remote: Enumerating objects: 157, done.
remote: Total 157 (delta 0), reused 0 (delta 0), pack-reused 157
Receiving objects: 100% (157/157), 9.46 MiB | 6.68 MiB/s, done.
Resolving deltas: 100% (31/31), done.

$ cd wild-rydes

$ npm install
npm notice created a lockfile as package-lock.json. You should commit this file.
added 77 packages in 6.546s

```

</p>
</details>

Q: What domain will my new service have?

<details>
<summary><strong>Answer</strong></summary>
<p>
Stackery will automatically issue a domain for API gateways you create

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
