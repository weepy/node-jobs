function JobsRunner(client, key, opts) {
  //for(var i in opts) this.opts[i] = opts[i]
  this.client = client
  this.key = key
}

JobsRunner.fn = JobsRunner.prototype;

JobsRunner.fn.opts = {}

JobsRunner.fn.setRunners = function(runners) {
  this.runners = runners
}

JobsRunner.fn.waitThenGo = function() {
  var self = this
  this.timer = setTimeout(function() {
    self.checkForJobs()
  }, 100)
}

JobsRunner.fn.stop = function() {
  this.timer = clearTimeout(this.timer)
}

JobsRunner.fn.go = JobsRunner.fn.checkForJobs = function() {
  var self =this
  this.client.lpop(this.key + "_queued", function(err, string) {
    if(err) {
      self.log("found error with client", err)      
      self.waitThenGo()
    }
    else if(!string) {
      self.waitThenGo()
    }      
    else {
      try {
        self.log("found 1 job", string)
        var data = JSON.parse(string)
        self.runJob(data)
      } catch(e) {
        self.log("failed running job: ", string, e);
        self.waitThenGo()
      }      
    }
  });  
}

JobsRunner.fn.setJobErrored = function(string, callback) {
  this.client.rpush(this.key + "_errored", string, callback);
}

JobsRunner.fn.setJobCompleted = function(string, callback) {
  this.client.rpush(this.key + "_completed", string, callback);
}

JobsRunner.fn.log = function() {
  console.log.apply(this, arguments)
}

JobsRunner.fn.runJob = function(data) {
  var self = this
  data.startedAt = new Date()/1
  self.log("running job", JSON.stringify(data))
  var type = this.runners[data.type];
  type(data, function(err, result) {
    data.completedAt = new Date() /1;
    if(err) {
      data.err = err.toString();
      self.log("errored: ", JSON.stringify(data))
      self.setJobErrored(JSON.stringify(data), function() {
        self.waitThenGo()        
      })
    } else {
      self.log("completed job", JSON.stringify(data))
      self.setJobCompleted(JSON.stringify(data), function() {
        self.waitThenGo()
      })
    }
  })
}

module.exports = JobsRunner;

