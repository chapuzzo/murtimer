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
      // store.setItem(secureKey(key), normalize(data))
      firebase.database().ref(secureKey(key)).set(data)
    },

    remove: function(key){
      store.removeItem(secureKey(key))
    },

    retrieve: function(key, defaultValue){
      firebase.database().ref(secureKey(key)).once('value', function(snapshot){
        var fetchedValue = snapshot.val()
        console.log(_.isNil(fetchedValue))

        if (_.isNil(fetchedValue))
          return defaultValue

        return fetchedValue
      })
    },

    json: function(key, defaultValue, callback){
      // var fetchedValue = store.getItem(secureKey(key))
      firebase.database().ref(secureKey(key)).once('value', function(snapshot){
        var fetchedValue = snapshot.val()

        console.log('key', key)
        console.log(fetchedValue)
        console.log(_.isNil(fetchedValue))

        if (_.isNil(fetchedValue))
          return callback(defaultValue)

        callback(fetchedValue)


        // try {
        //   return callback(JSON.parse(fetchedValue))
        // }
        // catch(SyntaxError) {
        //   console.error('fetched value is not a valid JSON')
        // }
      })
    }
  }
}
