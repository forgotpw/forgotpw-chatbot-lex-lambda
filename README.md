# Chatbot Lex Handler Lambda

Respond to Amazon Lex chat requests for all intents

## Intents

### Intent: Hello

```
You> Hi
FPW> Hi.  You can tell me something you want to store a password for, like "Store password for Amazon".  I'll text you back a link to enter it (don't type your password in the chat!).  Just say 'help' at any time for more information.  Since this is your first time, I highly recommend you view our recommended password strategy, take a look at:
https://www.forgotpw.com/#tips
```

### Intent: Store Password

```
You> Store password for Amazon
FPW> Click here to enter your password for Amazon:
https://app.forgotpw.com/#/store?arid=jEH93Hlx9t1xWp
FPW> Your password for Amazon has been stored.
```

```
You> Store password for Amazon
FPW> I found an existing entry for Amazon Web Services, do you want to 1) overwrite it, or 2) create a new entry for "Amazon" ?
You> 2
FPW> Click here to enter your password for Amazon:
https://app.forgotpw.com/#/store?arid=jEH93Hlx9t1xWp
FPW> Your password for Amazon has been stored.
```

```
You> Store password for Amazon
FPW> I found an existing entry for Amazon, do you want to overwrite it?
You> Yes
FPW> Click here to enter your password for Amazon:
https://app.forgotpw.com/#/store?arid=jEH93Hlx9t1xWp
FPW> Your password for Amazon has been stored.
```

### Intent: Retrieve Password

```
You> What's my password to Amazon?
FPW> Click here:
https://app.forgotpw.com/#/show?token=4gsdpUh3$daxq
```

```
You> Amazon
FPW> Click here:
https://app.forgotpw.com/#/show?token=jeDc93vbRW3wp
```

```
You> Store password for Amazon
FPW> I found multiple similar applications. Do you mean 1) Amazon.com or 2) Amazon Web Services?
You> 1
FPW> Click here:
https://app.forgotpw.com/#/store?arid=jEH93Hlx9t1xWp
```

## Authorized Requests

This service will generate an ARID (authorized request ID), which will encapsulate a request to store or retrieve a password for the specified application as well as the users phone number:

s3://forgotpw-authorized-requests-dev/jEH93Hlx9t1xWp
```json
{
    "expireEpoch": "",
    "userToken": "",
    "rawApplication": "",
    "normalizedApplication": ""
}
```

The userToken can be queried usin the phone-token-service given the phone number, which is available in the `userId` field passed to the event data to the Lambda function from Twilio.
https://docs.aws.amazon.com/lex/latest/dg/lambda-input-response-format.html

This service will then create and return the chat respons which will contain the link to the authorized request, e.g. https://app.forgotpw.com/#/store?arid=jEH93Hlx9t1xWp

When the web application receives this link it will query S3 for the specified authorized request, validate the expire time, and process the request with the provided user input for the secret.

The S3 bucket which contains these requests will have a TTL to expire items, however since we will want to expire these much faster than we can rely on S3 for expiring them, we'll also enforce our own expiry check.

## Setup - Dev Environment

Install the Serverless CLI.

```shell
# install the serverless framework
npm install serverless -g
```

## Deploy

```shell
export AWS_ENV="dev" && export PROFILE="fpw$AWS_ENV"

# pip install iam-starter
iam-starter --profile $PROFILE --command sls deploy --verbose
```

# License

GNU General Public License v3.0

See [LICENSE](LICENSE.txt) to see the full text.
