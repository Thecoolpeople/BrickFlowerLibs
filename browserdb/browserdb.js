/*
  ____  _____   ______          _______ ______ _____  _____  ____  
 |  _ \|  __ \ / __ \ \        / / ____|  ____|  __ \|  __ \|  _ \ 
 | |_) | |__) | |  | \ \  /\  / / (___ | |__  | |__) | |  | | |_) |
 |  _ <|  _  /| |  | |\ \/  \/ / \___ \|  __| |  _  /| |  | |  _ < 
 | |_) | | \ \| |__| | \  /\  /  ____) | |____| | \ \| |__| | |_) |
 |____/|_|  \_\\____/   \/  \/  |_____/|______|_|  \_\_____/|____/ 

a good handler for using the browser internal database, uses IndexedDB internally
*/

BF.browserdb = async function(key, version){
    //init
    this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    this.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction
    this.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

    if (!this.indexedDB) {
        console.alert("Your browser does not support a stable version of IndexedDB.")
        return false
    }

    //open db connection
    let db = await new Promise(function(resolve, reject){
        var request = this.indexedDB.open(key, version)

        //db handler
        request.onerror = function(event) {
            alert("Warum haben Sie meiner Webapp nicht erlaubt IndexedDB zu verwenden?!");
            reject(event)
        };
        request.onsuccess = function(event) {
            let database = request.result;
            resolve(database)
        };
    })

    //internal function
    this.internal = {
        /**
         * @param {string} store_name
         * @param {string} mode either "readonly" or "readwrite"
         */
        getObjectStore: function(store_name, mode) {
            var tx = db.transaction(store_name, mode);
            return tx.objectStore(store_name);
        },

        /**
         * 
         */
        clearObjectStore: function(store_name) {
            var store = getObjectStore(DB_STORE_NAME, 'readwrite');
            var req = store.clear();
            req.onsuccess = function(evt) {
                displayActionSuccess("Store cleared");
                displayPubList(store);
            };
            req.onerror = function (evt) {
                console.error("clearObjectStore:", evt.target.errorCode);
                displayActionFailure(this.error);
            };
        },
    }

    //user funcs
    
    this.createStore = function(storeName){
        db.createObjectStore(storeName, {autoIncrement: true})
    }

    this.addEntry = function(storeName, name){
        let store = this.internal.getObjectStore(storeName, "readwrite")
        store.add()
    }
}