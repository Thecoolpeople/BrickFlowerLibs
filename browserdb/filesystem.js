/*
  ______ _ _       _____           _                 
 |  ____(_) |     / ____|         | |                
 | |__   _| | ___| (___  _   _ ___| |_ ___ _ __ ___  
 |  __| | | |/ _ \\___ \| | | / __| __/ _ \ '_ ` _ \ 
 | |    | | |  __/____) | |_| \__ \ ||  __/ | | | | |
 |_|    |_|_|\___|_____/ \__, |___/\__\___|_| |_| |_|
                          __/ |                      
                         |___/                       
a internal file system implementation for BrickFlower
*/

BF.filesystem = function(key="FS"){
    let db
    //initialize the database
    this.init = async function(){
        db = new BF.browserdb("fs"+key)
        await db.init()
        if(db.store_getAll().length == 0){
            await db.store_create("fs", [{name:"path", unique:true}])
            await db.store_create("fsData")
        }
    }

    this.write = async function(path, content, info, date=new Date()){
        //check if file exists
        let files = await db.entry_search("fs", function(entry){
            return entry.path == path
        })
        if(files.length != 0){
            //update file
            let item = {path: path, date: date}
            if(info)
                item.info = info
            let id = []
            await db.entry_put("fs", item, async function(entry){
                if(entry.path == path){
                    id[id.length] = entry.id
                    return true
                }
                return false
            })
            return db.entry_put("fsData", {content: content}, function(entry2){
                return id.indexOf(entry2.id) != -1
            })
        }else{
            //create file
            await db.entry_add("fs", {path: path, date: date, info: info})
            return await db.entry_add("fsData", {content: content})
        }
    }
    this.read = async function(path){
        let files = await db.entry_search("fs", function(entry){
            return entry.path == path
        })
        if(files.length == 0)
            return undefined
        return (await db.entry_search("fsData", function(entry){
            return entry.id == files[0].id
        }))[0].content
    }
    this.delete = async function(path){
        let files = await db.entry_search("fs", function(entry){
            return entry.path == path
        })
        let id = files[0].id
        db.entry_delete("fs", id)
        db.entry_delete("fsData", id)
    }
    this.createFolder = async function(path){
        return this.write(path, null, "Folder")
    }
    this.deleteFolder = async function(path){
        return this.delete(path)
    }
    this.fileinfo = async function(path){
        let files = await db.entry_search("fs", function(entry){
            return entry.path == path
        })
        if(files.length != 0)
            return files[0].fileinfo
        return undefined
    }
    this.getFiles = async function(path=""){
        if(path == ""){
            return db.entry_getAll("fs")
        }
        return db.entry_search("fs", function(entry){
            return entry.path.indexOf(path) == 0
        })
    }

    return this
}