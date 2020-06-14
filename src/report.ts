import * as core from '@actions/core'
import * as github from '@actions/github'
import replaceComment from '@aki77/actions-replace-comment'
import markdownTable from 'markdown-table'
import {Coverage} from './coverage'

export async function report(coveredPercent: number, failedThreshold: number, coverage: Coverage): Promise<void> {
  const summaryTable = markdownTable([
    ['Covered', 'Threshold'],
    [`${coveredPercent}%`, `${failedThreshold}%`]
  ])
  const coverageTable = markdownTable([
    ['Filename', 'Lines', 'Branches'],
    ...coverage.report().map(cov => [cov.filename, String(cov.lines), String(cov.branches)])
  ])

  const pullRequestId = github.context.issue.number
  if (!pullRequestId) {
    throw new Error('Cannot find the PR id.')
  }

  await replaceComment({
    token: core.getInput('token', {required: true}),
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    // eslint-disable-next-line @typescript-eslint/camelcase
    issue_number: pullRequestId,
    body: `## Simplecov Report
${summaryTable}

${coverageTable}
`
  })
}
