BOT_NAME = "sena_etl"

SPIDER_MODULES = ["sena_etl.spiders"]
NEWSPIDER_MODULE = "sena_etl.spiders"

ROBOTSTXT_OBEY = False
DOWNLOAD_TIMEOUT = 120
REQUEST_FINGERPRINTER_IMPLEMENTATION = "2.7"
FEED_EXPORT_ENCODING = "utf-8"
LOG_LEVEL = "INFO"

ITEM_PIPELINES = {
    "sena_etl.pipelines.DownloadCsvPipeline": 300,
}

DEFAULT_REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/123.0 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
}
