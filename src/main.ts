import path from 'path'
import * as fs from 'fs'
import * as core from '@actions/core'
import {report} from './report'
import {Coverage, Resultset} from './coverage'

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

    const resultsetJsonContent = fs.readFileSync(path.resolve(process.env.GITHUB_WORKSPACE!, resultsetPath))
    core.debug(`resultsetJsonContent ${resultsetJsonContent}`)
    const resultset = JSON.parse(resultsetJsonContent.toString()) as Resultset
    const coverage = new Coverage(resultset)
    coverage.trimWorkspacePath(process.env.GITHUB_WORKSPACE!)

    await report(coveredPercent, failedThreshold, coverage)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
