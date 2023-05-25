# Nats.io Deduplication Subscriber

> This repository is purely for reference and is illustrative in it is purpose. Please do not use in production as is, use this as a guide
or starting point for a production level implementation.


This project illustrates the use of [Nats.io](https://nats.io/) to perform a "server-wide" or "targeted" message deduplication strategy using [Nats.io built-in Subject Wildcards](https://docs.nats.io/nats-concepts/subjects#wildcards). In most pub/sub architectures there is a need for message deduplication based on TTL, as in *"duplicate messages arriving within the same timeframe should only invoke subscribers once"*. Not only does this implementation provide this capability via filtering but dynamically through message headers as well.

> What will be seen in this example is a generic subscriber filtering on "dedupe.>". If a NATS Subject named "**us.east.regional**" is the target subject for deduplication, posting to "**dedupe.us.east.regional**" will deduplicate based on a TTL (default 1s) and post to "**us.east.regional**" in a FIFO fashion (this can be modified, see below).

## Prerequisites

Before you continue, ensure you have met the following requirements:

* [Nats Server](https://docs.nats.io/running-a-nats-service/introduction/installation#downloading-a-release-build) or [Nats Docker Server](https://hub.docker.com/_/nats) installed and running
    * If installing the Go Server, [Go](https://go.dev/doc/install) must be installed
* [nats-cli](https://github.com/nats-io/natscli#installation) installed
    * go will need to be installed via [Chocolatey](https://community.chocolatey.org/packages/golang) or [Brew](https://formulae.brew.sh/formula/go)
* NodeJS v18 or higher installed
* Npm installed

## Environment Variables

This repository uses dotenv, feel free to create a .env file to override other aspects of the program.

* NATS_SERVER : The Nats server that will be facilitating Pub-Sub (defaults to  **localhost**)
* DEDUPE_TTL_MS : window in which duplicate messages will be prevented from publishing in milliseconds (defaults to **1s**)
* DEDUPE_LIFO : ensures that the last duplicate message in is the message published (defaults to **false**)
* X_DEDUPE_TTL_MS : NATS message header Key for message independent TTL (defaults to **X_DEDUPE_TTL_MS**)


## Running the Application

1) 'cd' to the root of this repository (where it was cloned)
1) **OPTIONAL** Create a file in the root named **.env**
    * Add environment variables above if needed
1) run **npm install** from the command line
1) open a terminal to the root of this repository and run :
    * **npm run dedupe**
    * _allow the subscription a few additional seconds to bind, 503 errors may be experienced during this binding time_
1) open another terminal to the root of this repository and run :
    * **nats subscribe us.east.regional**
    * _allow the subscription a few additional seconds to bind, 503 errors may be experienced during this binding time_
1) open another terminal to the root of this repository and run :
    * **nats-dedup-subscriber-proxy % nats publish dedupe.us.east.regional 'Some random information'**
        * message independent TTL can be set by doing the following
        * **nats publish dedupe.us.east.regional 'Some random information' -H X-DEDUPE-TTL-MS:5000**
    * _allow the subscription a few additional seconds to bind, 503 errors may be experienced during this binding time_

## Visualize

### Sending multiple messages quickly
```bash
user@computer nats-dedup-subscriber-proxy % nats publish dedupe.us.east.regional 'Chemical Spill on Level 15'
22:25:49 Published 26 bytes to "dedupe.us.east.regional"

user@computer nats-dedup-subscriber-proxy % nats publish dedupe.us.east.regional 'Chemical Spill on Level 15'
22:25:50 Published 26 bytes to "dedupe.us.east.regional"

user@computer nats-dedup-subscriber-proxy % nats publish dedupe.us.east.regional 'Chemical Spill on Level 15'
22:25:50 Published 26 bytes to "dedupe.us.east.regional"

user@computer nats-dedup-subscriber-proxy % nats publish dedupe.us.east.regional 'Chemical Spill on Level 15'
22:25:51 Published 26 bytes to "dedupe.us.east.regional"

user@computer nats-dedup-subscriber-proxy % nats publish dedupe.us.east.regional 'Chemical Spill on Level 15'
22:25:51 Published 26 bytes to "dedupe.us.east.regional"

user@computer nats-dedup-subscriber-proxy % nats publish dedupe.us.east.regional 'Chemical Spill on Level 15'
22:25:51 Published 26 bytes to "dedupe.us.east.regional"

user@computer nats-dedup-subscriber-proxy % nats publish dedupe.us.east.regional 'Chemical Spill on Level 15'
22:25:52 Published 26 bytes to "dedupe.us.east.regional"
```

### Resulting Deduplication
```bash
user@computer nats-validation-proxy-api % nats subscribe us.east.regional
22:25:39 Subscribing on us.east.regional 

[#1] Received on "us.east.regional"
Chemical Spill on Level 15
```


## Notes
* JetStream does provide [time-scoped](https://nats.io/blog/new-per-subject-discard-policy/#cant-you-do-that-already) deduplication. However as to the granularity and flexibility of JetStream, more information is needed. This solution is also applicable for those not using JetStream
* The TTL is a **SLIDING** TTL, where a new message resets the deduplication timeout
* Matching is performed using the **MD5** checksum on the NATS Message UInt8Array (which allow for checksum on all types JSON,string,number, protobuff)
* Use **&&** between duplicate commands to push multiple messages
* This repository is heavily commented to provide context as to what and why, if in VS Code feel free to collapse all comments if they are obtrusive
    * On Mac -> Press <kbd>&#8984;</kbd> + <kbd>K</kbd> then <kbd>&#8984;</kbd> + <kbd>/</kbd> 
    * On Windows & Linux -> Press <kbd>Ctrl</kbd> + <kbd>K</kbd> then <kbd>Ctrl</kbd> + <kbd>/</kbd> 