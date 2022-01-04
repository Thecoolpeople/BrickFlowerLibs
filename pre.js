if(typeof BF == "undefined")
    BF = {}

//Throw InvalidArgumentException
BF.throwError = function(msg){
    let InvalidArgumentException = function(message) {
        this.message = message
        // Use V8's native method if available, otherwise fallback
        if ("captureStackTrace" in Error)
            Error.captureStackTrace(this, InvalidArgumentException)
        else
            this.stack = (new Error()).stack
    }
    InvalidArgumentException.prototype = Object.create(Error.prototype)
    InvalidArgumentException.prototype.name = "InvalidArgumentException"
    InvalidArgumentException.prototype.constructor = InvalidArgumentException

    throw new InvalidArgumentException(msg)
}

//Sandbox definition (thanks to https://blog.risingstack.com/writing-a-javascript-framework-sandboxed-code-evaluation/)
BF.sandboxProxies = new WeakMap()
//usage run ok: BF.sandbox("console.log('ok')")({console:console})
//usage run not ok: BF.sandbox("console.log('ok')")({})
BF.sandbox = function(srcString){
    function has(target, key){
        return true
    }
    function get(target, key){
        if (key === Symbol.unscopables) return undefined
            return target[key]
    }
    
    const code = new Function('sandbox', 'with (sandbox) {' + srcString + '}')
    return function (sandbox){
        if (!BF.sandboxProxies.has(sandbox)){
            const sandboxProxy = new Proxy(sandbox, {has, get})
            BF.sandboxProxies.set(sandbox, sandboxProxy)
        }
        return code(BF.sandboxProxies.get(sandbox))
    }
}