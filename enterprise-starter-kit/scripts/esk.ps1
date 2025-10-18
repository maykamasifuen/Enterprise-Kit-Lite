[CmdletBinding()]
param(
  [Parameter(Position=0)]
  [ValidateSet('up','down','restart','logs','ps','pull')]
  [string]$Command = 'up',

  [Parameter(Position=1, ValueFromRemainingArguments=$true)]
  [string[]]$Args
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$composeFile = Join-Path $repoRoot 'docker-compose.yml'
$projectName = 'enterprise-starter-kit'

function Invoke-Compose([string[]]$composeArgs) {
  docker compose -f $composeFile -p $projectName @composeArgs
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

switch ($Command) {
  'up' {
    Invoke-Compose @('up','-d') + $Args
    break
  }
  'down' {
    Invoke-Compose @('down') + $Args
    break
  }
  'restart' {
    Invoke-Compose @('down')
    Invoke-Compose @('up','-d') + $Args
    break
  }
  'logs' {
    # default to follow logs; allow passing e.g. "--tail 200" or a service name
    if (-not $Args -or ($Args -notcontains '--no-follow' -and $Args -notcontains '-n')) {
      Invoke-Compose @('logs','-f') + $Args
    } else {
      Invoke-Compose @('logs') + $Args
    }
    break
  }
  'ps' {
    Invoke-Compose @('ps') + $Args
    break
  }
  'pull' {
    Invoke-Compose @('pull') + $Args
    break
  }
}

