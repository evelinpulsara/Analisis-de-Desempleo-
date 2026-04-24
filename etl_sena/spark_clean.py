import argparse
import os
import re
import shutil
from pyspark.sql import SparkSession, functions as F, types as T
from unidecode import unidecode


def normalize_col(name: str) -> str:
    name = unidecode(name.strip().lower())
    name = re.sub(r"[^a-z0-9]+", "_", name)
    name = re.sub(r"_+", "_", name).strip("_")
    return name


def safe_divide(num_col, den_col):
    return F.when((F.col(den_col).isNull()) | (F.col(den_col) == 0), F.lit(None)).otherwise(F.col(num_col) / F.col(den_col))


def cast_if_exists(df, cols, target_type):
    for c in cols:
        if c in df.columns:
            df = df.withColumn(c, F.col(c).cast(target_type))
    return df


def trim_strings(df):
    for field in df.schema.fields:
        if isinstance(field.dataType, T.StringType):
            df = df.withColumn(field.name, F.trim(F.col(field.name)))
    return df


def parse_dates(df, cols):
    for c in cols:
        if c in df.columns:
            cleaned = F.regexp_replace(F.trim(F.col(c).cast("string")), r'^"|"$', "")
            df = df.withColumn(
                c,
                F.coalesce(
                    F.to_date(cleaned, "yyyy-MM-dd"),
                    F.to_date(cleaned, "dd/MM/yyyy"),
                    F.to_date(cleaned, "MM/dd/yyyy"),
                ),
            )
    return df


def clean_common(df):
    renamed = df
    for old in df.columns:
        renamed = renamed.withColumnRenamed(old, normalize_col(old))

    renamed = trim_strings(renamed)
    renamed = renamed.dropDuplicates()
    return renamed


def clean_desercion(df):
    df = clean_common(df)
    num_cols = [
        "codigo_regional", "codigo_centro", "identificador_unico_ficha", "codigo_programa",
        "version_programa", "total_aprendices_matriculados", "desertores_ano_actual", "periodo"
    ]
    df = cast_if_exists(df, num_cols, "double")
    df = parse_dates(df, ["fecha_inicio_ficha", "fecha_terminacion_ficha"])
    required = [c for c in ["identificador_unico_ficha", "fecha_inicio_ficha", "total_aprendices_matriculados"] if c in df.columns]
    if required:
        df = df.dropna(subset=required)
    if "desertores_ano_actual" in df.columns and "total_aprendices_matriculados" in df.columns:
        df = df.withColumn("tasa_desercion", safe_divide("desertores_ano_actual", "total_aprendices_matriculados"))
    return df


def clean_certificacion(df):
    df = clean_common(df)
    num_cols = [
        "codigo_regional", "codigo_centro", "identificador_unico_ficha", "codigo_programa",
        "codigo_departamento_curso", "codigo_municipio_curso", "total_aprendices_masculinos",
        "total_aprendices_femeninos", "gran_total_total_aprendices", "periodo"
    ]
    for c in df.columns:
        if c.startswith("tipo_poblacion") or c.startswith("total_") or c in ["afrocolombianos", "palenqueros", "raizales", "rom", "despojo", "amenaza", "herido"]:
            num_cols.append(c)
    df = cast_if_exists(df, sorted(set(num_cols)), "double")
    df = parse_dates(df, ["fecha_inicio_ficha", "fecha_terminacion_ficha"])
    if "gran_total_total_aprendices" in df.columns:
        if "total_aprendices_femeninos" in df.columns:
            df = df.withColumn("participacion_femenina", safe_divide("total_aprendices_femeninos", "gran_total_total_aprendices"))
        if "total_aprendices_masculinos" in df.columns:
            df = df.withColumn("participacion_masculina", safe_divide("total_aprendices_masculinos", "gran_total_total_aprendices"))
    return df


def clean_agencia_empleo(df):
    df = clean_common(df)
    num_cols = [
        "id", "numero_de_inscritos_2019", "numero_de_inscritos_2020",
        "participacion_2019", "participacion_2020", "variacion_2020_vs_2019", "contribucion_a_la_variacion"
    ]
    for c in [c for c in df.columns if "participacion" in c or "variacion" in c or "contribucion" in c or "numero_de_inscritos" in c]:
        num_cols.append(c)
    # Limpieza de porcentaje con espacios raros
    for c in sorted(set(num_cols)):
        if c in df.columns:
            df = df.withColumn(c, F.regexp_replace(F.col(c).cast("string"), ",", "."))
            df = df.withColumn(c, F.regexp_replace(F.col(c), r"[^0-9\.-]", "").cast("double"))
    return df


def clean_planta_entidad(df):
    df = clean_common(df)
    num_like = [c for c in df.columns if c.startswith("cantidad_") or c in ["longitud", "latitud"]]
    num_like += [c for c in ["codigo_sigep", "ano"] if c in df.columns]
    for c in sorted(set(num_like)):
        if c in df.columns:
            df = df.withColumn(c, F.regexp_replace(F.col(c).cast("string"), ",", "."))
            df = df.withColumn(c, F.regexp_replace(F.col(c), r"[^0-9\.-]", "").cast("double"))
    if "longitud" in df.columns and "latitud" in df.columns:
        df = df.filter(F.col("longitud").isNotNull() & F.col("latitud").isNotNull())
    return df


def is_windows_hadoop_error(exc: Exception) -> bool:
    text = str(exc).lower()
    patterns = [
        "winutils.exe",
        "hadoop_home and hadoop.home.dir are unset",
        "windowsproblems",
    ]
    return any(p in text for p in patterns)


def reset_output_path(path: str):
    if os.path.isdir(path):
        shutil.rmtree(path)
    elif os.path.exists(path):
        os.remove(path)
    os.makedirs(path, exist_ok=True)


def write_with_pandas_fallback(clean_df, output_path: str, output_csv_path: str | None = None):
    pdf = clean_df.toPandas()

    reset_output_path(output_path)
    pdf.to_parquet(os.path.join(output_path, "part-00000.parquet"), index=False)

    if output_csv_path:
        reset_output_path(output_csv_path)
        pdf.to_csv(os.path.join(output_csv_path, "part-00000.csv"), index=False, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Ruta de entrada CSV o patrón glob")
    parser.add_argument("--dataset", required=True, choices=["desercion", "certificacion", "agencia_empleo", "planta_entidad"])
    parser.add_argument("--output", required=True, help="Ruta de salida parquet")
    parser.add_argument("--output_csv", required=False, help="Ruta opcional de salida CSV")
    args = parser.parse_args()

    spark = (
        SparkSession.builder
        .appName(f"etl_{args.dataset}")
        .config("spark.sql.session.timeZone", "America/Bogota")
        .config("spark.sql.ansi.enabled", "false")
        .getOrCreate()
    )

    df = (
        spark.read
        .option("header", True)
        .option("multiLine", True)
        .option("escape", '"')
        .option("encoding", "UTF-8")
        .csv(args.input)
    )

    if args.dataset == "desercion":
        clean_df = clean_desercion(df)
    elif args.dataset == "certificacion":
        clean_df = clean_certificacion(df)
    elif args.dataset == "agencia_empleo":
        clean_df = clean_agencia_empleo(df)
    else:
        clean_df = clean_planta_entidad(df)

    clean_df.show(10, truncate=False)
    try:
        clean_df.write.mode("overwrite").parquet(args.output)
        if args.output_csv:
            clean_df.coalesce(1).write.mode("overwrite").option("header", True).csv(args.output_csv)
    except Exception as exc:
        if is_windows_hadoop_error(exc):
            print("ADVERTENCIA: fallo de Hadoop/Winutils en Windows; usando fallback pandas/pyarrow para escritura.")
            write_with_pandas_fallback(clean_df, args.output, args.output_csv)
        else:
            raise

    spark.stop()


if __name__ == "__main__":
    main()
