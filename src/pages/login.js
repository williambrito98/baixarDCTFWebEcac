/**
 *
 * @param page {import('puppeteer-core').Page}
 * @param {import('../../selectors.json')} selectors
 */
module.exports = async (page, selectors) => {
  const certf = await page
    .click(selectors.login.btn_entrar_com_gov, {
      clickCount: 2
    })
    .catch((e) => 'certificado salvo')
  if (certf !== 'certificado salvo') {
    await page.waitForNetworkIdle()
    await page.waitForSelector(selectors.login.btn_acesso_com_certificado)
    await page.click(selectors.login.btn_acesso_com_certificado)
    return true
  }
  await page.waitForNetworkIdle()
}
