import { NatsError, Msg } from 'nats';
import { natsConnection } from './common/connection.ts';
import md5 from 'md5';
import { dedupe, dedupeCache } from './common/dedupe.cache.ts';
import signint from './common/sigint.event.ts';

// this is the prefix that this subscriber will use to filter, and will be removed on publish for proxying
const dedupePrefix : string = 'dedupe';

// subscribe to ALL subjects that begin with dedupe prefix
natsConnection.subscribe(`${dedupePrefix}.>`,{
    callback : async (err : NatsError | null, msg : Msg) => {
        // create a checksum out of the message for comparison against a Map<string,timeout>
        const checksum = md5(msg.data);

        // create a callback for the checksum TTL set by DEDUP_TTL_MS
        dedupe(checksum, msg, (msg : Msg)=>{
            // remove the dedup prefix to determine the next subject in the chain
            const nextInChainSubject : string = msg.subject.replace(RegExp(`^${dedupePrefix}.`),"");
            // this is the proxy publish, the remaining message options are set on arrival at the subject
            natsConnection.publish(nextInChainSubject,msg.data,{
                headers : msg.headers,
                reply : msg.reply
            });
        });
    }
});

// this ensures that the process.on SIGINT event is raised to clear resources
signint;








