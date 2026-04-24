# ETL con Scrapy + PySpark para datos de datos.gov.co

Este proyecto implementa un ETL reutilizable:

1. Extract: Scrapy descarga CSV desde `datos.gov.co`.
2. Transform: PySpark estandariza columnas, limpia tipos y calcula metricas.
3. Load: guarda salida limpia en Parquet y opcionalmente CSV.

## Estructura

- `scrapy.cfg`
- `sena_etl/`
  - `items.py`
  - `pipelines.py`
  - `settings.py`
  - `spiders/datos_gov_spider.py`
- `spark_clean.py`
- `run_etl.sh`
- `requirements.txt`

## Datasets soportados

- `desercion`
- `certificacion`
- `agencia_empleo`
- `planta_entidad`

## Fuentes base definidas

- Desercion de la formacion profesional integral: `https://www.datos.gov.co/Trabajo/DESERCION-DE-LA-FORMACI-N-PROFESIONAL-INTEGRAL/u4ze-bi7k/about_data`
- Cantidad de empleos y tipos de planta por entidad: `https://www.datos.gov.co/Funci-n-p-blica/Cantidad-de-empleos-y-tipos-de-planta-por-entidad/fvq4-wwtz/about_data`
- Certificacion de la formacion profesional integral: `https://www.datos.gov.co/Trabajo/CERTIFICACI-N-DE-LA-FORMACI-N-PROFESIONAL-INTEGRAL/28vu-5tx7/about_data`
- Total nacional inscritos en la agencia publica de empleo: `https://www.datos.gov.co/Trabajo/Total-Nacional-inscritos-en-la-agencia-p-blica-de-/8pqf-rmzr`

Resource IDs equivalentes:

- `u4ze-bi7k`
- `fvq4-wwtz`
- `28vu-5tx7`
- `8pqf-rmzr`

## Instalacion

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Extraccion

El spider `datos_gov` acepta 3 formas de entrada:

1. `query` (busqueda en datos.gov.co)
2. `dataset_url` o `dataset_urls` (una o varias URLs separadas por coma, punto y coma o salto de linea)
3. `resource_id` o `resource_ids` (ID Socrata, por ejemplo `u4ze-bi7k`)

Ejemplo con una URL:

```bash
scrapy crawl datos_gov \
  -a dataset_url="https://www.datos.gov.co/Trabajo/DESERCION-DE-LA-FORMACI-N-PROFESIONAL-INTEGRAL/u4ze-bi7k/about_data" \
  -a out_dir="data/raw/desercion"
```

Ejemplo con varias URLs:

```bash
scrapy crawl datos_gov \
  -a dataset_urls="https://www.datos.gov.co/Trabajo/DESERCION-DE-LA-FORMACI-N-PROFESIONAL-INTEGRAL/u4ze-bi7k/about_data,https://www.datos.gov.co/Funci-n-p-blica/Cantidad-de-empleos-y-tipos-de-planta-por-entidad/fvq4-wwtz/about_data,https://www.datos.gov.co/Trabajo/CERTIFICACI-N-DE-LA-FORMACI-N-PROFESIONAL-INTEGRAL/28vu-5tx7/about_data,https://www.datos.gov.co/Trabajo/Total-Nacional-inscritos-en-la-agencia-p-blica-de-/8pqf-rmzr" \
  -a out_dir="data/raw/multi"
```

Ejemplo con resource IDs:

```bash
scrapy crawl datos_gov \
  -a resource_ids="u4ze-bi7k,fvq4-wwtz,28vu-5tx7,8pqf-rmzr" \
  -a out_dir="data/raw/multi"
```

## Limpieza con Spark

```bash
python spark_clean.py \
  --input "data/raw/desercion/*.csv" \
  --dataset desercion \
  --output data/clean/desercion
```

## Pipeline completo

`run_etl.sh` recibe `query`, URL o `resource_id` como primer argumento:

```bash
bash run_etl.sh \
  "https://www.datos.gov.co/Trabajo/CERTIFICACI-N-DE-LA-FORMACI-N-PROFESIONAL-INTEGRAL/28vu-5tx7/about_data" \
  certificacion \
  data/raw/certificacion \
  data/clean/certificacion
```

## Reglas de limpieza

### Comunes

- normalizacion de nombres de columnas
- trim de strings
- conversion de fechas
- conversion de numericos
- eliminacion de duplicados

### Desercion

- `tasa_desercion = desertores_ano_actual / total_aprendices_matriculados`

### Certificacion

- `participacion_femenina = total_aprendices_femeninos / gran_total_total_aprendices`
- `participacion_masculina = total_aprendices_masculinos / gran_total_total_aprendices`

### Agencia de empleo

- limpieza de columnas de participacion y variacion

### Planta por entidad

- limpieza de columnas de cantidad y coordenadas
