param(
  [Parameter(Position = 0)]
  [ValidateSet('dev', 'build', 'preview', 'test', 'install', 'sync:plan', 'sync:apply')]
  [string]$Task = 'dev'
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
  $portableNode = Get-ChildItem -Path (Join-Path $projectRoot '.tools/node-*-win-x64/node.exe') -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($portableNode) {
    $env:PATH = $portableNode.DirectoryName + ';' + $env:PATH
    $npmCommand = Join-Path $portableNode.DirectoryName 'npm.cmd'
  } else {
    $npmCommand = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
    if (-not $npmCommand) { throw 'Install Node.js 22.12+ (24 LTS recommended), restart VS Code, and try again.' }
  }
  if ($Task -eq 'install') { & $npmCommand install --cache .tools/npm-cache }
  else { & $npmCommand run $Task }
  $taskExit = $LASTEXITCODE
} finally { Pop-Location }
exit $taskExit
