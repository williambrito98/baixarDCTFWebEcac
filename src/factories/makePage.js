const PuppeteerAdapter = require('../utils/puppeteer/PuppeteerAdapter')
const { getEnvBrowser } = require('../utils/env')

module.exports = async function (browser) {
  const config = getEnvBrowser()
  const puppeteerAdapter = new PuppeteerAdapter()
  const page = await puppeteerAdapter.handlePage(browser, config)
  return {
    page
  }
}
