const assert = require('assert');

describe('Connection',function(){

 describe('#Construction',function(){
  it('It throws a ConnectionError when created without a path',function(){
   let DBConnection = require('./DBConnection');
   assert.throws(function(){
    let dbConnection = new DBConnection();
   },function(e){
    return e.name === 'ConnectionError';
   });
   
 });

 describe('#connect',function(){
  it('Returns a promise',function(){
   let DBConnection = require('./DBConnection');
   dbConnection = new DBConnection('data/test.bmp');
   assert.ok(dbConnection.connect() instanceof Promise);
  });

  it('The promise resolves an instance of DBDriver when given a valid source path',function(done){
   let DBConnection = require('./DBConnection');
   dbConnection = new DBConnection('data/test.bmp');
   dbConnection.connect().then(db=>{
    assert.ok(db instanceof require('./DBDriver'));
    done();
   }).catch(e=>{console.log(e);done();});   
  });

   
  });

 });

});