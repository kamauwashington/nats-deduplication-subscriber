import { natsConnection } from "./connection.ts";
import { dedupeCache } from "./dedupe.cache.ts";

// this is used to load SIG/s through default
export default 1;

// SIG/s clean up routine
['SIGINT', 'SIGTERM', 'SIGQUIT']
    .forEach(signal => process.on(signal, () => {
        // though the process will exit if a connection cannot be established, practice defensive programming
        if (natsConnection) {
            natsConnection.close();
        }
        console.log("\nNats Connection Closed.");

        // the dedupeCache needs to be emptied and timeouts cleared to prevent memory leaks
        for (const item in dedupeCache.values()) {
            clearTimeout(item);
        }
        console.log("Dedupe Cache cleared.")

        // exit needs to be called as ExpressJS does not stop listening on SIGINT in all cases, keeping the process open
        process.exit();
    }));
