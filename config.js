const config = {
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    AWS_ENV: process.env.AWS_ENV,
    USERTOKEN_HASH_HMAC: process.env.USERTOKEN_HASH_HMAC,
    USERTOKENS_S3_BUCKET: process.env.USERTOKENS_S3_BUCKET,
    USERDATA_S3_SSEC_KEY: process.env.USERDATA_S3_SSEC_KEY,
    USERDATA_S3_BUCKET: process.env.USERDATA_S3_BUCKET,
    AUTHREQ_S3_BUCKET: process.env.AUTHREQ_S3_BUCKET,
    AUTHREQ_EXPIRE_MINS: process.env.AUTHREQ_EXPIRE_MINS,
    MATCH_HIGH_PCT: process.env.MATCH_HIGH_PCT,
    MATCH_LOW_PCT: process.env.MATCH_LOW_PCT,
    DASHBOT_API_KEY: process.env.DASHBOT_API_KEY,
    ARID_LENGTH: process.env.ARID_LENGTH,
    LOG_LEVEL: process.env.LOG_LEVEL
  }
  
  module.exports = config
  