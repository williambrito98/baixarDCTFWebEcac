const PuppeteerAdapter = require('../utils/puppeteer/PuppeteerAdapter')
const { getEnvBrowser } = require('../utils/env')

module.exports = async function () {
  const config = getEnvBrowser()
  const puppeteerAdapter = new PuppeteerAdapter()
  const browser = await puppeteerAdapter.handleBrowser(config)
  return {
    browser
  }
}
