export type Resultset = {
  [command: string]: {
    coverage: RawCoverages
  }
}
type RawCoverages = {
  [filename: string]: RawCoverage
}
type RawCoverage = {
  lines: LineCoverage
  branches: BranchCoverage
}
type LineCoverage = (number | null)[]
type BranchCoverage = {
  [condition: string]: {
    [branch: string]: number
  }
}
type FileCoverage = {
  filename: string
  lines: number
  branches: number
}

function floor(n: number, digits = 0): number {
  const d = Math.pow(10, digits)
  const x = Math.floor(n * d)
  return x / d
}

function linesCoverage(coverage: LineCoverage): number {
  const effectiveLines = coverage.filter(hit => hit !== null) as number[]
  const rows = effectiveLines.length
  if (rows === 0) {
    return 100
  }

  const covered = effectiveLines.filter(hit => hit > 0).length
  return floor((covered / rows) * 100, 2)
}

function branchesCoverages(coverage: BranchCoverage): number {
  const conditions = Object.keys(coverage)
  if (conditions.length === 0) {
    return 100
  }

  let total = 0
  let covered = 0
  conditions.forEach(k => {
    const cond = coverage[k]
    Object.keys(cond).forEach(branch => {
      total += 1
      const hit = cond[branch]
      if (hit > 0) {
        covered += 1
      }
    })
  })
  return floor((covered / total) * 100, 2)
}

export class Coverage {
  files: FileCoverage[]

  constructor(resultset: Resultset) {
    const coverages = resultset['RSpec']['coverage']
    this.files = []
    Object.keys(coverages).forEach(filename => {
      const coverage = coverages[filename]
      this.files.push({
        filename,
        lines: linesCoverage(coverage.lines),
        branches: branchesCoverages(coverage.branches)
      })
    })
  }

  trimWorkspacePath(workspacePath: string) {
    this.files.forEach((fileCov) => {
      if (fileCov.filename.startsWith(workspacePath)) {
        fileCov.filename = fileCov.filename.slice(workspacePath.length)
      }
    })
  }

  report(): FileCoverage[] {
    return this.files
  }
}
