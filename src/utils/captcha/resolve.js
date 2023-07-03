const { solution, submit } = require('./normal')

async function resolve (pathImgCaptcha) {
  const submitResponse = await submit(pathImgCaptcha)
  const solutionResponse = await solution(submitResponse.request)
  return solutionResponse.request
}

module.exports = resolve
