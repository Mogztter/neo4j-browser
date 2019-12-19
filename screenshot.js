'use strict'

const puppeteer = require('puppeteer')

const log = async msg => {
  const args = []
  for (let i = 0; i < msg.args().length; ++i) {
    args.push(await msg.args()[i].jsonValue())
  }
  const type = msg.type()
  let log
  if (type === 'warning') {
    log = console.warn
  } else {
    log = console[msg.type()]
  }
  log.apply(this, args)
  return args
}

const opts = {
  headless: true,
  defaultViewport: null,
  timeout: 10000,
  args: ['--allow-file-access-from-files', '--no-sandbox']
}

;(async () => {
  const browser = await puppeteer.launch(opts)
  try {
    const page = await browser.newPage()
    const query =
      'MATCH (bacon:Person {name:"Kevin Bacon"})-[*1..2]-(hollywood) RETURN DISTINCT hollywood'
    //const query = 'MATCH (nineties:Movie) WHERE nineties.released >= 1990 AND nineties.released < 2000 RETURN nineties.title'
    await page.exposeFunction('neo4jGraphOpts', () => ({
      query: query,
      uri: 'bolt://localhost:7687',
      username: 'neo4j',
      password: 'root'
    }))
    page.on('console', async msg => {
      await log(msg)
    })
    await page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1
    })
    await page.goto(`file://${__dirname}/dist/index.html`)
    await page.waitFor(
      () => !!document.querySelector('svg.neod3viz[data-completed="true"] > g')
    )
    const selector = '#mount'
    const rect = await page.evaluate(selector => {
      const element = document.querySelector(selector)
      if (!element) return null
      const { x, y, width, height } = element.getBoundingClientRect()
      return { left: x, top: y, width, height, id: element.id }
    }, selector)

    await page.screenshot({
      path: 'example.png',
      clip: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      }
    })
  } catch (err) {
    console.log('Unable to take a screenshot', err)
  } finally {
    await browser.close()
  }
})()
