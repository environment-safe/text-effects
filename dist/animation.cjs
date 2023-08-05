/* global $element:false */
/*
 * textillate.js
 * http://jschr.github.com/textillate
 * MIT licensed
 *
 * Copyright (C) 2012-2013 Jordan Schroter
 */
//import 'animate.css';
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Textillate = void 0;
const isInEffect = effect => {
  return /In/.test(effect) || $.inArray(effect, $.fn.textillate.defaults.inEffects) >= 0;
};
const isOutEffect = effect => {
  return /Out/.test(effect) || $.inArray(effect, $.fn.textillate.defaults.outEffects) >= 0;
};
const stringToBoolean = str => {
  if (str !== 'true' && str !== 'false') return str;
  return str === 'true';
};

// custom get data api method
const getData = node => {
  const attrs = node.attributes || [];
  const data = {};
  if (!attrs.length) return data;
  attrs.forEach(function (i, attr) {
    var nodeName = attr.nodeName.replace(/delayscale/, 'delayScale');
    if (/^data-in-*/.test(nodeName)) {
      data.in = data.in || {};
      data.in[nodeName.replace(/data-in-/, '')] = stringToBoolean(attr.nodeValue);
    } else if (/^data-out-*/.test(nodeName)) {
      data.out = data.out || {};
      data.out[nodeName.replace(/data-out-/, '')] = stringToBoolean(attr.nodeValue);
    } else if (/^data-*/.test(nodeName)) {
      data[nodeName.replace(/data-/, '')] = stringToBoolean(attr.nodeValue);
    }
  });
  return data;
};
const shuffle = o => {
  for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};
const animate = ($t, effect, cb) => {
  $t.addClass('animated ' + effect).css('visibility', 'visible').show();
  $t.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
    $t.removeClass('animated ' + effect);
    cb && cb();
  });
};
const animateTokens = ($tokens, options, cb) => {
  var count = $tokens.length;
  if (!count) {
    cb && cb();
    return;
  }
  if (options.shuffle) $tokens = shuffle($tokens);
  if (options.reverse) $tokens = $tokens.toArray().reverse();
  $tokens.forEach(function (i, t) {
    var $token = $(t);
    function complete() {
      if (isInEffect(options.effect)) {
        $token.css('visibility', 'visible');
      } else if (isOutEffect(options.effect)) {
        $token.css('visibility', 'hidden');
      }
      count -= 1;
      if (!count && cb) cb();
    }
    var delay = options.sync ? options.delay : options.delay * i * options.delayScale;
    $token.text() ? setTimeout(function () {
      animate($token, options.effect, complete);
    }, delay) : complete();
  });
};
const $ = selector => {
  const contents = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
  const instance = new Proxy(contents, {
    get(target, prop, receiver) {
      console.log('!!!', target);
      console.log(prop, target[prop], target[0][prop]);
      if (target[prop]) {
        //allow access to collection members
        return target[prop];
      }
      if (typeof target[0][prop] === 'function') {
        return (...args) => {
          return Array.from(target).map(item => {
            return item[prop](...args);
          });
        };
      } else {
        return Array.from(target).map(item => {
          return item[prop];
        });
      }
    },
    set(target, prop, value) {
      target.forEach((item, index) => {
        target[index][prop] = value;
      });
      return true;
    }
  });
  return instance;
};
class Textillate {
  static defaults = {
    selector: '.texts',
    loop: false,
    minDisplayTime: 2000,
    initialDelay: 0,
    in: {
      effect: 'fadeInLeftBig',
      delayScale: 1.5,
      delay: 50,
      sync: false,
      reverse: false,
      shuffle: false,
      callback: function () {}
    },
    out: {
      effect: 'hinge',
      delayScale: 1.5,
      delay: 50,
      sync: false,
      reverse: false,
      shuffle: false,
      callback: function () {}
    },
    autoStart: true,
    inEffects: [],
    outEffects: ['hinge'],
    callback: function () {},
    type: 'char'
  };
  constructor(element, options = {}) {
    this.element = $(element);
    this.$texts = this.element.querySelectorAll(options.selector).reduce((agg, list) => {
      return agg.concat(Array.from(list));
    }, []);
    console.log('>>', this.element.querySelectorAll(options.selector), this.$texts);
    if (!this.$texts.length) {
      const texts = document.createElement('ul');
      texts.setAttribute('class', 'texts');
      const item = document.createElement('li');
      item.innerHTML = 'FOO';
      this.element.innerHTML = '';
      this.element.appendChild(texts);
      this.$texts = $(texts);
    }
    this.$texts.forEach(text => {
      //console.log(text, this.$texts);
      //text.style.display = 'none';
    });
    this.$current = document.createElement('ul');
    this.$current.innerHTML = this.$texts.querySelector(':first-child').innerHTML;
    this.element.insertBefore(this.$current, this.element.firstChild[0]);
    if (isInEffect(options.in.effect)) {
      this.$current.style.visibility = 'hidden';
    } else if (isOutEffect(options.out.effect)) {
      this.$current.style.visibility = 'visible';
    }
    this.setOptions(options);
    this.timeoutRun = null;
    setTimeout(() => {
      this.options.autoStart && this.start();
    }, this.options.initialDelay);
  }
  setOptions(options) {
    this.options = options;
  }
  triggerEvent(name) {
    var e = $.Event(name + '.tlt');
    $element.trigger(e, this);
    return e;
  }
  in(index, cb) {
    index = index || 0;
    var $elem = this.$texts.find(':nth-child(' + ((index || 0) + 1) + ')'),
      options = $.extend(true, {}, this.options, $elem.length ? getData($elem[0]) : {}),
      $tokens;
    $elem.addClass('current');
    this.triggerEvent('inAnimationBegin');
    $element.attr('data-active', $elem.data('id'));
    this.$current.html($elem.html()).lettering('words');

    // split words to individual characters if token type is set to 'char'
    if (this.options.type == 'char') {
      this.$current.find('[class^="word"]').css({
        'display': 'inline-block',
        // fix for poor ios performance
        '-webkit-transform': 'translate3d(0,0,0)',
        '-moz-transform': 'translate3d(0,0,0)',
        '-o-transform': 'translate3d(0,0,0)',
        'transform': 'translate3d(0,0,0)'
      }).each(function () {
        $(this).lettering();
      });
    }
    $tokens = this.$current.find('[class^="' + this.options.type + '"]').css('display', 'inline-block');
    if (isInEffect(options.in.effect)) {
      $tokens.css('visibility', 'hidden');
    } else if (isOutEffect(options.in.effect)) {
      $tokens.css('visibility', 'visible');
    }
    this.currentIndex = index;
    animateTokens($tokens, options.in, function () {
      this.triggerEvent('inAnimationEnd');
      if (options.in.callback) options.in.callback();
      if (cb) cb(this);
    });
  }
  out(cb) {
    var $elem = this.$texts.find(':nth-child(' + ((this.currentIndex || 0) + 1) + ')'),
      $tokens = this.$current.find('[class^="' + this.options.type + '"]'),
      options = $.extend(true, {}, this.options, $elem.length ? getData($elem[0]) : {});
    this.triggerEvent('outAnimationBegin');
    animateTokens($tokens, options.out, function () {
      $elem.removeClass('current');
      this.triggerEvent('outAnimationEnd');
      $element.removeAttr('data-active');
      if (options.out.callback) options.out.callback();
      if (cb) cb(this);
    });
  }
  start(index) {
    setTimeout(function () {
      this.triggerEvent('start');
      (function run(index) {
        this.in(index, function () {
          var length = this.$texts.children().length;
          index += 1;
          if (!this.options.loop && index >= length) {
            if (this.options.callback) this.options.callback();
            this.triggerEvent('end');
          } else {
            index = index % length;
            this.timeoutRun = setTimeout(function () {
              this.out(function () {
                run(index);
              });
            }, this.options.minDisplayTime);
          }
        });
      })(index || 0);
    }, this.options.initialDelay);
  }
  stop() {
    if (this.timeoutRun) {
      clearInterval(this.timeoutRun);
      this.timeoutRun = null;
    }
  }
}
exports.Textillate = Textillate;