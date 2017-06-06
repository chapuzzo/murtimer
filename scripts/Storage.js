var Storage = function(store){
  var prefix = 'murtimer'

  var normalize = function(data){
    if (!_.isObject(data))
      return data

    return JSON.stringify(data)
  }

  var secureKey = function(key){
    return [prefix, key].join('-')
  }

  return {
    save: function(key, data){
      store.setItem(secureKey(key), normalize(data))
    },

    remove: function(key){
      store.removeItem(secureKey(key))
    },

    retrieve: function(key, defaultValue){
      var fetchedValue = store.getItem(secureKey(key))

      if (_.isNil(fetchedValue))
        return defaultValue

      return fetchedValue
    },

    json: function(key, defaultValue, callback){
      var fetchedValue = store.getItem(secureKey(key))

      if (_.isNil(fetchedValue))
        return callback(defaultValue)

      try {
        return callback(JSON.parse(fetchedValue))
      }
      catch(SyntaxError) {
        console.error('fetched value is not a valid JSON')
      }
    }
  }
}
