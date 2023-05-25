import { Msg } from "nats";
import { DEDUPE_LIFO, DEDUPE_TTL_MS, X_DEDUPE_TTL_MS } from "./constants.ts";


export interface SearchFunc {
    (source: string, subString: string): boolean;
  }

export const dedupeCache : Map<string,NodeJS.Timeout> = new Map<string,NodeJS.Timeout>();

// this function creates the timeout used to publish event when the TTL has elapsed
function setDedupeTimeout(checksum : string, msg : Msg, handler : (msg : Msg)=>void) : void {
    
    // allow for message independent TTL with environment TTL as a fallback
    const dedupeTimoutInMs : number = Math.abs(parseInt(msg.headers?.get(X_DEDUPE_TTL_MS)) || DEDUPE_TTL_MS);

    // note* this is a NodeJS.timeout object which allows for "refresh()" ability
    dedupeCache.set(
        checksum, 
        setTimeout(()=>{
            handler(msg);
            // remove this checksum on timeout to allow the next occurance to start cleared
            dedupeCache.delete(checksum);
        },dedupeTimoutInMs)
    )
}

export function dedupe(checksum : string, msg : Msg, handler : (msg : Msg)=>void) : void {
    if (!dedupeCache.has(checksum)) {
        // this is the first ti
        setDedupeTimeout(checksum,msg,handler);
    } else {
        const timeout : NodeJS.Timeout = dedupeCache.get(checksum);
        // this functionality is for a future implementation where JSON Path include and excludes will apply to the checksum
        if (!DEDUPE_LIFO) {
            // FIFO 
            // this will ensure that only the first message is published, by resetting the EXISTING timeout
            timeout.refresh();
        } else {
            // LIFO 
            // this will ensure that the last message recieved will be the message published
            clearTimeout(timeout);
            // create a new timeout with the current message 
            setDedupeTimeout(checksum,msg,handler);
        }
    }
}



