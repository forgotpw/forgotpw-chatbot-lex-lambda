const logger = require('./logger');
const authorizedRequest = require('./lib/authorizedRequest');
const PhoneTokenService = require('phone-token-service')
const config = require("./config");

async function handler(event, context, callback)  {
    try {
        let lexResponse = await dispatchIntent(event);
        callback(null, lexResponse);
    }
    catch (err) {
        callback(err);
    }
};

function lexResponse(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close', // known type ids = [Close, ConfirmIntent, Delegate, DialogAction, ElicitIntent, ElicitSlot]
            fulfillmentState,
            message: { 'contentType': 'PlainText', 'content': `${message}` }
        },
    };
}

async function dispatchIntent(intentRequest) {
    const intentName = intentRequest.currentIntent.name;
    logger.info(`request received for userId=${intentRequest.userId}, intentName=${intentName}`);
    logger.debug(`slots: ${JSON.stringify(intentRequest.currentIntent.slots)}`);

    // if the userId is not a phone number, such as if testing in the AWS Lex
    // console, the userId field will appear like vku38bqtk0388hdr74stria0ba0y7s4f
    // so if the userId is 32 chars and contains any letter we'll know it's testing
    // and force the userId/phone to a testing phone
    if (intentRequest.userId.length >= 32 && intentRequest.userId.match(/^[A-Z]/i)) {
        intentRequest.userId = '12125551212';
        console.warn(`Test usasge detected, overriding intentRequest.userId to ${intentRequest.userId}`);
    }

    switch(intentName) {
        case 'Hello':
            return helloController(intentRequest);
        case 'StorePassword':
            return await storePasswordController(intentRequest);
        default:
            logger.error(`Unhandled intent received: ${intentName}`);
            return lexResponse(
                intentRequest.sessionAttributes,
                'Failed',
             `Sorry I'm not sure how to help with that.`
            );
    }
}

function helloController(intentRequest) {
    const sessionAttributes = intentRequest.sessionAttributes;
    const phone = intentRequest.userId;

    let firstTime = true;

    let msg = `Hi${firstTime ? ", looks like you're new." : ""}.  You can tell me something you want to store a password for, like "Store password for Amazon".  I'll text you back a link to enter it (don't type your password in the chat!).`;
    if (firstTime) {
        msg += `  Since this is your first time, I highly recommend you view our recommended password strategy, take a look at:\n`;
        msg += `https://www.forgotpw.com/#tips`;
    }

    return lexResponse(
        sessionAttributes,
        'Fulfilled',
        msg
    );
}


async function storePasswordController(intentRequest) {
    const sessionAttributes = intentRequest.sessionAttributes;
    const slots = intentRequest.currentIntent.slots;
    const rawApplication = slots.Application;
    const phone = intentRequest.userId;

    const phoneTokenService = new PhoneTokenService({
        // salt for hashing algorithm 
        tokenHashHmac: config.USERTOKEN_HASH_HMAC,
        // s3 bucket for storing the mapping relationship
        s3bucket: 'forgotpw-usertokens-dev',
        // retrieve country code from ip address via https://ipapi.co/country/
        defaultCountryCode: 'US'
    });
    const userToken = await phoneTokenService.getTokenFromPhone(phone);
    let arid = await authorizedRequest.generate(userToken, rawApplication);

    return lexResponse(
        sessionAttributes,
        'Fulfilled',
        `To store a password for ${rawApplication}, click: \nhttps://app.forgotpw.com/#/store?arid=${arid}`
    );
}

module.exports.handler = handler
