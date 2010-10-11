simple redis backed jobs runner
---

Install
---

npm install jobs


Example
----
var jobs = require("jobs");
var runner = new jobs(client, key);

Here, client is a redis client, and key is a unique reference to your queues.  Internally it uses 3 keys: {key}_completed, {key}_queued, and {key}_errored.
To set a job, rpush to {key}_queued.

Test
---
node test.js

./redis-cli
rpush node-jobs-test_queued "{\"type\":\"log\",\"msg\":\"hello\"}"

--> this should output a log message on the server "hello"

llen node-jobs-test_queued     --> number of jobs queued
llen node-jobs-test_completed  --> number of jobs completed
llen node-jobs-test_errored    --> number of jobs errored