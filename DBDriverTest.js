const assert = require('assert');

describe('DBDriver',function(){
  beforeEach(function(){
    delete require.cache[require.resolve('./DBDriver')];
    delete require.cache[require.resolve('steg')];
  });

  describe('#init()',function(){
    it('returns a DBDriver instance',function(done){
     let DBDriver = require('./DBDriver');
     let dbDriver = new DBDriver('./data/sample.bmp');
     dbDriver.init().then(db=>{
       assert(db instanceof DBDriver);
       done();
     }).catch(e=>{console.log(e);done();});    
    });
    it('Rejects when passed an invalid path',function(done){
      let DBDriver = require('./DBDriver');
      let dbDriver = new DBDriver('./data/xxxxx.bmp');
      dbDriver.init().catch(e=>{
        assert(e);
        assert.strictEqual(e.message, 'Invalid storage file path');
        done();
      });
     });
  });

  describe('#init()',function(){
    
  });
});