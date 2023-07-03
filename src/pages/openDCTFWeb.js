
/**
 *
 * @param page {import('puppeteer-core').Page}
 * @param {import('../../selectors.json')} selectors
 */
module.exports = async (page, selectors) => {
  await page.waitForSelector(selectors.btn_declaracoes_e_demonstrativos)
  await page.click(selectors.btn_declaracoes_e_demonstrativos)
  await page.waitForSelector(selectors.btn_assinar_e_transmitir_dctfweb)
  await page.click(selectors.btn_assinar_e_transmitir_dctfweb)
  await page.waitForNetworkIdle()
}
