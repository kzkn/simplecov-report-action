import path from 'path'
import * as core from '@actions/core'
import {report} from './report'
import {Coverage} from './coverage'

interface Result {
  result: {
    covered_percent: number
  }
}

async function run(): Promise<void> {
  try {
    const failedThreshold: number = Number.parseInt(core.getInput('failedThreshold'), 10)
    core.debug(`failedThreshold ${failedThreshold}`)

    const resultPath: string = core.getInput('resultPath')
    core.debug(`resultPath ${resultPath}`)

    const resultsetPath: string = core.getInput('resultsetPath')
    core.debug(`resultsetPath ${resultsetPath}`)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-require-imports
    const result = require(path.resolve(process.env.GITHUB_WORKSPACE!, resultPath)) as Result
    const coveredPercent = result.result.covered_percent

    if (coveredPercent < failedThreshold) {
      throw new Error(`Coverage is less than ${failedThreshold}%. (${coveredPercent}%)`)
    }

    const resultset = JSON.parse(path.resolve(process.env.GITHUB_WORKSPACE!, resultsetPath)) as {}
    const coverage = new Coverage(resultset)

    await report(coveredPercent, failedThreshold, coverage)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
