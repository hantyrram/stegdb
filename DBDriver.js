/**
 * DBDriver is a database driver implementation much like mongod, uses the steganographer package as storage engine.
 * Uses document object model the same as mongodb, however the saved data is a JSON string instead of BSON
 */

const config = require('./config');
const StorageEngine = require(config.storage_engine);
const EventEmitter = require('events');


class DBDriver extends EventEmitter{
 constructor(pathToDataSource){  
  super();
  this.pathToDataSource = pathToDataSource;  
 }

 /**
  * Prepares the storage engine.
  * @return {Promise} - Which resolves to an initialized instance of DBDriver. This method MUST be called
  * to get the initialized instance of the DBDriver before it can be used.
  */
 async initialize(){

  let self = this;
  //returns a promise that resolved to a 'ready' storageEngine
  return new Promise((resolve,reject)=>{

   let storageEngine = new StorageEngine(self.pathToDataSource);
   storageEngine.ready(function (error,storageEngine){
    if(error){
     reject(error);
     return;
    }
    self.storageEngine = storageEngine;
    //if storageEngine.read() returns an empty string which is the default when the dataSource has no data
    //initialize the DBDriver.data to an empty object otherwise JSON.parse the data from the dataSource
    self.data = self.storageEngine.read() === ''?{}:JSON.parse(self.storageEngine.read());

    let collectionNames = Object.getOwnPropertyNames(self.data);

    //if there are no collections yet, self.data === {} resolve DBDriver with an empty data
    if(collectionsNames.length === 0){
     resolve(self);
     return;
    }
    //else add the collection names as property of the DBDriver so it can be access like so: DBDriver.collection
    //?*
    
   });
  });

}

}

module.exports = DBDriver;







