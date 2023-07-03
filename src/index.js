const {
  workerData,
  Worker,
  isMainThread,
  parentPort
} = require('worker_threads')
const app = require('./app')
const SELECTORS = require('../selectors.json')
const workerEvents = require('./events/workerEvents')
const setVariables = require('./setVariables')
const { join, parse, resolve } = require('path')
const { rmSync } = require('fs')
const { appendFileSync } = require('fs')
const parseXLSToJson = require('./utils/excel/parseXLSToJson');

(async () => {
  if (isMainThread) {
    const worker = new Worker(__filename, {
      workerData: {
        values: parseXLSToJson(resolve('./entrada'), 'Planilha1 (2)'),
        __root_dir: process.cwd(),
        data_inicial: '01/06/2023',
        data_final: '30/06/2023'
      }
    })
    require('dotenv').config({
      path: join(parse(__dirname).dir, '.env')
    })
    worker.on('message', (message) => {
      process.stdout.write(message + '\n')
      if (process.env.CREATE_CONSOLE_FILE === 'false') return true
      appendFileSync(
        join(process.cwd(), 'saida', 'console.txt'),
                `${message}\n`
      )
    })
    worker.on('exit', () => console.log('FIM'))
    worker.on('online', () => console.log('running'))
    worker.on('error', (error) => console.log('error: ' + error))
    // worker.postMessage('close')
  } else {
    require('dotenv').config({
      path: join(workerData.__root_dir, '.env')
    })
    workerEvents()
    setVariables(workerData.__root_dir)
    const data = workerData
    while (true) {
      const execution = await app(
        data,
        SELECTORS,
        parentPort.postMessage.bind(parentPort)
      )
      const messageError = `${data.values[execution.lastIndex]?.RAZAO};${data.values[execution.lastIndex]?.CNPJ};${execution.error}\n`
      if (!execution.status) {
        if (!execution.continue) {
          appendFileSync(
            join(global.pathSaida, 'erros.csv'),
            messageError
          )
          break
        }
        if (execution.repeat) {
          if (global.attempts > 3) {
            appendFileSync(
              join(global.pathSaida, 'erros.csv'),
              messageError
            )
            data.values = data.values.filter(
              (item, index) => index > execution.lastIndex
            )
            global.attempts = 0
            continue
          }
          data.values = data.values.filter(
            (item, index) => index >= execution.lastIndex
          )
          global.attempts++
          continue
        }
        appendFileSync(
          join(global.pathSaida, 'erros.csv'),
          messageError
        )
        data.values = data.values.filter(
          (item, index) => index > execution.lastIndex
        )

        global.attempts = 0
        continue
      }
      break
    }

    rmSync(global.pathTemp, { force: true, recursive: true })
    process.exit()
  }
})()
