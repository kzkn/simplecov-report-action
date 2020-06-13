type Resultset = {
  [command: string]: {
    coverage: RawCoverages
  }
}
type RawCoverages = {
  [filename: string]: RawCoverage
}
type RawCoverage = {
  lines: LineCoverage,
  branches: BranchCoverage
}
type LineCoverage = (number | null)[]
type BranchCoverage = {
  [condition: string]: {
    [branch: string]: number
  }
}
type FileCoverage = {
  filename: string,
  lines: number,
  branches: number,
}

function linesCoverage(coverage: LineCoverage): number {
  const effectiveLines = coverage.filter(hit => hit !== null)
  const rows = effectiveLines.length
  if (rows === 0) {
    return 100
  }

  const covered = effectiveLines.filter(hit => hit > 0).length
  return covered / rows * 100
}

function branchesCoverages(coverage: BranchCoverage): number {
  return 0 // TODO
}

export class Coverage {
  files: FileCoverage[]

  constructor(resultset: Resultset) {
    const coverages = resultset['RSpec']['coverage']
    this.files = []
    Object.keys(coverages).forEach((filename) => {
      const coverage = coverages[filename]
      this.files.push({
        filename,
        lines: linesCoverage(coverage.lines),
        branches: branchesCoverages(coverage.branches),
      })
    })
  }

  report(): FileCoverage[] {
    return this.files
  }
}
