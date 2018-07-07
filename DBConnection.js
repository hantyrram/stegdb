const DBDriver = require('./DBDriver');

class ConnectionError extends Error{
 constructor(message){
  super(message);
  this.name = 'ConnectionError';
 
 }
}

/**
 * This class serves as an entry point to the database.
 * 
 * Connection class accepts a path to the media file that would serve as database, checks the path if it is
 * an existing and accessible file.
 * @param {String} pathToFile - The path to the source of the file that will serve as a database e.g. an image file
 */
class Connection{
 constructor(pathToFile){
  if(pathToFile === undefined || typeof pathToFile !== 'string') 
   throw new ConnectionError('Invalid path');
  //else
  this.source = pathToFile;
 }

 /**
  * Checks if the source file exists, and is accessible.
  * @return {Promise} Which resolves to an initialzied DBDriver instance if the Connection.source is a valid
  * path and is accessible. Connection.connect() must be called to get the DBDriver instance.
  */
 connect(){
  let self = this;
  return new Promise((resolve,reject)=>{
   
   let initializedDB;

   if(this.source){
    let fs = require('fs');
    //Check File Access and Existence
    fs.access(this.source,fs.constants.R_OK && fs.constants.W_OK,(err)=>{
     if(err){
       if(err.code === 'ENOENT'){
         reject(new ConnectionError('Image File Not Found'));
       }else if(err.code === 'EPERM'){
         reject(new ConnectionError('No Permission to read or write to file!'));
       }else{
         reject(err);
       }
     }
     //pass the database file source to the DBDriver
     let db = new DBDriver(self.source);
     //intialize the db, then resolve connect() with the initialized db
     db.initialize().then((initializedDB)=>{
      resolve(initializedDB);
     }).catch((e)=>{
      //error during initialization? just left error up
      reject(e);
     }); 
     
    });
   } 
  });
 } 
}

module.exports = Connection;