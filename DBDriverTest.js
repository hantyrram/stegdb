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
  describe('#createCollection()',function(){
    it('Adds the collection name as property of db',function(done){
      let DBDriver = require('./DBDriver');
      let dbDriver = new DBDriver('./data/sample.bmp');
      dbDriver.init().then((db)=>{
        db.createCollection('myCollection');
        assert(db.myCollection);
        done();
      }).catch(e=>{
        console.log(e);
        done();
      });
    });
  });

  describe('#insertOne()',function(){
    it('It returns an object containing the insertedId',function(done){
      let DBDriver = require('./DBDriver');
      let dbDriver = new DBDriver('./data/sample.bmp');
      dbDriver.init().then((db)=>{
        db.createCollection('myCollection');
        let result = db.myCollection.insertOne({fieldOne:'fieldOneValue',fieldTwo:'fieldTwoValue'});
        assert(result.insertedId);
        assert(typeof result.insertedId === 'number');
        assert(result.insertedId > 0);
        done();
      }).catch(e=>{
        console.log(e);
        done();
      });
    });
  });

  describe('#insertMany()',function(){
    it('It accepts arrays of documents and returns the bulkWriteResult',function(done){
      let DBDriver = require('./DBDriver');
      let dbDriver = new DBDriver('./data/sample.bmp');
      dbDriver.init().then((db)=>{
        db.createCollection('myCollection');
        let documents = [];
        documents.push({username:'user one',password:'passwordOne'});
        documents.push({username:'user two',password:'passwordTwo'});
        documents.push({username:'user three',password:'passwordThree'});
        documents.push({username:'user four',password:'passwordFour'});
        documents.push({username:'user five',password:'passwordFive'});
        
        let result = db.myCollection.insertMany(documents);
        
        let expectedNumberOfIds = 5;
        assert.strictEqual(result.insertedIds.length,expectedNumberOfIds);
        done();
      }).catch(e=>{
        console.log(e);
        done();
      });
    });
  });

  describe('#findOne()',function(){
    it('It returns a single document on the collection when called without query and projection',function(done){
      let DBDriver = require('./DBDriver');
      let dbDriver = new DBDriver('./data/sample.bmp');
      dbDriver.init().then((db)=>{
        db.createCollection('myCollection');
        let sample = db.myCollection.insertOne({fieldOne:'fieldOneValue',fieldTwo:'fieldTwoValue'});
        let result = db.myCollection.findOne();
        assert.strictEqual(result._id,sample.insertedId)
        done();
      }).catch(e=>{
        console.log(e);
        done();
      });
    });

    it('It returns a single document that satisfies the query criteria',function(done){
      let DBDriver = require('./DBDriver');
      let dbDriver = new DBDriver('./data/sample.bmp');
      dbDriver.init().then((db)=>{
        db.createCollection('myCollection');
        db.myCollection.insertOne({fieldOne:'fieldOneValue',fieldTwo:'fieldTwoValue'});//sample
        
        //sample testing concern
        let docToFind = {fieldOne:'another value 2',fieldTwo:'another value 2'};
        let insertedDocToFind = db.myCollection.insertOne({fieldOne:'another value 2',fieldTwo:'another value 2'});
        docToFind._id = insertedDocToFind.insertedId;

        db.myCollection.insertOne({fieldOne:'another value 3',fieldTwo:'another value 3'});//sample
        let result = db.myCollection.findOne({fieldOne:docToFind.fieldOne});        
        assert.deepStrictEqual(result,docToFind);
        done();
      }).catch(e=>{
        console.log(e);
        done();
      });
    });
  });



  // describe('Queries with query criterias',function(){
  //   it('It satisfies $gt query operations',function(done){
  //     let DBDriver = require('./DBDriver');
  //     let dbDriver = new DBDriver('./data/sample.bmp');
  //     dbDriver.init().then((db)=>{
  //       db.createCollection('myCollection');
  //       let sample = db.myCollection.insertOne({name:'Person Aged 34',age: 34});
  //       let sample = db.myCollection.insertOne({name:'Person Aged 37',age: 37});
  //       let sample = db.myCollection.insertOne({name:'Person Aged 12',age: 12});
  //       let result = db.myCollection.findOne();
  //       assert.strictEqual(result._id,sample.insertedId)
  //       done();
  //     }).catch(e=>{
  //       console.log(e);
  //       done();
  //     });
  //   });
  // });

  
});