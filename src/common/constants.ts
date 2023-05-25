export const NATS_SERVER : string = process.env.NATS_SERVER || "localhost";

/////////////////////////////// Dedupe Constants ///////////////////////////////

// ttl is the window in which duplicate messages will be prevented from publishing in milliseconds (1s default)
export const DEDUPE_TTL_MS : number = Math.abs(parseInt(process.env.DEDUP_TTL_MS) || 1000);

// LIFO ensures that the last duplicate message in is the message published to the next subject in the chain
// future functionality will allow for the Message to be augmented prior to generating a checksum
export const DEDUPE_LIFO : boolean = process.env.DEDUPE_LIFO == "true";

// allows for message independent TTL via message headers
export const X_DEDUPE_TTL_MS : string = process.env.X_DEDUPE_TTL_MS || "X-DEDUPE-TTL-MS";