'use strict';

/**
 * Replace line breaks in a string
 * @param  {Node} elem The element to replace line breaks on
 */
export const replaceBreaks = function (elem, hash) {
    var r = document.createTextNode(hash);
    Array.prototype.slice.call(elem.querySelectorAll('br')).forEach(function (br) {
        console.log('!!', r.cloneNode());
        elem.replaceChild(r.cloneNode(), br);
    });
};

/**
 * Wrap each letter, word, or line in a span and add attributes
 * @param  {Array} elems       The elements to wrap content in
 * @param  {String}  splitStr  The string to use as the delimiter
 * @param  {String}  className The class prefix to use for wrapped content
 * @param  {String}  after     String to add after each item
 * @param  {Boolean} breaks    If true, replace line breaks
 * @return {Array}             The elements that were wrapped
 */
export const wrap = function (hash, elems, splitStr, className, after, breaks) {
    elems.forEach(function (elem) {
        var original = elem.textContent;
        if (breaks) {
            replaceBreaks(elem, hash);
        }
        var text = elem.textContent.split(splitStr).map(function (item, index) {
            return '<span class="' + className + (index + 1) + '" aria-hidden="true">' + item + '</span>' + after;
        }).join('');
        elem.setAttribute('aria-label', original);
        elem.innerHTML = text;
    });
    return elems;
};

export const select = (context)=>{
    if(typeof context === 'string'){
        // Get all of the elements for this instantiation
        return Array.from(document.querySelectorAll(context));
    }else{
        //do it this way to include array like things like node lists
        if(context.length === null) return [context];
        return Array.isArray(context)?context:Array.from(context);
    }
};

/*!
 * Vanilla JS Lettering.js
 * A vanilla JS fork of http://letteringjs.com/ by Dave Rupert
 * (c) 2019 Chris Ferdinandi, MIT License, https://gomakethings.com
 * ported to modern es module/class syntax by Abbey Hawk Sparrow
 */
export class Lettering{
    constructor(selector){
        if(!selector) throw new Error('Please provide a valid selector');
        this.elems = select(selector);
        // Hashed string to replace line breaks with
        this.hash = 'eefec303079ad17405c889e092e105b0';
    }
    
    /**
     * Wrap each letter in a span and class
     * @return {Array} The elements that were wrapped
     */
    letters(){
        return wrap(this.hash, this.elems, '', 'char', '');
    }
    
    /**
     * Wrap each word in a span and class
     * @return {Array} The elements that were wrapped
     */
    lines(){
        return wrap(this.hash, this.elems, this.hash, 'line', '', true);
    }
    
    /**
     * Wrap each line in a span and class
     * @return {Array} The elements that were wrapped
     */
    words(){
        return wrap(this.hash, this.elems, ' ', 'word', ' ');
    }
}