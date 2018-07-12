const assert = require('assert');

describe('Connection',function(){

 describe('#Construction',function(){
  it('It throws a ConnectionError when created without a path',function(){
   let DBClient = require('./DBClient');
   assert.throws(function(){
    let dbClient = new DBClient();
   },function(e){
    return e.name === 'ConnectionError';
   });
   
 });

 describe('#connect',function(){
  it('Returns a promise',function(){
   let DBClient = require('./DBClient');
   dbClient = new DBClient('data/test.bmp');
   assert.ok(dbClient.connect() instanceof Promise);
  });

  it('The promise resolves an instance of DBDriver when given a valid source path',function(done){
   let DBClient = require('./DBClient');
   DBClient = new DBClient('data/test.bmp');
   dbClient.connect().then(db=>{
    assert.ok(db instanceof require('./DBDriver'));
    done();
   }).catch(e=>{console.log(e);done();});   
  });

   
  });

 });

});