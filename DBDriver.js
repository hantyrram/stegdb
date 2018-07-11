/**
 * DBDriver is a database driver implementation much like mongod, uses the steganographer package as storage engine.
 * Uses document object model the same as mongodb, however the saved data is a JSON string instead of BSON
 */

const config = require('./config');
const StorageEngine = require(config.storage_engine);
const EventEmitter = require('events');

class DBDriverError extends Error{
 constructor(message){  
  super(message);
  this.name = 'DBDriverError';
 }
}

class DBDriver extends EventEmitter{
 constructor(pathToDataSource){  
  super();
  this.pathToDataSource = pathToDataSource;
  this.data = {
   collections: {}
  };
 }

 /**
  * Prepares the storage engine.
  * @return {Promise} - Which resolves to an initialized instance of DBDriver. This method MUST be called
  * to get the initialized instance of the DBDriver before it can be used.
  */
 async init(){

  let self = this;
  //returns a promise that resolved to a 'ready' storageEngine
  let storageEngine = new StorageEngine(self.pathToDataSource);

  try {
    self.storageEngine = await storageEngine.init();  
  } catch (error) {
    throw error;
  }

  if(self.storageEngine.sizeOfData !== 0){
    self.data = JSON.parse(self.storageEngine.read());
  }

  let collectionNames = Object.getOwnPropertyNames(self.data.collections);
  //if storageEngine.read() returns an empty string which is the default when the dataSource has no data
    //initialize the DBDriver.data to an empty object otherwise JSON.parse the data from the dataSource
  //if there are no collections yet, self.data === {} resolve DBDriver with an empty data
  if(collectionNames.length === 0){
   return self;
  }
  //else add the collection names as property of the DBDriver so it can be access like so: DBDriver.collection
  if(collectionNames.length > 0){
    collectionNames.forEach((collectionName)=>{
     if(self[collectionName] === undefined){//if the collection name is not yet a property of StegDB
      self.createCollection(collectionName,self.data.collections[collectionName.documents]);      
     }       
    });
  }
  return self;
 }


 /**
  * Inserts a document unto the collection 
  * @param {String} collectionName 
  * @param {Object} document - document to insert on to the collection
  * @return {Number} - the index where of the document on the collection
  */
 insert(collectionName,document){
  if(this.data.collections[collectionName] !== undefined){
   let documents = this.data.collections[collectionName];
   document._id =  _idGenerator(_retrieveLastId(documents)).next().value;//?simplify id generation
   return this.data.collections[collectionName].push(document);
  }
  throw new DBDriverError('Collection Does Not Exist');
 } 

 /**
 * 
 * @param {String} collectionName - To select from
 * @return {Array|Object} - An array of documents if collectionName is passed or the entire database if collection is not specified
 */
 selectAll(collectionName){
  if(collectionName){     
   return this.data.collections[collectionName];
  }
  return this.data.collections;
 }

 /**
  * Creates a new collection. Adds the collectionName as property of this class. So that the collection
  * is accessible as a property of this class.

  * @var {String} collectionName - The collection name
  * @var {Array} documents - Array of Objects/Documents. Default = []
  * @return {Number} - The index of the created collection
  */
 createCollection(collectionName,documents = []){

  let self = this;  

  if(self[collectionName]) throw new DBDriverError('Collection Name Already Exists');

  let thisWithNewCollection = Object.defineProperty(self,collectionName,
   {
     get : function(){
       // create a Collection object with methods borrowed from DBDriver
       self.collections[collectionName] = {}; 
       self.collections[collectionName].documents = documents;
       //curried collectionName collection.insert(document)
       self.collections[collectionName].insert = self.insert.bind(self,collectionName);
       self.collections[collectionName].selectAll = self.selectAll.bind(self,collectionName);
       return self.collections[collectionName];
     } 
   });
   
   return thisWithNewCollection.data.collections[collectionName];
 }
}

/**
 * A Collection
 * @param {String} name of the collection
 * @param {Array} objects array
 * @param {DBDriver} databaseDriver 
 */
function Collection(databaseDriver,name,objects=[]){
 this.databaseDriver = databaseDriver;
 this.name = name;
 this.documents = objects;
}

/**
 * Internal functions
 */


 
/**
 * Retrieves the last Secret ID that can be used from the secrets array.
 * The value returned
 * @param {Array} documents - The array where Secret Objects are stored
 * @return {Number} - The last used id/highest number + 1;
 */
function _retrieveLastId(documents){
 let id;

 if(documents.length === 0){
  
  id = 1;

  return id;
  
 }else{
 
  id = documents.reduce(function(accumulator,currentElement){
   if(accumulator < currentElement._id){
    accumulator = currentElement._id;		
   } 
   return accumulator;
  },0);
  
  id = id + 1;

  return id;
 }
 
}

/**
 * Generates, Yields sequential number;
 * @param {Number} index - The starting number to use when generating id;
 */ 
function  *_idGenerator(index){
  let id = index;
  while(true){
   yield id++;
  }
}




module.exports = DBDriver;







