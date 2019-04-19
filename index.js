const logger = require('./logger');
const authorizedRequest = require('./lib/authorizedRequest');
const config = require('./config');
const Mustache = require('mustache')
const ApplicationService = require('./lib/applicationService')
const PhoneTokenService = require('phone-token-service')

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
            return await helloController(intentRequest);
        case 'Help':
            return await helpController(intentRequest);
        case 'StorePassword':
            return await storePasswordController(intentRequest);
        case 'RetrievePassword':
            return await retrievePasswordController(intentRequest);
        default:
            logger.error(`Unhandled intent received: ${intentName}`);
            return lexResponse(
                intentRequest.sessionAttributes,
                'Failed',
                `Sorry I'm not sure how to help with that.`
            );
    }
}

async function readTemplate(templateName) {
    const fs = require('fs');
    const util = require('util');
    const readFile = util.promisify(fs.readFile);
    const contents = await readFile(`chat-templates/${templateName}`, 'utf8');
    return contents;
}

async function helloController(intentRequest) {
    const sessionAttributes = intentRequest.sessionAttributes;
    const phone = intentRequest.userId;

    let firstTime = true;
    let msg = '';

    if (firstTime) {
        const template = await readTemplate('hello-firsttime.tmpl');
        msg = template;

        // TODO: mark as not first time visitor anymore
    }

    return lexResponse(
        sessionAttributes,
        'Fulfilled',
        msg
    );
}

async function helpController(intentRequest) {
    const sessionAttributes = intentRequest.sessionAttributes;
    const phone = intentRequest.userId;

    let firstTime = true;
    let msg = '';

    if (firstTime) {
        const template = await readTemplate('help.tmpl');
        msg = template;
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

    const arid = await authorizedRequest.generateAuthorizedRequestFromPhone(phone, rawApplication);
    const template = await readTemplate('store.tmpl');
    const subdomain = config.AWS_ENV == 'dev' ? 'app-dev' : 'app';
    const viewData = {
        rawApplication,
        url: `https://${subdomain}.forgotpw.com/#/store?arid=${arid}`
    }
    let msg = Mustache.render(template, viewData);
    
    return lexResponse(
        sessionAttributes,
        'Fulfilled',
        msg
    );
}

async function retrievePasswordController(intentRequest) {
    const sessionAttributes = intentRequest.sessionAttributes;
    const slots = intentRequest.currentIntent.slots;
    const rawApplication = slots.Application;
    const phone = intentRequest.userId;

    const phoneTokenService = new PhoneTokenService({
        tokenHashHmac: config.USERTOKEN_HASH_HMAC,
        s3bucket: config.USERTOKENS_S3_BUCKET,
        defaultCountryCode: 'US'
      })
    const userToken = await phoneTokenService.getTokenFromPhone(phone);
  
    const applicationService = new ApplicationService();
    const foundApplication = await applicationService.findApplication(rawApplication, userToken);
    let msg = '';
    if (foundApplication.matchType == 'NOTFOUND') {
        const template = await readTemplate('retrieve-notfound.tmpl');
        const viewData = {
            rawApplication
        }
        msg = Mustache.render(template, viewData);
    } else {
        let templateFile = null;
        if (foundApplication.matchType == 'EXACT_FOUND') {
            templateFile = 'retrieve.tmpl';
        } else {
            templateFile = 'retrieve-similarfound.tmpl';
        }
        // generateAuthorizedRequestFromPhone expects rawApplication but it immediately
        // converts it to normalized, and since we only have normalizedApplication here, it's
        // okay to send that, running it through normalization function again won't change anything
        const arid = await authorizedRequest.generateAuthorizedRequestFromPhone(phone, foundApplication.normalizedApplication);
        const template = await readTemplate(templateFile);
        const subdomain = config.AWS_ENV == 'dev' ? 'app-dev' : 'app';
        const viewData = {
            rawApplication,
            url: `https://${subdomain}.forgotpw.com/#/retrieve?arid=${arid}`
        }
        msg = Mustache.render(template, viewData);
    }
    
    return lexResponse(
        sessionAttributes,
        'Fulfilled',
        msg
    );
}

module.exports.handler = handler
