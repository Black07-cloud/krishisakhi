const BASE_URL =
  process.env.DATA_GOV_MARKET_API_URL ||
  "https://api.data.gov.in/resource";

const RESOURCE_ID =
  process.env.DATA_GOV_MARKET_RESOURCE_ID ||
  "9ef84268-d588-465a-a308-a864a43d0070";

const API_KEY = process.env.DATA_GOV_API_KEY;

const normalizeKey = (key) => {
  return String(key || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
};

const findField = (record, possibleNames = []) => {
  const entries = Object.entries(record || {});

  for (const name of possibleNames) {
    const normalizedName = normalizeKey(name);

    const match = entries.find(
      ([key]) => normalizeKey(key) === normalizedName
    );

    if (match) {
      return match[1];
    }
  }

  return null;
};

const normalizeNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const cleaned = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : null;
};

const normalizeDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const normalizeRecord = (record, index) => {
  const crop = findField(record, [
    "commodity",
    "crop",
    "commodityname",
    "cropname",
  ]);

  const variety = findField(record, [
    "variety",
    "varietyname",
  ]);

  const market = findField(record, [
    "market",
    "marketname",
    "marketname",
    "mandi",
  ]);

  const district = findField(record, [
    "district",
    "districtname",
  ]);

  const state = findField(record, [
    "state",
    "statename",
  ]);

  const minPrice = normalizeNumber(
    findField(record, [
      "minprice",
      "minimumprice",
      "min_price",
    ])
  );

  const maxPrice = normalizeNumber(
    findField(record, [
      "maxprice",
      "maximumprice",
      "max_price",
    ])
  );

  const modalPrice = normalizeNumber(
    findField(record, [
      "modalprice",
      "modal_price",
      "modal",
    ])
  );

  const priceDate = normalizeDate(
    findField(record, [
      "arrivaldate",
      "pricedate",
      "date",
      "reporteddate",
    ])
  );

  const unit =
    findField(record, [
      "unit",
      "priceunit",
    ]) || "quintal";

  const sourceRecordId =
    findField(record, [
      "id",
      "recordid",
      "record_id",
    ]) || `${crop || "unknown"}-${market || "unknown"}-${priceDate || index}`;

  return {
    crop: crop ? String(crop).trim() : null,

    variety: variety
      ? String(variety).trim()
      : null,

    market: market
      ? String(market).trim()
      : null,

    district: district
      ? String(district).trim()
      : null,

    state: state
      ? String(state).trim()
      : null,

    minPrice,
    maxPrice,
    modalPrice,

    unit: String(unit).trim(),

    priceDate,

    source: "government",

    sourceName: "data.gov.in",

    sourceRecordId: String(sourceRecordId),
  };
};

export const fetchGovernmentMarketPrices = async ({
  offset = 0,
  limit = 100,
  filters = {},
} = {}) => {
  if (!API_KEY) {
    throw new Error(
      "DATA_GOV_API_KEY is not configured"
    );
  }

  const safeOffset = Math.max(
    Number(offset) || 0,
    0
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 100, 1),
    1000
  );

  const params = new URLSearchParams();

  params.set("api-key", API_KEY);
  params.set("format", "json");
  params.set("offset", String(safeOffset));
  params.set("limit", String(safeLimit));

  /*
   * data.gov.in supports API-side filtering
   * depending on the resource configuration.
   *
   * We intentionally add only known filters.
   */

  if (filters.state) {
    params.set(
      "filters[state]",
      String(filters.state)
    );
  }

  if (filters.district) {
    params.set(
      "filters[district]",
      String(filters.district)
    );
  }

  if (filters.market) {
    params.set(
      "filters[market]",
      String(filters.market)
    );
  }

  if (filters.crop) {
    params.set(
      "filters[commodity]",
      String(filters.crop)
    );
  }

  const url =
    `${BASE_URL}/${RESOURCE_ID}?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Government market API failed: ${response.status} ${text}`
    );
  }

  const payload = await response.json();

  const records = Array.isArray(payload.records)
    ? payload.records
    : [];

  const normalizedRecords = records
    .map(normalizeRecord)
    .filter((record) => {
      return (
        record.crop &&
        record.market &&
        record.minPrice !== null &&
        record.maxPrice !== null &&
        record.modalPrice !== null
      );
    });

  return {
    total: Number(payload.total) || normalizedRecords.length,

    count: normalizedRecords.length,

    records: normalizedRecords,

    raw: payload,
  };
};

export default fetchGovernmentMarketPrices;