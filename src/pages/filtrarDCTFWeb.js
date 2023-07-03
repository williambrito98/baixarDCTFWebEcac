/**
 *
 * @param page {import('puppeteer-core').Page}
 * @param filtro {{dataInicial : string, dataFinal: string, categoria: string, numeroRecibo: string, situacoes: Array}}
 * @param {import('../../selectors.json')} selectors
 */
module.exports = async (page, filtro, selectors) => {
  await page.waitForSelector(selectors.DCTFWeb.periodo_apuracao_inicial, { timeout: 15000 })
  await page.type(selectors.DCTFWeb.periodo_apuracao_inicial, filtro.dataInicial)
  await page.type(selectors.DCTFWeb.periodo_apuracao_final, filtro.dataFinal)
  await page.click(selectors.DCTFWeb.btn_exibir_situacao_declaracoes)
  await page.waitForSelector(selectors.DCTFWeb.checkbox_exibir_todas)
  await page.waitForTimeout(1500)
  await page.click(selectors.DCTFWeb.checkbox_exibir_todas)
  await page.click(selectors.DCTFWeb.btn_pesquisar)
  await page.waitForNetworkIdle()
}
