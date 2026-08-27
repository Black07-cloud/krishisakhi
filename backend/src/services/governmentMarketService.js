import crypto from "crypto";
import MarketPrice from "../models/MarketPrice.js";

const API_URL =
  process.env.GOVERNMENT_MARKET_API_URL ||
  "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

const API_KEY = process.env.GOVERNMENT_MARKET_API_KEY;

const toNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(
    String(value)
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, "")
  );

  return Number.isFinite(number) ? number : null;
};

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  /*
   * data.gov.in commonly returns:
   * DD/MM/YYYY
   */

  const stringValue = String(value).trim();

  const indianDateMatch = stringValue.match(
    /^(\d{2})\/(\d{2})\/(\d{4})$/
  );

  if (indianDateMatch) {
    const [, day, month, year] = indianDateMatch;

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const cleanString = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const result = String(value).trim();

  return result || null;
};

const getField = (
  record,
  possibleNames = []
) => {
  for (const name of possibleNames) {
    if (
      record[name] !== undefined &&
      record[name] !== null &&
      record[name] !== ""
    ) {
      return record[name];
    }
  }

  return null;
};

/*
 * Generate deterministic ID when Government API
 * doesn't provide a record ID.
 */
const generateSourceRecordId = ({
  crop,
  variety,
  market,
  district,
  state,
  priceDate,
}) => {
  const raw = [
    crop,
    variety,
    market,
    district,
    state,
    priceDate?.toISOString(),
  ]
    .map((value) => value || "")
    .join("|")
    .toLowerCase();

  return crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex");
};

const normalizeGovernmentRecord = (record) => {
  const crop = cleanString(
    getField(record, [
      "commodity",
      "Commodity",
      "crop",
      "Crop",
      "COMMODITY",
    ])
  );

  const variety = cleanString(
    getField(record, [
      "variety",
      "Variety",
      "VARIETY",
    ])
  );

  const market = cleanString(
    getField(record, [
      "market",
      "Market",
      "market_name",
      "Market Name",
      "MARKET",
    ])
  );

  const district = cleanString(
    getField(record, [
      "district",
      "District",
      "District Name",
      "district_name",
      "DISTRICT",
    ])
  );

  const state = cleanString(
    getField(record, [
      "state",
      "State",
      "State Name",
      "state_name",
      "STATE",
    ])
  );

  const minPrice = toNumber(
    getField(record, [
      "min_price",
      "Min Price",
      "minPrice",
      "MIN_PRICE",
    ])
  );

  const maxPrice = toNumber(
    getField(record, [
      "max_price",
      "Max Price",
      "maxPrice",
      "MAX_PRICE",
    ])
  );

  const modalPrice = toNumber(
    getField(record, [
      "modal_price",
      "Modal Price",
      "modalPrice",
      "MODAL_PRICE",
    ])
  );

  const priceDate = parseDate(
    getField(record, [
      "arrival_date",
      "Arrival Date",
      "arrivalDate",
      "price_date",
      "Price Date",
      "priceDate",
      "date",
      "Date",
    ])
  );

  /*
   * Required validation
   */

  if (!crop) {
    return null;
  }

  if (!market) {
    return null;
  }

  if (
    minPrice === null ||
    maxPrice === null ||
    modalPrice === null
  ) {
    return null;
  }

  /*
   * Never insert invalid priceDate.
   */
  if (!priceDate) {
    return null;
  }

  /*
   * Government record ID if available.
   */
  let sourceRecordId = cleanString(
    getField(record, [
      "id",
      "_id",
      "record_id",
      "recordId",
      "Record ID",
    ])
  );

  /*
   * If Government API doesn't provide an ID,
   * generate our own stable ID.
   */
  if (!sourceRecordId) {
    sourceRecordId = generateSourceRecordId({
      crop,
      variety,
      market,
      district,
      state,
      priceDate,
    });
  }

  return {
    crop,
    variety,
    market,
    district,
    state,

    minPrice,
    maxPrice,
    modalPrice,

    unit: "quintal",

    priceDate,

    source: "government",
    sourceName: "data.gov.in",
    sourceRecordId,

    isActive: true,
  };
};

export const syncGovernmentMarketPrices = async ({
  crop,
  state,
  district,
  market,
  limit = 100,
} = {}) => {
  if (!API_KEY) {
    throw new Error(
      "GOVERNMENT_MARKET_API_KEY is not configured"
    );
  }

  const url = new URL(API_URL);

  url.searchParams.set(
    "api-key",
    API_KEY
  );

  url.searchParams.set(
    "format",
    "json"
  );

  url.searchParams.set(
    "limit",
    String(
      Math.min(
        Number(limit) || 100,
        1000
      )
    )
  );

  console.log(
    "Fetching government market data..."
  );

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Government API failed: ${response.status} ${errorText}`
    );
  }

  const result = await response.json();

  const records = Array.isArray(
    result?.records
  )
    ? result.records
    : [];

  console.log(
    `Government API returned ${records.length} records`
  );

  let filteredRecords = records;

  /*
   * Application-level filters
   */

  if (crop) {
    filteredRecords =
      filteredRecords.filter(
        (record) => {
          const commodity =
            cleanString(
              getField(record, [
                "commodity",
                "Commodity",
                "crop",
                "Crop",
              ])
            );

          return (
            commodity &&
            commodity.toLowerCase() ===
              String(crop)
                .trim()
                .toLowerCase()
          );
        }
      );
  }

  if (state) {
    filteredRecords =
      filteredRecords.filter(
        (record) => {
          const recordState =
            cleanString(
              getField(record, [
                "state",
                "State",
                "State Name",
              ])
            );

          return (
            recordState &&
            recordState.toLowerCase() ===
              String(state)
                .trim()
                .toLowerCase()
          );
        }
      );
  }

  if (district) {
    filteredRecords =
      filteredRecords.filter(
        (record) => {
          const recordDistrict =
            cleanString(
              getField(record, [
                "district",
                "District",
                "District Name",
              ])
            );

          return (
            recordDistrict &&
            recordDistrict.toLowerCase() ===
              String(district)
                .trim()
                .toLowerCase()
          );
        }
      );
  }

  if (market) {
    filteredRecords =
      filteredRecords.filter(
        (record) => {
          const recordMarket =
            cleanString(
              getField(record, [
                "market",
                "Market",
                "market_name",
                "Market Name",
              ])
            );

          return (
            recordMarket &&
            recordMarket.toLowerCase() ===
              String(market)
                .trim()
                .toLowerCase()
          );
        }
      );
  }

  let fetched = 0;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const rawRecord of filteredRecords) {
    fetched++;

    const normalized =
      normalizeGovernmentRecord(
        rawRecord
      );

    if (!normalized) {
      skipped++;
      continue;
    }

    /*
     * Primary duplicate lookup:
     * Government source ID
     */
    let existing =
      await MarketPrice.findOne({
        source: "government",
        sourceName: "data.gov.in",
        sourceRecordId:
          normalized.sourceRecordId,
      });

    /*
     * Fallback duplicate lookup.
     *
     * Protects against old records created
     * before sourceRecordId was generated.
     */
    if (!existing) {
      existing =
        await MarketPrice.findOne({
          source: "government",
          crop: normalized.crop,
          market: normalized.market,
          district: normalized.district,
          state: normalized.state,
          priceDate:
            normalized.priceDate,
        });
    }

    if (existing) {
      await MarketPrice.findByIdAndUpdate(
        existing._id,
        normalized,
        {
          new: true,
          runValidators: true,
        }
      );

      updated++;
    } else {
      await MarketPrice.create(
        normalized
      );

      inserted++;
    }
  }

  return {
    fetched,
    inserted,
    updated,
    skipped,
    total: inserted + updated,
  };
};

export default syncGovernmentMarketPrices;