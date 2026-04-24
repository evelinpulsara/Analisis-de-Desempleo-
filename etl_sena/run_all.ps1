param(
    [string]$Python = "python",
    [string]$HadoopHome = "C:\hadoop",
    [string]$RawBase = "data/raw",
    [string]$CleanBase = "data/clean",
    [switch]$SkipHadoopSetup,
    [switch]$ContinueOnError
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

function Invoke-SparkClean {
    param(
        [string]$PythonExe,
        [string]$InputPath,
        [string]$Dataset,
        [string]$OutputPath,
        [switch]$AllowFailure
    )

    if (-not (Test-Path -LiteralPath $InputPath)) {
        $msg = "No existe archivo de entrada: $InputPath"
        if ($AllowFailure) {
            Write-Warning $msg
            return
        }
        throw $msg
    }

    Write-Host ""
    Write-Host ">>> Ejecutando dataset: $Dataset"
    Write-Host "$PythonExe spark_clean.py --input `"$InputPath`" --dataset $Dataset --output `"$OutputPath`""

    & $PythonExe "spark_clean.py" "--input" $InputPath "--dataset" $Dataset "--output" $OutputPath
    if ($LASTEXITCODE -ne 0) {
        $msg = "Fallo limpieza para dataset: $Dataset (exit code: $LASTEXITCODE)"
        if ($AllowFailure) {
            Write-Warning $msg
            return
        }
        throw $msg
    }
}

if (-not $SkipHadoopSetup) {
    $winutilsPath = Join-Path $HadoopHome "bin\winutils.exe"
    if (-not (Test-Path -LiteralPath $winutilsPath)) {
        throw "No se encontro winutils.exe en $winutilsPath. Ajusta -HadoopHome o instala winutils."
    }

    $env:HADOOP_HOME = $HadoopHome
    $hadoopBin = Join-Path $HadoopHome "bin"
    if (-not (($env:PATH -split ";") -contains $hadoopBin)) {
        $env:PATH = "$hadoopBin;$env:PATH"
    }

    $sparkTmp = Join-Path $scriptDir ".spark-tmp"
    New-Item -ItemType Directory -Force -Path $sparkTmp | Out-Null
    $env:SPARK_LOCAL_DIRS = $sparkTmp
}

$tasks = @(
    @{
        Dataset = "desercion"
        Input = Join-Path $RawBase "desercion\u4ze-bi7k.csv"
        Output = Join-Path $CleanBase "desercion"
    },
    @{
        Dataset = "certificacion"
        Input = Join-Path $RawBase "certificacion\28vu-5tx7.csv"
        Output = Join-Path $CleanBase "certificacion"
    },
    @{
        Dataset = "agencia_empleo"
        Input = Join-Path $RawBase "agencia_empleo\8pqf-rmzr.csv"
        Output = Join-Path $CleanBase "agencia_empleo"
    },
    @{
        Dataset = "planta_entidad"
        Input = Join-Path $RawBase "planta_entidad\fvq4-wwtz.csv"
        Output = Join-Path $CleanBase "planta_entidad"
    }
)

foreach ($task in $tasks) {
    Invoke-SparkClean `
        -PythonExe $Python `
        -InputPath $task.Input `
        -Dataset $task.Dataset `
        -OutputPath $task.Output `
        -AllowFailure:$ContinueOnError
}

Write-Host ""
Write-Host "Proceso completado."
Write-Host "Salida en: $CleanBase"
