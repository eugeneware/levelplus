var expect = require('chai').expect
  , levelup = require('levelup')
  , levelplus = require('..')
  , rimraf = require('rimraf');


describe('levelplus', function () {
  var dbPath = __dirname + '/../data/test.db'
    , db;

  beforeEach(function (done) {
    rimraf.sync(dbPath);
    db = levelplus(levelup(dbPath,
      { keyEncoding: 'utf8', valueEncoding: 'json' }));
    done();
  });

  afterEach(function (done) {
    db.close(done);
  });

  it('should be able to get and set', function (done) {
    db.put('mykey', 'myvalue', function (err) {
      if (err) return done(err);
      db.get('mykey', function (err, value) {
        if (err) return done(err);
        expect(value).to.equal('myvalue');
        done();
      });
    });
  });

  it('should be able to update a value', function (done) {
    db.put('mykey', 'myvalue', function (err) {
      if (err) return done(err);
      db.update('mykey', 'mynewvalue', function (err) {
        if (err) return done(err);
        db.get('mykey', function (err, value) {
          if (err) return done(err);
          expect(value).to.equal('mynewvalue');
          done();
        });
      });
    });
  });

  it('should be able to increment a value', function (done) {
    db.inc('mykey', 0, function (err) {
      if (err) return done(err);
        db.get('mykey', function (err, value) {
          if (err) return done(err);
          expect(value).to.equal(1);
          done();
        });
    });
  });

  it('should be able to atomically increment a value', function (done) {
    var c = 100;
    for (var i = 0; i < 100; i++) {
      db.inc('mykey', 0, function (err) {
        if (err) return done(err);
        --c || next();
      });
    }

    function next() {
      db.get('mykey', function (err, value) {
        expect(value).to.equal(100);
        done();
      });
    }
  });

  it('should be able to push to an array', function (done) {
    db.push('mykey', 42, function (err) {
      if (err) return done(err);
      db.get('mykey', function (err, value) {
        if (err) return done(err);
        expect(value).to.deep.equal([42]);
        done();
      });
    });
  });

  it('should be able to atomically push to an array', function (done) {
    var c = 100;
    for (var i = 0; i < 100; i++) {
      db.push('mykey', i, function (err) {
        if (err) return done(err);
        --c || next();
      });
    }

    function next() {
      db.get('mykey', function (err, value) {
        if (err) return done(err);
        expect(value).to.be.instanceof(Array);
        expect(value.length).to.equal(100);
        value.forEach(function (n) {
          expect(n).to.be.gte(0);
          expect(n).to.be.lte(100);
        });
        done();
      });
    }
  });

  it('should be able to add to a set', function (done) {
    db.sadd('mykey', 42, function (err) {
      if (err) return done(err);
      db.get('mykey', function (err, value) {
        if (err) return done(err);
        expect(value).to.deep.equal([42]);

        db.sadd('mykey', 42, function (err) {
          if (err) return done(err);
          db.get('mykey', function (err, value) {
            expect(value).to.deep.equal([42]);
            done();
          });
        });
      });
    });
  });

  it('should be able to add multiple items to a set', function (done) {
    db.sadd('mykey', [1, 2], function (err) {
      if (err) return done(err);
      db.get('mykey', function (err, value) {
        if (err) return done(err);
        expect(value).to.deep.equal([1, 2]);
        db.sadd('mykey', [2, 3], function (err) {
          if (err) return done(err);
          db.get('mykey', function (err, value) {
            if (err) return done(err);
            expect(value).to.deep.equal([1, 2, 3])
            done();
          });
        });
      });
    });
  });

  it('should be able to atomically add items to a set', function (done) {
    var c = 100;
    for (var i = 0; i < 100; i++) {
      db.sadd('mykey', i % 5, function (err) {
        --c || next();
      });
    }

    function next() {
      db.get('mykey', function (err, value) {
        expect(value).to.be.instanceof(Array);
        expect(value.length).to.equal(5);
        value.forEach(function (n) {
          expect(n).to.be.gte(0);
          expect(n).to.be.lt(5);
        });
        done();
      });
    }
  });

  it.only('should be able to multiply an item by two', function (done) {
    function times(multiplier, init) {
      return function (data) {
        if (data === undefined) {
          data = init;
        }

        return data*multiplier;
      };
    }

    db.update('mykey', times(2, 42), function (err) {
      if (err) return done(err);
      db.get('mykey', function (err, value) {
        if (err) return done(err);
        expect(value).to.equal(84);
        done();
      });
    });
  });
});
