const config = {
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    USERTOKEN_HASH_HMAC: process.env.USERTOKEN_HASH_HMAC,
    USERTOKENS_S3_BUCKET: process.env.USERTOKENS_S3_BUCKET,
    USERDATA_S3_SSEC_KEY: process.env.USERDATA_S3_SSEC_KEY,
    AUTHREQ_S3_BUCKET: process.env.AUTHREQ_S3_BUCKET,
    AUTHREQ_EXPIRE_MINS: process.env.AUTHREQ_EXPIRE_MINS,
    LOG_LEVEL: process.env.LOG_LEVEL
  }
  
  module.exports = config
  