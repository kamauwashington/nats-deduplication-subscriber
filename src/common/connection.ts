import { NatsConnection, connect } from "nats";
import { NATS_SERVER } from "./constants.ts";
 
let connection : NatsConnection;
try {
    // establish a connection to the Nats server
    connection = await connect({servers:NATS_SERVER});
    console.log(`Connection to Nats server "${NATS_SERVER}" established.`)
} catch (error) {
    // on connection error exit the process
    console.error(`A connection to the Nats server "${NATS_SERVER}" could not be established.`);
    process.exit(1);
}

export const natsConnection = connection;
