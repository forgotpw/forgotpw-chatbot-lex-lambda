const logger = require('../logger')
const config = require("../config");
const DashbotLib = require('./dashbotLib');

// sends the vcard raw via twilio, bypassing lex, which apparently can't send
// the vcard itself
async function sendVcard(phone, userToken) {
    const twilio = require('twilio')(this.twilioAccountSid, this.twilioAuthToken);

    let params = {
        body: 'Open the contact card I sent to add me to your contacts.',
        from: config.TWILIO_FROM_NUMBER,
        to: phone,
        mediaUrl: 'https://www.rosa.bot/rosa.vcf'
      };
    try {
        logger.debug(`Sending vcard via Twilio ...`);
        let responseData = await twilio.messages.create(params);
        //logger.debug(`Received response data from Twilio: ${JSON.stringify(responseData)}`);
    }
    catch (err) {
        logger.error(`Error from Twilio: ${err}`);
    }
    // log outgoing message to dashbot
    await DashbotLib.logOutgoingToDashbot(
        userToken,
        params.body,
        {
            body: params.body,
            from: params.from,
            mediaUrl: params.mediaUrl
        }
    );
}

module.exports = {
    sendVcard,
}
