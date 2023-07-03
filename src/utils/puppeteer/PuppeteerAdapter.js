const puppeteer = require('puppeteer-core')
const { readdirSync, existsSync, mkdirSync } = require('fs')
const { setTimeout } = require('timers/promises')
const { getEnv } = require('../env')
const DownloadTimeoutError = require('../../errors/browser/DownloadTimeoutError')

class PuppeteerAdapter {
  /**
    * @param config {import('puppeteer-core').LaunchOptions & import('puppeteer-core').BrowserConnectOptions & import('puppeteer-core').BrowserLaunchArgumentOptions}
    * @returns {import('puppeteer-core').Browser}
    */
  async handleBrowser (config) {
    if (global.browser) return global.browser

    // USAR COM MODO REMOTE DEBUG PORT HABILITADO
    // global.browser = await puppeteer.connect({
    //   browserWSEndpoint: 'ws://127.0.0.1:9222/devtools/browser/7e782299-0e11-4466-aa99-51b5da61e426',
    //   slowMo: 30,
    //   ignoreHTTPSErrors: true,
    //   defaultViewport: {
    //     width: 1200,
    //     height: 1080
    //   }
    // })
    global.browser = await puppeteer.launch(config)
    return global.browser
  }

  /**
    * @param config {import('puppeteer-core').LaunchOptions & import('puppeteer-core').BrowserConnectOptions & import('puppeteer-core').BrowserLaunchArgumentOptions}
    * @param browser {import('puppeteer-core').Browser}
    * @returns {import('puppeteer-core').Page}
    */
  async handlePage (browser, config) {
    const page = await browser.newPage()

    page.setDefaultTimeout(config.defaultTimeout)
    page.setDefaultNavigationTimeout(config.defaultNavigationTimeout)

    await page.setViewport(config.defaultViewport)

    config.pathDownload ? await this.setDownloadDirectory(config.pathDownload, page) : ''

    Object.defineProperties(page, {
      setDownloadDirectory: {
        value: this.setDownloadDirectory
      },
      waitForDownload: {
        value: this.waitForDownload
      },
      clearAllCookies: {
        value: this.clearAllCookies
      }
    })

    return page
  }

  /**
   *
   * @param path  {string}
   * @param page  {import('puppeteer-core').Page}
   */
  async setDownloadDirectory (path, page = null) {
    if (!existsSync(path)) {
      mkdirSync(path, {
        recursive: true
      })
    }
    if (!page) {
      page = this.page
    }
    const client = await page.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
      downloadPath: path,
      behavior: 'allow'
    })
  }

  async clearAllCookies (page) {
    const client = await page.target().createCDPSession()
    await client.send('Network.clearBrowserCookies')
  }

  async waitForDownload (pathDownload, limit = 0) {
    if (limit >= 60000) {
      throw new DownloadTimeoutError('Limite para o download excedido')
    }
    const string = readdirSync(pathDownload).join('')
    if (!string.includes('crdownload')) {
      if (getEnv('FILE_NAME_DOWNLOAD') && !string.includes(getEnv('FILE_NAME_DOWNLOAD'))) {
        await setTimeout(1500)
        return await this.waitForDownload(pathDownload, limit + 1500)
      }
    }

    return true
  }
}

module.exports = PuppeteerAdapter
