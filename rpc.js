"use strict"

require("./unhandled")

var
  fs= require("fs"),
  path= require("path"),
  promisify= require("es6-promisify"),
  protobufjs= require("protobufjs")

var readFile= promisify(fs.readFile)

var loads= ["gogoproto/gogo", "storage/storagepb/kv", "etcdserver/etcdserverpb/rpc"]
var protos= loads.map(function(load){
	return readFile(__dirname + "/proto/"+ load+ ".proto", "utf8")
})

function load(builder){
	var cursor= 0
	builder= builder|| new protobufjs.Builder()
	function loop(){
		return protos[cursor].then(function(_proto){
			console.log("got", loads[cursor])
			protobufjs.loadProto(_proto, builder, loads[cursor]+ ".proto")
			++cursor
			if(cursor < protos.length){
				return loop()
			}
			return builder
		})
	}
	return loop()
}
var proto= load()

module.exports= proto
Object.defineProperty(module.exports, "load", {
	value: load
})

loads.forEach(function(load, i){
	var
	  name= path.basename(load),
	  value= protos[i]
	Object.defineProperty(module.exports, name, {
		value: value
	})
})
