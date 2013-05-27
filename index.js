module.exports = function (db) {
  var locks = {};

  function lock(key) {
    var keyVal = JSON.stringify(key);
    var ret = locks[keyVal];
    locks[keyVal] = true;
    return ret;
  }

  function unlock(key) {
    delete locks[JSON.stringify(key)];
  }

  db.update = function (key, fn, cb) {
    var self = this;
    doUpdate();

    function doUpdate() {
      if (lock(key)) return setImmediate(doUpdate);

      self.get(key, function (err, data) {
        if (err && err.name !== 'NotFoundError') {
          unlock(key);
          return cb && cb(err);
        }

        var data;

        try {
          if (typeof fn === 'function') {
            data = fn(data);
          } else {
            data = fn;
          }
        } catch (e) {
          unlock(key);
          return cb && cb(err);
        }

        self.put(key, data, function (err) {
          if (err) {
            unlock(key);
            return cb && cb(err);
          }
          unlock(key);
          cb && cb(null, data);
        });
      });
    }
  };


  db.inc = function (key, init, cb) {
    function inc(data) {
      if (data === undefined) {
        data = init;
      }

      return ++data;
    }

    return this.update(key, inc, cb);
  };

  db.push = function (key, value, cb) {
    function push(data) {
      data = data || [];
      data.push(value);

      return data;
    }

    return this.update(key, push, cb);
  }

  db.sadd = function (key, value, cb) {
    function sadd(data) {
      data = data || [];
      if (!(value instanceof Array)) {
        value = [value];
      }
      value.forEach(function (item) {
        if (!~data.indexOf(item)) {
          data.push(item);
        }
      });

      return data;
    }

    return this.update(key, sadd, cb);
  }

  return db;
};
