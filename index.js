const logger = require('./logger');
const authorizedRequest = require('./lib/authorizedRequest');
const PhoneTokenService = require('phone-token-service')
const config = require("./config");

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

    if (intentName == 'StorePassword') {
        const sessionAttributes = intentRequest.sessionAttributes;
        const slots = intentRequest.currentIntent.slots;
        const rawApplication = slots.Application;
        logger.debug(`slots: ${JSON.stringify(slots)}`);

        const phoneTokenService = new PhoneTokenService({
            // salt for hashing algorithm 
            tokenHashHmac: config.USERTOKEN_HASH_HMAC,
            // s3 bucket for storing the mapping relationship
            s3bucket: 'forgotpw-usertokens-dev',
            // retrieve country code from ip address via https://ipapi.co/country/
            defaultCountryCode: 'US'
        });
        const phone = intentRequest.userId;
        const userToken = await phoneTokenService.getTokenFromPhone(phone);
        let arid = await authorizedRequest.generate(userToken, rawApplication);

        return lexResponse(
            sessionAttributes,
            'Fulfilled',
            `To store a password for ${rawApplication}, click: \nhttps://app.forgotpw.com/#/store?arid=${arid}`
        );
    }

    return lexResponse(
        sessionAttributes,
        'Failed',
        `Sorry I'm not sure how to help with that.`
    );
}

async function handler(event, context, callback)  {
    try {
        let lexResponse = await dispatchIntent(event);
        callback(null, lexResponse);
    }
    catch (err) {
        callback(err);
    }
};

module.exports.handler = handler
