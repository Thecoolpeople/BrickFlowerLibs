/*
  ____  _____   ______          _______ ______ _____  _____  ____  
 |  _ \|  __ \ / __ \ \        / / ____|  ____|  __ \|  __ \|  _ \ 
 | |_) | |__) | |  | \ \  /\  / / (___ | |__  | |__) | |  | | |_) |
 |  _ <|  _  /| |  | |\ \/  \/ / \___ \|  __| |  _  /| |  | |  _ < 
 | |_) | | \ \| |__| | \  /\  /  ____) | |____| | \ \| |__| | |_) |
 |____/|_|  \_\\____/   \/  \/  |_____/|______|_|  \_\_____/|____/ 

a good handler for using the browser internal database, uses IndexedDB internally
*/

BF.browserdb = function(key){
    let T = this
    //init
    T.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    T.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction
    T.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

    if (!T.indexedDB) {
        console.error("Your browser does not support a stable version of IndexedDB.")
        return false
    }

    //internal function
    let internal = {
        /**
         * open the db connection
         * @param {string} key The name of the DB
         * @param {string/integer} The version of the DB (can be empty if you wannot upgrade the db)
         * @param {function} onupgrade The function with (event, db) as parameter if you want to use spezific function which should be called at upgrade
         */
        openDB: async function(key, version, onupgrade){
            if(T.db) T.db.close()
            T.db = await new Promise(function(resolve, reject){
                let request = T.indexedDB.open(key, version)

                //db handler
                request.onerror = function(event) {
                    alert("Not allowed to use IndexedDB!");
                    reject(event)
                };
                request.onsuccess = function(event) {
                    let database = request.result;
                    resolve(database)
                };
                request.onupgradeneeded = function(event){
                    onupgrade?onupgrade(event, request.result):""
                }
            })
        },
        /**
         * create a full ObjectStore in the DB and update the version automatically
         * @param {string} store_name
         * @param {object} options The options for creating the store
         */
        createObjectStore: async function(store_name, options = {keyPath: 'id', autoIncrement: true}){
            let version = T.db.version + 1
            await this.openDB(key, version, function(event, db){
                db.createObjectStore(store_name, options);
            })
        },
        /**
         * delete a full ObjectStore in the DB and update the version automatically
         * @param {string} store_name
         */
        deleteObjectStore: async function(store_name){
            let version = T.db.version + 1
            await this.openDB(key, version, function(event, db){
                db.deleteObjectStore(store_name);
            })
        },
        /**
         * get the Object store for insert / delete / ...
         * @param {string} store_name
         * @param {string} mode either "readonly" or "readwrite"
         * @return {IDBObjectStore} the store itself
         */
        getObjectStore: function(store_name, mode) {
            var tx = T.db.transaction(store_name, mode);
            return tx.objectStore(store_name);
        },
        /**
         * clear the whole Object store
         * @param {string} store_name
         */
        clearObjectStore: async function(store_name){
            let store = this.getObjectStore(store_name, 'readwrite');
            return await new Promise(function(resolve, reject){
                let reqest = store.clear();
                reqest.onsuccess = function(event) {
                    resolve(true)
                };
                reqest.onerror = function (event) {
                    reject(event)
                };
            })
        },
    }
    
    T.init = async function(){
        await internal.openDB(key)
        console.log(T.db)
    }

    //user funcs
    T.store_getAll = function(){
        return [...T.db.objectStoreNames]
    }
    T.store_create = async function(storeName, options){
        return internal.createObjectStore(storeName, options)
    }
    T.store_delete = async function(storeName){
        return internal.deleteObjectStore(storeName)
    }
    T.store_clear = async function(storeName){
        return internal.clearObjectStore(storeName)
    }

    T.entry_add = async function(storeName, item){
        let store = internal.getObjectStore(storeName, "readwrite")
        return new Promise(function(resolve, reject){
            let request = store.add(item)
            //db handler
            request.onerror = function(event) {
                alert("Not allowed to use IndexedDB->ObjectStore->add()!");
                reject(event)
            };
            request.onsuccess = function(event) {
                let entries = request.result;
                resolve(entries)
            };
        })
    }
    T.entry_delete = async function(storeName, id){
        let store = internal.getObjectStore(storeName, "readwrite")
        return new Promise(function(resolve, reject){
            let request = store.delete(id)
            //db handler
            request.onerror = function(event) {
                alert("Not allowed to use IndexedDB->ObjectStore->delete()!");
                reject(event)
            };
            request.onsuccess = function(event) {
                let entries = request.result;
                resolve(entries)
            };
        })
    }
    T.entry_getAll = async function(storeName, option, count){
        let store = internal.getObjectStore(storeName, "readwrite")
        return new Promise(function(resolve, reject){
            let request = store.getAll(option, count)
            
            //db handler
            request.onerror = function(event) {
                alert("Not allowed to use IndexedDB->ObjectStore->getAll()!");
                reject(event)
            };
            request.onsuccess = function(event) {
                let entries = request.result;
                resolve(entries)
            };
        })
    }

    return this
}