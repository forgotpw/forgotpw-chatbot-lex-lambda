const logger = require('./logger');
const authorizedRequest = require('./lib/authorizedRequest');
const config = require('./config');
const Mustache = require('mustache')

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

async function storePasswordController(intentRequest) {
    const sessionAttributes = intentRequest.sessionAttributes;
    const slots = intentRequest.currentIntent.slots;
    const rawApplication = slots.Application;
    const phone = intentRequest.userId;

    const arid = await authorizedRequest.generateAuthorizedRequestFromPhone(phone, rawApplication);
    const template = await readTemplate('store.tmpl');
    const viewData = {
        rawApplication,
        url: `https://app.forgotpw.com/#/store?arid=${arid}`
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

    const arid = await authorizedRequest.generateAuthorizedRequestFromPhone(phone, rawApplication);
    const template = await readTemplate('retrieve.tmpl');
    const viewData = {
        rawApplication,
        url: `https://app.forgotpw.com/#/retrieve?arid=${arid}`
    }
    let msg = Mustache.render(template, viewData);
    
    return lexResponse(
        sessionAttributes,
        'Fulfilled',
        msg
    );
}

module.exports.handler = handler
