(function() {
    'use strict';
    if(typeof window.CustomEvent !== 'function') {
        function CustomEvent(event, params) {
            params = params || {'bubbles': false, 'cancelable': false, 'detail': undefined};
            var e = document.createEvent('CustomEvent');
            e.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return e;
        }
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }

    
    var CustomEventTarget = function() {
        var fx = {
            'isPropagationStopped': false
            , 'listeners': {}
            , 'addEventListener': function(type, callback) {
                if(!(type in this.listeners)) {
                    this.listeners[type] = [];
                }

                this.listeners[type].push(callback);
            }
            , 'removeEventListener': function(type, callback) {
                if(type === undefined) {
                    return false;
                }

                if(callback !== undefined && (typeof callback === 'function')) {
                    for(var i = 0, len = fx.listeners[type].length; i < len; i++) {
                        if(fx.listeners[type][i] === callback) {
                            fx.listeners[type].splice(i, 1);
                            return true;
                        }
                    }
                } else {
                    delete fx.listeners[type];
                }

                return true;

            }
            , 'dispatchEvent': function(type, data) {
                var thisObj = this,
                    eventObj = new CustomEvent(type, {detail:data});

                eventObj.stopPropagation = fx.cancelCallbackTree;
                eventObj.stopImmediatePropagation = fx.cancelCallbackTree;

                for(var i = 0, len = fx.listeners[type].length; i < len; i++) {
                    if(fx.isPropagationStopped) {
                        fx.isPropagationStopped = false;
                        return;
                    }

                    this.listeners[type][i].call(thisObj, eventObj);
                }
            }
            , 'cancelCallbackTree': function() {
                fx.isPropagationStopped = true;
            }
        }

        return Object.create(fx);
    };
       
    window.CustomEventTarget = CustomEventTarget;
})();


var a = {};
var b = function() {};
var c = new CustomEventTarget();

c['prop1'] = 'prop1';

c.addEventListener('bla', function(e) {
    // e.stopPropagation();
    console.log('1st');
});

c.addEventListener('bla', function(e) {
    console.log('2nd');
})

c.dispatchEvent('bla', {'a':'b'})

c.addEventListener('click', function() {
    console.log('i was clicked');
});

c.dispatchEvent('click');

function onBla() {
    console.log('onBla');
}

c.addEventListener('onBla', onBla);
c.dispatchEvent('onBla');

c.removeEventListener('onBla', onBla);