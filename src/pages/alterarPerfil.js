const PageError = require('../errors/browser/PageError')

/**
 *
 * @param page {import('puppeteer-core').Page}
 * @param {import('../../selectors.json')} selectors
 */
module.exports = async (page, cnpj, selectors) => {
  await page.waitForSelector(selectors.alterarPerfil.btn_alterar_perfil)
  await page.click(selectors.alterarPerfil.btn_alterar_perfil)
  await page
    .click(selectors.alterarPerfil.btn_botao_titular)
    .catch((e) => console.log('sem botao titular'))
  await page.waitForTimeout(2500)
  await page.waitForNetworkIdle()
  await page.click(selectors.alterarPerfil.btn_alterar_perfil).catch((e) => 'ja esta aberto')
  await page.type(selectors.alterarPerfil.input_cnpj, cnpj)
  await page.click(selectors.alterarPerfil.btn_submit)
  await page.waitForTimeout(5000)
  await page.waitForNetworkIdle()
  const dialog = await page
    .$eval(
      'body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.no-close.ui-resizable',
      (element) => element.style.display?.trim()
    )
    .catch((e) => 'sem dialog')
  if (dialog === 'block') {
    console.log('dialog aberto')
    await page.evaluate((item) => {
      document.querySelector(
        'body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.no-close.ui-resizable'
      ).style.display = 'none'
      document.querySelector('body > div.ui-widget-overlay').style.display =
      'none'
    })
  }
  const error = await page
    .$eval('#perfilAcesso > div.erro > p', (item) =>
      item.textContent.trim()
    )
    .catch((e) => 'ATENÇÃO:')
  if (error !== 'ATENÇÃO:') {
    throw new PageError(error)
  }
}
