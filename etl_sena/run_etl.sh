#!/usr/bin/env bash
set -euo pipefail

SOURCE="${1:-}"
DATASET="${2:-}"
RAW_DIR="${3:-data/raw}"
CLEAN_DIR="${4:-data/clean}"

if [ -z "$SOURCE" ] || [ -z "$DATASET" ]; then
  echo "Uso: bash run_etl.sh \"<query|url|resource_id>\" <desercion|certificacion|agencia_empleo|planta_entidad> [raw_dir] [clean_dir]"
  exit 1
fi

if [[ "$SOURCE" == http* ]] || [[ "$SOURCE" == *"datos.gov.co"* ]] || [[ "$SOURCE" =~ (^|[,\;\ ])([a-z0-9]{4}-[a-z0-9]{4})([,\;\ ]|$) ]]; then
  scrapy crawl datos_gov -a dataset_urls="$SOURCE" -a out_dir="$RAW_DIR"
else
  scrapy crawl datos_gov -a query="$SOURCE" -a out_dir="$RAW_DIR"
fi

python spark_clean.py --input "$RAW_DIR/*.csv" --dataset "$DATASET" --output "$CLEAN_DIR"
