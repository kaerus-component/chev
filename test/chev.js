var should = require('should'),
    EV = require('..');

describe('Chev', function(){
  describe('instance', function(){
    var ev = new EV;

    it('should have _chev', function(){
      ev.should.be.a('object');
      ev.should.have.property('_chev');
    })

    it('should be able to mix into an object',function(){
      var obj = {test:true};

      EV(obj);

      obj.should.have.property('_chev');
      obj.should.have.property('test').and.equal(true);
    })
  })

  describe('on',function(){
    var ev = new EV;
    var t = 0;

    function test(){t++};
    
    it('should register listener',function(){
      ev.on('test',test);
      should.equal(ev.has('test'),true);
    })

    it('should not register same handler twice',function(){
      ev.on('test',test);
      var x = ev.get('test',test);
      x.should.not.be.a('array');
    })

    it('should be emittable',function(){
      ev.emit('test');
      should.equal(t,1);
    })

    it('can be turned off',function(){
      ev.off('test');
      ev.emit('test');
      should.equal(t,1);
    })

    it('can be turned on by reference',function(){
      ev.on('test',test);
      ev.emit('test');
      should.equal(t,2);
    })

    it('can be turned on by name',function(){
      ev.off('test');
      ev.emit('test');
      should.equal(t,2);
      ev.on('test','test');
      ev.emit('test');
      should.equal(t,3);
    })
  })

  describe('off',function(){
    var ev = new EV;
    var t = 0;

    function test(){t++};

    it('should turn off listener by reference',function(){
      ev.on('test',test);
      ev.emit('test');
      should.equal(t,1);

      ev.off('test',test);
      ev.emit('test');
      should.equal(t,1);
    })

    it('can be toggled on',function(){
      ev.on('test');
      ev.emit('test');
      should.equal(t,2);
    })

    it('can turn off listener by reference',function(){
      ev.off('test',test);
      ev.emit('test');
      should.equal(t,2);
    })

    it('can turn off listener by name',function(){
      ev.on('test');
      ev.emit('test');
      should.equal(t,3);

      ev.off('test','test');
      ev.emit('test');
      should.equal(t,3);
    })

  })

  describe('first',function(){
    it('should place handler first',function(){
      var ev = new EV;
      function test1(){}
      function test2(){}
      ev.on('test',test2);
      ev.first('test',test1);
      var first = ev.get('test',test1);
      first.next.on.should.equal(test2);  
    }) 
  })

  describe('last',function(){
    it('should place handler last',function(){
      var ev = new EV;
      function test1(){}
      function test2(){}
      ev.on('test',test2);
      ev.last('test',test1);
      var first = ev.get('test',test2);
      first.next.on.should.equal(test1);  
    }) 
  })

  describe('insert (before)',function(){
    it('should insert handler before at',function(){
      var ev = new EV;
      function test1(){}
      function test2(){}
      function test3(){}
      ev.on('test',test1);
      ev.on('test',test3);
      ev.insert('test','test1',test2);
      var t2 = ev.get('test',test2);
      t2.next.on.should.equal(test1);  

      ev.remove('test',test2);
      ev.insert('test','test3',test2);
      t2 = ev.get('test',test2);
      t2.next.on.should.equal(test3);
    }) 
  })

  describe('insert (after)',function(){
    it('should insert handler after at',function(){
      var ev = new EV;
      function test1(){}
      function test2(){}
      function test3(){}
      ev.on('test',test1);
      ev.on('test',test3);
      ev.insert('test','test1',test2,true);
      var t2 = ev.get('test',test2);
      t2.next.on.should.equal(test3);  

      ev.remove('test',test2);
      ev.insert('test','test3',test2,true);
      t2 = ev.get('test',test2);
      should.not.exist(t2.next);
    }) 
  })

  describe('remove',function(){
    it('should remove listeners',function(){
      var ev = new EV;

      function test1(){};
      function test2(){};
      ev.on('test',test1);
      ev.on('test',test2);
      should.equal(ev.has('test'),true);
      ev.remove('test');
      should.equal(ev.has('test'),false);
    })

    it('should remove listener by reference',function(){
      var ev = new EV;
      function test(){};
      ev.on('test',test);
      should.equal(ev.has('test'),true);
      ev.remove('test',test);
      should.equal(ev.has('test'),false);
    })

    it('should remove listener by name',function(){
      var ev = new EV;
      function test(){};
      ev.on('test',test);
      should.equal(ev.has('test'),true);
      ev.remove('test','test');
      should.equal(ev.has('test'),false);
    })

    it('should remove specified first listener',function(){
      var ev = new EV;
      function test1(){};
      function test2(){};

      ev.on('test',test1);
      ev.on('test',test2);    
      ev.remove('test',test1);
      var t1 = ev.get('test',test1);
      var t2 = ev.get('test',test2);
      should.equal(t1,undefined);
      should.equal(t2.on,test2);
    })

    it('should remove specified last listener',function(){
      var ev = new EV;
      function test1(){};
      function test2(){};

      ev.on('test',test1);
      ev.on('test',test2);    
      ev.remove('test',test2);
      var t1 = ev.get('test',test1);
      var t2 = ev.get('test',test2);
      should.equal(t1.on,test1);
      should.equal(t2,undefined);
    })

    it('should keep adjacent listeners',function(){
      var ev = new EV;
      function test1(){};
      function test2(){};
      function test3(){};

      ev.on('test',test1);
      ev.on('test',test2);
      ev.on('test',test3);
      ev.remove('test',test2);
      should.equal(ev.has('test'),true);
      var t1 = ev.get('test',test1);
      var t2 = ev.get('test',test2);
      var t3 = ev.get('test',test3);
      should.equal(t1.on,test1);
      should.equal(t2,undefined);
      should.equal(t3.on,test3);
    })
  })

  describe('emit',function(){
    it('can be used without passing arguments',function(){
      var ev = new EV;
      var a1;
      function test(arg1){a1 = arg1};
      ev.on('test',test);
      ev.emit('test');
      should.equal(a1,undefined);
    })

    it('should pass single argument',function(){
      var ev = new EV;
      var a1,a2;
      function test(arg1,arg2){a1 = arg1; a2 = arg2};
      ev.on('test',test);
      ev.emit('test','one');
      should.equal(a1,'one');
      should.equal(a2,undefined);
    })

    it('should pass multiple arguments',function(){
      var ev = new EV;
      var a1,a2,a3,a4;
      function test(arg1,arg2,arg3,arg4){a1 = arg1; a2 = arg2; a3 = arg3; a4 = arg4};
      ev.on('test',test);
      ev.emit('test','one',2,[3],{a:4});
      a1.should.equal('one');
      a2.should.equal(2);
      a3.should.eql([3]);
      a4.should.eql({a:4});
    })

    it('should call listeners in order',function(){
      var ev = new EV, t=0;
      function test1(a){t=t*a+1};
      function test2(a){t=t*a+2};

      ev.on('test',test1);
      ev.on('test',test2);
      ev.emit('test',2);
      t.should.equal(4);

      t = 0;
      ev.remove('test');
      ev.on('test',test2);
      ev.on('test',test1);
      ev.emit('test',2);
      t.should.equal(5);
    })

    it('should stop propagation if listener returns false',function(){
      var ev = new EV, t=0;
      function test1(a){t=t+a; return false};
      function test2(a){t=t+a};

      ev.on('test',test1);
      ev.on('test',test2);
      ev.emit('test',1);
      t.should.equal(1);
    })
  })

  describe('once',function(){
    it('listener should be called once',function(){
      var ev = new EV, t = 0;
      function test(){t++} 
      ev.once('test',test);
      ev.emit('test');
      t.should.equal(1);
      ev.emit('test');
      t.should.equal(1);
    })

    it('can be turned off and on',function(){
      var ev = new EV, t = 0;
      function test(){t++} 
      ev.once('test',test);
      ev.off('test',test);
      ev.emit('test');
      t.should.equal(0);
      ev.on('test',test);
      ev.emit('test');
      t.should.equal(1);
      ev.emit('test');
      t.should.equal(1);
    })

    it('should be reset by on',function(){
      var ev = new EV, t = 0;
      function test(){t++} 
      ev.once('test',test);
      ev.emit('test');
      t.should.equal(1);
      ev.on('test',test);
      ev.emit('test');
      t.should.equal(2);
      ev.emit('test');
      t.should.equal(2);
    })
  })

})  