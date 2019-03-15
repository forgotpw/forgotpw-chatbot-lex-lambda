const logger = require('./logger')

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
        const application = slots.Application;
        logger.debug(`slots: ${JSON.stringify(slots)}`)

        return lexResponse(
            sessionAttributes,
            'Fulfilled',
            `Okay, I know you requested to store ${application}`
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
