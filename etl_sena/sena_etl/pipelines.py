import os
import re
from urllib.parse import urlparse

import requests


class DownloadCsvPipeline:
    @staticmethod
    def _extract_resource_id(*values):
        for value in values:
            if not value:
                continue
            match = re.search(r"(?<![a-z0-9])([a-z0-9]{4}-[a-z0-9]{4})(?![a-z0-9])", str(value), flags=re.IGNORECASE)
            if match:
                return match.group(1).lower()
        return None

    @staticmethod
    def _slugify(value):
        text = re.sub(r"[^a-zA-Z0-9]+", "_", str(value or "").strip()).strip("_").lower()
        return text or "dataset"

    def _build_filename(self, item, csv_url):
        resource_id = item.get("resource_id") or self._extract_resource_id(csv_url, item.get("dataset_url"))
        if resource_id:
            return f"{resource_id}.csv", resource_id

        parsed = urlparse(csv_url)
        basename = os.path.basename(parsed.path) or "dataset.csv"
        if basename.lower() in {"rows.csv", "download"}:
            basename = f"{self._slugify(item.get('dataset_title'))}.csv"
        if not basename.lower().endswith(".csv"):
            basename = f"{basename}.csv"
        return basename, resource_id

    @staticmethod
    def _unique_path(path):
        if not os.path.exists(path):
            return path

        base, ext = os.path.splitext(path)
        counter = 1
        while True:
            candidate = f"{base}_{counter}{ext}"
            if not os.path.exists(candidate):
                return candidate
            counter += 1

    def process_item(self, item, spider):
        csv_url = item.get("csv_url")
        if not csv_url:
            spider.logger.warning("No se encontro csv_url para %s", item.get("dataset_title"))
            return item

        out_dir = spider.out_dir
        os.makedirs(out_dir, exist_ok=True)

        filename, resource_id = self._build_filename(item, csv_url)
        local_path = self._unique_path(os.path.join(out_dir, filename))

        spider.logger.info("Descargando %s -> %s", csv_url, local_path)
        with requests.get(csv_url, stream=True, timeout=120) as response:
            response.raise_for_status()
            with open(local_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

        if resource_id:
            item["resource_id"] = resource_id
        item["local_path"] = local_path
        return item
