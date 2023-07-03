const { post } = require('axios').default
/**
 *
 * @param url {string}
 * @param data {import('axios').AxiosRequestConfig}
 * @returns
 */
module.exports = async function (url, data) {
  return await post(url, data).catch(error => {
    return {
      status: error.response?.statusCode ?? error.toJSON()?.status,
      data: error.response?.data ?? error.toJSON()?.code,
      headers: error.toJSON()?.config?.headers
    }
  })
}
