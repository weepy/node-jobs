var redis = require("redis")

function Runner(opts) {
  this.opts = opts
  opts.context.eval = eval
  this.runningJob = false
}

Runner.fn = Runner.prototype;

Runner.fn.setJobRunners = function(jobRunners) {
  this.jobRunners = jobRunners
}

Runner.fn.start = function() {
  var self = this
  this.timer = setInterval(function() {
    self.checkForJobs()
  }, 100)
}

Runner.fn.checkForJobs = function() {
  if(this.runningJob)
    return false
  .
  var job = client.findJob();
  if(job)
    this.runJob(job)
}

Runner.runJob = function(jobData) {
  this.runningJob = true
  var klass = this.jobRunners[jobData.klass]
  var jobRunner = new klass(jobData);
  var self = this
  jobRunner.onComplete = function(result) {
    self.jobComplete(jobData, result)
  }
  jobRunner.run(jobData)
}

Runner.fn.jobComplete = function(jobData, result) {
  this.runningJob = false
}


