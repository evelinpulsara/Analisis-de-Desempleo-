import scrapy


class DatasetFileItem(scrapy.Item):
    dataset_title = scrapy.Field()
    dataset_url = scrapy.Field()
    resource_id = scrapy.Field()
    csv_url = scrapy.Field()
    local_path = scrapy.Field()
