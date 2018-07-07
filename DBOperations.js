/**
 * bind the DBDriver instance as 'this' to all of the operation functions
 */


/**
* 
* @param {Collection} collection 
* @param {Object} document 
*/
function insert(collection,document){
 document._id = collection._idGenerator.next().value;//generate id
 //if the steganographer data has no collection of collection.name, get the curried collections initial data which is empty array
 if(this.sData[collection.name] === undefined){
   this.sData[collection.name] = collection.documents;
 }
 this.sData[collection.name].push(document);
 return this;
}


/***** Helper Functions ********/

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