const { get } = require('../../request')
const { getEnv } = require('../../env')
const { setTimeout } = require('timers/promises')

async function solution (requestId) {
  await setTimeout(getEnv('TIMEOUT_NORMAL_CAPTCHA'))
  const response = await get(getEnv('URL_SOLUTION_CAPTCHA'), {
    params: {
      key: getEnv('API_KEY_CAPTCHA'),
      action: 'get',
      id: requestId,
      json: 1
    }
  })

  if (response.data?.request === 'CAPCHA_NOT_READY') {
    return await solution(requestId)
  }
  return response.data
}

module.exports = solution
