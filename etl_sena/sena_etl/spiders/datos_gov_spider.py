import re
from urllib.parse import quote_plus, unquote, urlparse

import scrapy

from sena_etl.items import DatasetFileItem


class DatosGovSpider(scrapy.Spider):
    name = "datos_gov"
    allowed_domains = ["datos.gov.co", "www.datos.gov.co"]

    def __init__(
        self,
        query=None,
        dataset_url=None,
        dataset_urls=None,
        resource_id=None,
        resource_ids=None,
        out_dir="data/raw",
        *args,
        **kwargs,
    ):
        super().__init__(*args, **kwargs)
        self.query = query
        self.out_dir = out_dir
        self.dataset_urls = self._split_values(dataset_urls)
        if dataset_url:
            self.dataset_urls.append(dataset_url)
        self.resource_ids = self._split_values(resource_ids)
        if resource_id:
            self.resource_ids.append(resource_id)

    @staticmethod
    def _split_values(raw_values):
        if not raw_values:
            return []
        return [value.strip() for value in re.split(r"[,\n;]", raw_values) if value.strip()]

    @staticmethod
    def extract_resource_id(value):
        if not value:
            return None
        match = re.search(r"(?<![a-z0-9])([a-z0-9]{4}-[a-z0-9]{4})(?![a-z0-9])", value, flags=re.IGNORECASE)
        if match:
            return match.group(1).lower()
        return None

    @staticmethod
    def build_csv_url(resource_id):
        return f"https://www.datos.gov.co/api/views/{resource_id}/rows.csv?accessType=DOWNLOAD"

    @staticmethod
    def title_from_url(url, fallback="dataset"):
        parsed = urlparse(url)
        parts = [part for part in parsed.path.split("/") if part]
        if not parts:
            return fallback

        resource_id = DatosGovSpider.extract_resource_id(url)
        if resource_id and resource_id in parts:
            idx = parts.index(resource_id)
            if idx > 0:
                return unquote(parts[idx - 1]).replace("-", " ").strip()

        return unquote(parts[-1]).replace("-", " ").strip()

    def build_direct_item(self, resource_id, dataset_url=None, dataset_title=None):
        return DatasetFileItem(
            dataset_title=dataset_title or resource_id,
            dataset_url=dataset_url or f"https://www.datos.gov.co/d/{resource_id}",
            resource_id=resource_id,
            csv_url=self.build_csv_url(resource_id),
        )

    def start_requests(self):
        if self.resource_ids or self.dataset_urls:
            for raw_resource_id in self.resource_ids:
                resource_id = self.extract_resource_id(raw_resource_id)
                if resource_id:
                    yield self.build_direct_item(resource_id=resource_id)
                else:
                    self.logger.warning("resource_id invalido: %s", raw_resource_id)

            for dataset_url in self.dataset_urls:
                resource_id = self.extract_resource_id(dataset_url)
                if resource_id:
                    yield self.build_direct_item(
                        resource_id=resource_id,
                        dataset_url=dataset_url,
                        dataset_title=self.title_from_url(dataset_url, fallback=resource_id),
                    )
                else:
                    yield scrapy.Request(dataset_url, callback=self.parse_dataset)
            return

        if not self.query:
            raise ValueError("Debes enviar query, dataset_url(s) o resource_id(s)")

        search_url = f"https://www.datos.gov.co/browse?q={quote_plus(self.query)}"
        yield scrapy.Request(search_url, callback=self.parse_search)

    def parse_search(self, response):
        links = response.css("a::attr(href)").getall()
        dataset_links = []
        for href in links:
            if href and re.search(r"/[^/]+/[^/]+$", href):
                if href.startswith("/"):
                    href = response.urljoin(href)
                if "/browse" not in href and href not in dataset_links:
                    dataset_links.append(href)

        if not dataset_links:
            self.logger.error("No se encontraron resultados para %s", self.query)
            return

        yield scrapy.Request(dataset_links[0], callback=self.parse_dataset)

    def parse_dataset(self, response):
        title = response.css("title::text").get(default="dataset").strip()
        html = response.text

        candidates = []
        for pattern in [
            r"https://www\.datos\.gov\.co/api/views/[a-z0-9\-]+/rows\.csv\?accessType=DOWNLOAD",
            r"https://datos\.gov\.co/api/views/[a-z0-9\-]+/rows\.csv\?accessType=DOWNLOAD",
            r"/api/views/[a-z0-9\-]+/rows\.csv\?accessType=DOWNLOAD",
        ]:
            matches = re.findall(pattern, html, flags=re.IGNORECASE)
            for match in matches:
                url = response.urljoin(match)
                if url not in candidates:
                    candidates.append(url)

        if not candidates:
            export_links = response.css('a[href*="rows.csv"]::attr(href), a[href*="accessType=DOWNLOAD"]::attr(href)').getall()
            for href in export_links:
                url = response.urljoin(href)
                if "rows.csv" in url and url not in candidates:
                    candidates.append(url)

        if not candidates:
            self.logger.error("No se detecto enlace CSV en %s", response.url)
            return

        resource_id = self.extract_resource_id(response.url) or self.extract_resource_id(candidates[0])
        yield DatasetFileItem(
            dataset_title=title,
            dataset_url=response.url,
            resource_id=resource_id,
            csv_url=candidates[0],
        )
