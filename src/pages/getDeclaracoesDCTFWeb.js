const { join } = require('path')
const SemBotaoDeEmitirRecibo = require('../errors/browser/SemBotaoDeEmitirRecibo')
/**
 *
 * @param page {import('puppeteer-core').Page}
 * @param razao {string}
 * @param {import('../../selectors.json')} selectors
 */
module.exports = async (page, razao, selectors, log) => {
  await page.waitForSelector(selectors.DCTFWeb.table_declaracoes)
  const declaracoes = await page.$$(selectors.DCTFWeb.table_declaracoes_tr)
  log(`NUMERO DE DECLARAÇÕES ENCONTRADAS PARA O CLIENTE ${razao}: ${declaracoes.length}`)
  for (const [index, declaracao] of Object.entries(declaracoes)) {
    const indice = (index + 2).padStart(2, '0').toString()
    const saldoAPagar = await declaracao.$eval(selectors.DCTFWeb.saldo_a_pagar.replace('{}', indice), element => element.textContent.replace(',', '').trim())
    log(`SALDO DA DECLARACAO ${indice}: ${saldoAPagar}`)
    const btnEmitirRecibo = await declaracao.$(selectors.DCTFWeb.btn_emitir_recibo.replace('{}', indice)).catch(e => 'SEM BOTAO DE EMITIR RECIBO')
    if (btnEmitirRecibo === 'SEM BOTAO DE EMITIR RECIBO' || !btnEmitirRecibo) {
      await page.close()
      throw new SemBotaoDeEmitirRecibo('NÃO FOI ENCONTRADO O BOTAO DE EMITIR RECIBO')
    }
    log('BAIXANDO RECIBO')

    await page.setDownloadDirectory(global.pathSaida, page)
    if (saldoAPagar === '000') {
      await page.setDownloadDirectory(join(global.pathSaida, 'SEM_GUIA', razao), page)
      await btnEmitirRecibo.click()
      log(`NÃO HÁ GUIA DE PAGAMENTO PARA GERAR PARA O CLIENTE ${razao}`)
      await page.waitForTimeout(1500)
      continue
    }

    await page.setDownloadDirectory(join(global.pathSaida, 'COM_GUIA', razao), page)
    log('BAIXANDO DECLARAÇÃO')
    await btnEmitirRecibo.click()
    await page.waitForTimeout(1500)
    await page.waitForNetworkIdle()
    await page.evaluate(() => {
      const modalCarregamento = document.querySelector('#ImageProcessamento')
      if (!modalCarregamento) {
        return false
      }
      modalCarregamento.style.display = 'none'
    })
    await page.waitForTimeout(2500)
    await page.click(selectors.DCTFWeb.btn_visualizar_guia.replace('{}', indice))
    await page.waitForNetworkIdle()
    await page.waitForSelector(selectors.DCTFWeb.btn_emitir_darf)
    await page.click(selectors.DCTFWeb.btn_emitir_darf)
    await page.waitForTimeout(2500)
    await page.waitForNetworkIdle()
  }
}

async function waitForModal (page, type = 'disabled', limit = 0) {
  if (type === 'disabled') {
    const modal = await page.$eval('#ImageProcessamento', element => element.style.display).catch(e => '')
    if (modal === '' && limit < 10000) {
      await page.waitForTimeout(1500)
      return await waitForModal(page, limit + 1500)
    }

    if (modal === '' && limit > 10000) {
      await page.evaluate(() => {
        const modalCarregamento = document.querySelector('body > div.bootbox.modal.fade.bootbox-alert.in')
        if (!modalCarregamento) {
          return false
        }
        modalCarregamento.style.display = 'none'
      })
    }
  }

  if (type === 'enabled') {
    const modal = await page.$eval('#ImageProcessamento', element => element.style.display)
    if ((modal === 'none') && limit < 10000) {
      await page.waitForTimeout(1500)
      return await waitForModal(page, limit + 1500)
    }
    return true
  }
}
