


/**
 * STEGDB is a database driver implementation, uses the steganographer package as storage engine.
 * Uses document object model the same as mongodb, however the saved data is
 * a JSON string
 */
class StegDB{
 
   constructor(steganographer){
 
     this.s = steganographer;
     
     this.init();
   }
 
   init(){
    //get the raw data from the steganographer, this is the Object that StegDB will use as database 
     //this is the one that will be stringified during write operations
    this.sData = JSON.parse(this.s.read());
    
    let collectionNames = Object.getOwnPropertyNames(this.sData);
    
    var self = this;
    if(collectionNames.length > 0){
      collectionNames.forEach((collectionName)=>{
       if(self[collectionName] === undefined){//if the collection name is not yet a property of StegDB
        //define each collection names as property of StegDB so that StegDB.collectionName can be used
        Object.defineProperty(self,collectionName,
         {
           get : function(){
             //value = new Collection intance
             return new Collection(collectionName,self.sData[collectionName],self);
           } 
         });
       }
       
      });
    }
   }
 
   refresh(){// we had the need for this after dropping a Collection
    this.init();
   }
 
   createCollection(collectionName){
    if(this.sData[collectionName]){
     throw new Error('Collection already exist!');
    }
     //initialize collection 
     this.sData[collectionName] = [];
     //define collection name as property of StegDB
     this[collectionName] = new Collection(collectionName,this.sData[collectionName],this);
     this.s.write(JSON.stringify(this.sData));
     this.s.commit();
     
   }
 
   /**
    * 
    * @param {Collection} collection 
    * @param {Object} document 
    */
   insert(collection,document){
     
     document._id = collection._idGenerator.next().value;//generate id
 
     //if the steganographer data has no collection of collection.name, get the curried collections initial data which is empty array
     if(this.sData[collection.name] === undefined){
       this.sData[collection.name] = collection.documents;
     }
     this.sData[collection.name].push(document);
     return this;
   }
 
   /**
    * Update the first document that satisfies the filter.
    * @param {Collection} collection 
    * @param {Object} filter - the query filter
    * @param {Object} updateOperation - the update operation to apply to the filtered document
    */
   updateOne(collection,filter,updateOperation){
     let filteredDocument = this.find(collection,filter)[0];
 
 
     if(filteredDocument === undefined){
       return 0;//no record updated
     }
 
     //check the operations
     let props = Object.getOwnPropertyNames(updateOperation);
 
     //test if operators used are valid
     let operatorValidityTest = props.every((operator)=>{
       return operators.update.indexOf(operator) !== -1;
     });
 
     if(operatorValidityTest === false){
       throw new Error('Invalid Operator');//???? Tell which operator is invalid
     }
 
     props.forEach((operation)=>{
 
       switch(operation){
         //IIFE's
         case '$set': (()=>{
           //'this' in ES6 style anonymous function is the current class context
          
           for(let sDataIndex in this.sData[collection.name]){
 
             try {
               
               assert.deepStrictEqual(this.sData[collection.name][sDataIndex],filteredDocument);
               //process below if no assertion was thrown
               let theFoundDoc = this.sData[collection.name][sDataIndex];
               //apply the {$set:{field:value}} 
               let valueOfSet = updateOperation['$set'];
 
               let valueOfSetPropertyNames = Object.getOwnPropertyNames(valueOfSet);
 
               for(let i in valueOfSetPropertyNames){
                 //set the new values;
                 //we use the same property names on the foundDoc from sData and the new values(value of $set:)
                 //since Objects are passed by reference, this will update the sData
                 //???? problem is when the property on the $set:value does not exist on the original doc in database
                 //???? this will error theFoundDoc[valueOfSetPropertyNames[i]] will be undefined                
                 theFoundDoc[valueOfSetPropertyNames[i]] = valueOfSet[valueOfSetPropertyNames[i]];
               }
               
               this.s.write(JSON.stringify(this.sData));
               this.s.commit();
               this.refresh();
               //after finding one and setting the values of the doc break
               break;
 
             } catch (error) {//assertion error
               if(error.code === 'ERR_ASSERTION'){
                 continue;//loop
               }
             }
           }
 
         })()
       }
 
     });
 
     return 1;//on record updated
   }   
 
   /**
    * Deletes one record from the collection
    * @param {Collection} collection 
    * @param {Object} filter - Query Filter
    */
   deleteOne(collection,filter){ 
 
    let filteredDocument = this.find(collection,filter)[0];
 
    if(filteredDocument === undefined){
     return 0;//no record updated
    }
 
    for(let i in this.sData[collection.name]){
     
     try {     
      assert.deepStrictEqual(this.sData[collection.name][i],filteredDocument);
      this.sData[collection.name].splice(i,1);     
      this.s.write(JSON.stringify(this.sData));
      this.s.commit();
      this.refresh();
     } catch (error) {
      continue; 
     }
 
    }
   }
 
   commit(){
     try {
       this.s.write(JSON.stringify(this.sData));//adds to buffer
       this.s.commit();
       // this.refresh();
       return;
     } catch (error) {
       console.log(error);
       // throw error;
     }
   
   }
 
   /**
    * 
    * @param {Collection} collection - To select from
    * @return {Mixed} - An array of documents if collection is passed or the entire database if collection is not specified
    */
   selectAll(collection){
     if(collection){     
      return this.sData[collection.name];
     }
     return this.sData;
   }
 
   get collections(){
    return  Object.getOwnPropertyNames(this.sData);
   }
 
   removeCollection(collectionName){
    delete this.sData[collectionName];
    this.s.write(JSON.stringify(this.sData));
    this.s.commit();
   }
 
   /**
    * Finds the queryFilter from the collection.
    * @param {Mixed} collection - Collection or string
    * @param {Object} filter - The Same as the query filter document in MongoDb {field1:value,<field2>:{$in:['value1','value2']}}}
    * @return {Array} - Array of docs, or an empty array if queryFilter is not satisfied
    */
   find(collection,filter){
     //prepare the documents
    let documents;
    
       //support for collection.name as parameter
       if(typeof collection === 'string'){
        documents = this.sData[collection];
       }
    
       if(collection instanceof Collection){
        documents = collection.documents;
       }
 
      return queryFilter(documents,filter);
   }
 
 
   /**
    * Removes the collection from the database
    * @param {Collection} collection 
    */
   drop(collection){
 
    if(this.sData[collection.name] !== undefined){
     delete this.sData[collection.name];
    }
    this.s.write(JSON.stringify(this.sData));
    this.s.commit();
    // this.refresh();
   }
   
   dropDB(){//used only to clear everything
    this.s.write(JSON.stringify({}));
    this.s.commit();
   }
 
   /**
    * Creates a snapshot of the data
    */
   createSnapshot(){
    let fs = require('fs');
    let fname = `data/snap${Date.now()}.bck`;
    let ws = fs.createWriteStream(fname);
    let base64Buffer = new Buffer.from(this.s.read());
    ws.write(base64Buffer.toString('base64'));
   }
 
   /**
    * !!!! Experimental, loads data from back up
    */
   loadFromBackup(fname){
 
    let fs = require('fs');
    fs.readFile(fname,function(err,data){
     let b64 = new Buffer.from(data.toString(),'base64');
 
    });
   }
 
 }//StegDB
       
 
 class Collection{
   
   constructor(name,arr = [],StegDB){
     this.name = name;
     this.documents = arr;
     Object.defineProperty(this,'_idGenerator',{value: _idGenerator(_retrieveLastId(this.documents)),enumerable:false,configurable:false,writable:false});
     Object.defineProperty(this,'StegDB',{value: StegDB, enumerable:false, writable:false});
     Object.defineProperty(this,'insert',{value: StegDB.insert.bind(StegDB,this)});//use StegDB's insert,curry in the collection
     Object.defineProperty(this,'selectAll',{value: StegDB.selectAll.bind(StegDB,this)});
     Object.defineProperty(this,'remove',{value: StegDB.removeCollection.bind(StegDB,this)});
     Object.defineProperty(this,'find',{value: StegDB.find.bind(StegDB,this)});
     Object.defineProperty(this,'drop',{value: StegDB.drop.bind(StegDB,this)});
     Object.defineProperty(this,'updateOne',{value: StegDB.updateOne.bind(StegDB,this)});
     Object.defineProperty(this,'deleteOne',{value: StegDB.deleteOne.bind(StegDB,this)});
   }
 }
 
 Collection.insert = insert.bind(dbDriver,collection);
 
 // Internal functions
 
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
 
 
   /**
    * Filters a collection. Must provide early binding using the collection instance. E.g. queryFilter.bind(aCollectionInstance);
    * @param {Object} filter - Object {<fieldname>: <value>,<fieldname2>:{<operator>:<values>}}
    * @return {Array} of documents that satisfies the filter 
    */
   function queryFilter(documents,filter){
     if(!documents){
       return [];//no documents return an empty array
     }
 
     //get the property names of the filter,the field names to test
     //???? See how we can use operators for now query filter on depth = 1
     let filterFields = Object.getOwnPropertyNames(filter);
     
     if(filterFields.length === 0){ // if queryFilter = {},select all
      return documents;
     }
  
     //checks if all fields are valid
     //???? we should have some sort of Schema where to validate
    
     let result = [];
     //{label:'facebook',value:'xxxx'} should return all with label = facebook &&,
     //reduce the document unto documents that satisfies the queryFilter
     let indices = [];//indices of the docs that satisfies the queryFilter
     
     documents.forEach((doc,index)=>{
  
      //check each property
      let truthArray = [];//saves each comparison of doc and query filter field values
      filterFields.forEach((fieldName)=>{
        truthArray.push(Boolean(doc[fieldName]) === Boolean(filter[fieldName]));
      });
 
  
      //only return doc if queryFilter is satisfied
      let truthTestPassed = truthArray.reduce((accumulator,currentValue)=>{
            return accumulator = accumulator && currentValue;//all MUST be true 
      });
  
      if(truthTestPassed){//save the current doc to the result array
        result.push(doc);
      }
  
     });
 
     //docs if queryFilter satisfied, or an empty array
     return result;
 
   }

   module.exports = StegDB;