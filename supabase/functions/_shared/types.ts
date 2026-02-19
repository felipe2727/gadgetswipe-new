export interface RawGadget {
  title: string;
  description?: string;
  image_url: string;
  price_cents?: number;
  source_url: string;
  source_site: string;
  category_slug?: string;
  tags?: string[];
}

export interface ScraperResult {
  source: string;
  gadgets: RawGadget[];
  error?: string;
}
