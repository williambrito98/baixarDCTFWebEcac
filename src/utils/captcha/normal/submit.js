const { post } = require('../../request')
const { readFileSync } = require('fs')
const { getEnv } = require('../../env')
const { WrongUserKey, ZeroBalance } = require('../../../errors/captcha')

/**
 *
 * @param {string} filepath
 * @returns {{status: Number, request: string}}
 */
module.exports = async function (filepath) {
  const response = await post(getEnv('URL_SUBMIT_CAPTCHA'), {
    key: getEnv('API_KEY_CAPTCHA'),
    method: 'base64',
    body: readFileSync(filepath).toString('base64'),
    json: 1
  })
  if (response.data === 'ERROR_WRONG_USER_KEY') {
    throw new WrongUserKey()
  }

  if (response.data === 'ERROR_ZERO_BALANCE') {
    throw new ZeroBalance()
  }
  return response.data
}
