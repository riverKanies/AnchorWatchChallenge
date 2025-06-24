

    function dropKeys () {
            localStorage.clear()
        
    }

      // Usage with async/await
    async function getKey(key) {
            let value = localStorage.getItem(key)
            if (value === '') value = null
            return value
    }
    //localStorage.setItem('currentThreadId', 'thread_KewytWhKsWFgULz0M6NBVJfI')
    
      async function saveKey (key, value) {
            let val = value
            if (!value) val = ''
            localStorage.setItem(key, val)
      }
    
    
    
      export {
        dropKeys,
        saveKey,
        getKey
      }
    