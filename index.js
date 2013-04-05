///////////////////////////////////////////////////////////////////////////////
// Chained Events 
// Copyright (c) 2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
///////////////////////////////////////////////////////////////////////////////


function Chev(obj){
	/* mixin */
    if(obj) {
        for(var key in Chev.prototype) {
            obj[key] = Chev.prototype[key];
        }
        obj._chev = {};
        return obj;
    }

    if(!(this instanceof Chev)) {
        return new Chev;
    }

    this._chev = {}; 
}

Chev.prototype.has = function(event){
    return !!this._chev[event];
}

Chev.prototype.first = function(event,handler){
    var ev = this._chev[event];

    if(ev) this._chev[event] = {on:handler,next:ev};
    else this._chev[event] = {on:handler};

    return this;
}

Chev.prototype.last = function(event,handler){
    var ev = this._chev[event];

    if(!ev) this._chev[event] = {on:handler};    
    
    while(ev){
        if(!ev.next) {
            ev.next = {on:handler};
            break;
        }  

        ev = ev.next; 
    }

    return this;
}

Chev.prototype.insert = function(event,at,handler,after){
    var ev = this.get(event,at,!after);

    if(ev === undefined) return this;

    if(ev){
        ev.next = {on:handler,next:ev.next};
    } else {
        ev = this._chev[event];
        this._chev[event] = {on:handler,next:ev};
    }

    return this;
}

Chev.prototype.get = function(event,handler,parent){
    var ev = this._chev[event],
        prev = null;

    if(!ev) return;
    if(!handler) return parent ? prev : ev;

    function comp(e,h){
        return e._of ? e._of === h : e === h;
    }

    if(typeof handler === 'string'){
        comp = function(e,h){
            return e._of ? e._of.name === h : e.name === h;
        }
    }

    while(ev){
        if(comp(ev.on||ev.off,handler)) return parent ? prev : ev;
        prev = ev;
        ev = ev.next;
    }

}

Chev.prototype.on = function(event,handler){
    var ev = this.get(event,handler);
    
    if(ev) {
        while(ev){
            if(!ev.on){
                ev.on = ev.off;
                ev.off = null;
            }    
            ev = !handler && ev.next;
        } 
    } else if(typeof handler==='function'){
        this.last(event,handler);
    }

    return this;
}

Chev.prototype.off = function(event,handler){
    var ev = this.get(event,handler);

    while(ev){
        if(!ev.off){
            ev.off = ev.on;
            ev.on = null;
        }    
        ev = !handler && ev.next;
    }     

    return this;
}

Chev.prototype.once = function(event,handler){
    var self = this;

    function once() {
        self.off(event,handler);
        handler.apply(self,arguments);
    }

    this.on(event, once);
    once._of = handler;

    return this;
}

Chev.prototype.remove = function(event,handler){
    var ev, prev = this.get(event,handler,true);
    
    if(prev === undefined) return this;

    if(prev) ev = prev.next;
    else ev = this._chev[event];

    while(ev){
        if(!handler) delete this._chev[event];
        else if(ev.next){
                ev.on = ev.next.on;
                ev.off = ev.next.off;
                ev.next = ev.next.next;
        } else {
            if(!prev) delete this._chev[event];
            else prev.next = null;
        }
        ev = !handler && ev.next;
    }

    return this;        
}

Chev.prototype.emit = function(event){
    var ev = this._chev[event],
        args = Array.prototype.slice.call(arguments,1);

    while(ev){   
        if(ev.on && ev.on.apply(this,args) === false) break;
        ev = ev.next;
    }

    return this;
}


module.exports = Chev;