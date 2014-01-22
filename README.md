# levelplus
Adds atomic updates to levelup database

# Installation

You can install levelplus through npm:
```
$ npm install levelplus
```

# Example

## Atomic Updates

You can do atomic upates of values using db.update with a value:
``` js
var db = levelplus(levelup(dbPath,
  { keyEncoding: 'utf8', valueEncoding: 'json' }));

db.update('mykey', 1, function (err) {
  db.update('mykey', 2, function (err) {
    db.get('mykey', function (err, value) {
      expect(value).to.equal(2);
    });
  });
});

```

## Atomic Increments

You can do atomic updates using db.inc;

``` js
var db = levelplus(levelup(dbPath,
  { keyEncoding: 'utf8', valueEncoding: 'json' }));

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
```

## Atomic Array Pushes

You can do atomic updates using db.push:

``` js
var db = levelplus(levelup(dbPath,
  { keyEncoding: 'utf8', valueEncoding: 'json' }));

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
```

## Atomic Set Addition

You can do atomic updates using db.sadd (adds to a set):

``` js
var db = levelplus(levelup(dbPath,
  { keyEncoding: 'utf8', valueEncoding: 'json' }));

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
```

## Atomic Updates Using Custom Functions

You can do atomic updates using db.update with a custom update function:

``` js
var db = levelplus(levelup(dbPath,
  { keyEncoding: 'utf8', valueEncoding: 'json' }));

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
```
