/**
 * Mimics the MongoDB operators
 */

module.exports.update = [
  // Sets the value of a field in a document.
  '$set',
  //Removes the specified field from a document.
  '$unset'
]


module.exports.query = [
 '$in',
 '$or',
 '$eq'
]


