const makeBrowser = require('./factories/makeBrowser')
const { WrongUserKey, ZeroBalance } = require('./errors/captcha')
const makePage = require('./factories/makePage')
const DownloadTimeoutError = require('./errors/browser/DownloadTimeoutError')
const login = require('./pages/login')
const openDCTFWeb = require('./pages/openDCTFWeb')
const alterarPerfil = require('./pages/alterarPerfil')
const filtrarDCTFWeb = require('./pages/filtrarDCTFWeb')
const SemBotaoDeEmitirRecibo = require('./errors/browser/SemBotaoDeEmitirRecibo')
const getDeclaracoesDCTFWeb = require('./pages/getDeclaracoesDCTFWeb')
const PageError = require('./errors/browser/PageError')
/**
 *
 * @param {{values : Array, __root_dir : string}} data
 * @param {import('../selectors.json')} selectors
 * @param {Function(string)} log
 */
module.exports = async (data, selectors, log) => {
  try {
    let browser, page
    let lastIndex = 0;
    ({ browser } = await makeBrowser())
    try {
      ({ page } = await makePage(browser))
      await page.goto(selectors.site_url, { waitUntil: 'networkidle0' })
      await login(page, selectors)
      await openDCTFWeb(page, selectors)
      for (const [index, cliente] of Object.entries(data.values)) {
        console.log(cliente)
        lastIndex = index
        const CNPJ = cliente.CNPJ.toString().trim()
        // if (!isCpfCnpj(CNPJ)) {
        // log(`CNPJ ${CNPJ} inválido`)
        // continue
        // }
        const RAZAO = cliente.RAZAO.toString().replace(/:|\/|\.|\\/gmi, '').trim()
        log('ALTERANDO PERFIL')
        await alterarPerfil(page, CNPJ, selectors)
        log('PERFIL ALTERADO PARA O CLIENTE ' + RAZAO)
        const urlIframeDCTFWeb = await page.$eval(selectors.iframe_dctfweb, element => element.src)
        const { page: pageDCTFWeb } = await makePage(browser)
        await pageDCTFWeb.goto(urlIframeDCTFWeb, { waitUntil: 'networkidle0' })
        log('FILTRANDO INFORMACOES PARA GERAR A DCTFWEB')
        await filtrarDCTFWeb(pageDCTFWeb, {
          dataInicial: data.data_inicial,
          dataFinal: data.data_final
        }, selectors)
        log('BUSCANDO AS DECLARAÇÕES')
        await getDeclaracoesDCTFWeb(pageDCTFWeb, RAZAO, selectors, log)

        await pageDCTFWeb.close().catch(e => '')
        global.attempts = 0
      }

      return {
        status: true
      }
    } catch (error) {
      const client = await page?.target()?.createCDPSession()
      await client?.send('Network.clearBrowserCookies')
      await page?.close()
      if (error instanceof WrongUserKey) {
        log(error.message)
        return {
          status: false,
          continue: false,
          error: error.message
        }
      }
      if (error instanceof ZeroBalance) {
        log(error.message)
        return {
          status: false,
          continue: false,
          error: error.message
        }
      }

      if (error instanceof DownloadTimeoutError) {
        log(error.message)
        return {
          status: false,
          continue: true,
          error: error.message,
          repeat: true,
          lastIndex
        }
      }
      if (error instanceof SemBotaoDeEmitirRecibo) {
        log(error.message)
        return {
          status: false,
          continue: true,
          repeat: false,
          error: error.message,
          lastIndex
        }
      }
      if (error instanceof PageError) {
        log(error.message)
        return {
          status: false,
          continue: true,
          repeat: false,
          error: error.message,
          lastIndex
        }
      }
      console.log(error.message)
      return {
        status: false,
        continue: true,
        repeat: true,
        lastIndex,
        error: error?.message
      }
    }
  } catch (error) {
    log('Erro ao inicializar robo ' + error)
    return {
      status: false,
      continue: false,
      error: error?.message
    }
  }
}
