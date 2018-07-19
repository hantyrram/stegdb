const operator = {};

const comparison = [];

const logical = [];


//equal, returns all documents with fieldname  equals to value
comparison["$eq"] = function(fieldName,comparedValue,documents){
 
 let result = documents.reduce((accumulator,currentDoc)=>{

  if(currentDoc[fieldName] === comparedValue){
    accumulator.push(currentDoc);
  }
  return accumulator;
 },[]);
 
 return result;

};

//greater than
comparison["$gt"] = function(fieldName,comparedValue,documents){
  
   let result = documents.filter((doc)=>{
    return doc[fieldName] > comparedValue;
   });

   return result;
};
//greater than or equal to
comparison["gte"]
// Matches any of the values specified in an array.
comparison["$in"]	
// Matches values that are less than a specified value.
comparison["$lt"]	
// Matches values that are less than or equal to a specified value.
comparison["$lte"]	
// Matches all values that are not equal to a specified value.
comparison["$ne"]
// Matches none of the values specified in an array.	
comparison["$nin"]

logical["$and"]

logical["$or"]

operator.comparison = comparison;

operator.logical = logical;

/**
 * 
 * @param {Array} documents - Array of documents to query
 */
function to(query,documents){
  //query = {}
  if(Object.getOwnPropertyNames(query).length === 0){
    return documents;
  }

  //get the fields of the query
  let fieldNames = Object.getOwnPropertyNames(query).filter(fieldName=>{
    return !fieldName.startsWith('$');
  });

  let result = Object.create(documents);//init

  fieldNames.forEach(fieldName=>{
    //check if the value is not an object use equality operator 
    let op;
    if(typeof query[fieldName] !== "object"){
      op = "$eq";
    }
    //invoke the comparsion operator function
    result = operator.comparison[op](fieldName,query[fieldName],result);
  });

  //reduced array of documents
  return result;

}

/**
 * Queries the documents based on the query filter
 * @param {object} query - A query document.
 */
function apply(query){
  //check if it is a valid query, allow undefined for single result query
  if(query){
    if(typeof query !== 'object') throw new Error('Operators@apply: Invalid Query');
  }
  //? check here if the operators $ are valid

  //return the to function
  return {
    to : to.bind({},query || {})
  }; //if undefined bind an empty object;
}




//usage apply(query).to(documents);

module.exports = {
  apply: apply
}