/*
 * Copyright (C) 2023 Abbey Hawk Sparrow
 */
'use strict';

import { Lettering, select } from './text.mjs';

export class TextAnimation{
    static IN = 'in';
    static OUT = 'out';
    static defaultStepOptions = {
        delay: 100,
        context: 'letters'
    };
    static defaultAnimationOptions = {
        effect: 'bounce',
        speed: 'faster',
    };
    
    static create = (selector, animationOptions)=>{
        return new TextAnimation(selector, animationOptions);
    };
    
    static staggered = async (selector, passedAnimationOptions, passedStepOptions)=>{
        const stepOptions = Object.assign({}, 
            passedStepOptions, 
            TextAnimation.defaultStepOptions
        );
        const animationOptions = Object.assign({}, 
            TextAnimation.defaultAnimationOptions,
            passedAnimationOptions, 
        );
        const elements = select(selector);
        const resolutions = [];
        let index = 0;
        elements.forEach((el)=>{
            const animations = new TextAnimation(el);
            animations.lettering[stepOptions.context]();
            
            const lettering = new Lettering([el]);
            lettering[stepOptions.context]();
            const objects = el.querySelectorAll('*');
            objects.forEach((subEl)=>{
                resolutions.push(new Promise((resolve, reject)=>{
                    try{
                        subEl.style.minWidth = '0.3em';
                        if(stepOptions.fromHidden){
                            subEl.style.display = 'none';
                        }
                        setTimeout(()=>{
                            subEl.style.display = 'inline-block';
                            //el.addEventListener("animationstart", ()=>{}, false);
                            const endFn = ()=>{
                                subEl.removeEventListener('animationend', endFn);
                                resolve(lettering);
                            };
                            subEl.addEventListener('animationend', endFn, false);
                            subEl.classList.add(`animate__${'animated'}`);
                            subEl.classList.add(`animate__${animationOptions.effect}`);
                            subEl.classList.add(`animate__${animationOptions.speed}`);
                        }, stepOptions.delay * index);
                    }catch(ex){
                        reject(ex);
                    }
                }));
                index++;
            });
        });
        return await Promise.all(resolutions);
    };
    
    constructor(selector, passedStepOptions, animationOptions){
        this.lettering = new Lettering(selector);
        this.ready = new Promise((resolve)=>resolve());
        this.stepOptions = passedStepOptions;
        this.elements = select(selector);
        if(animationOptions) this.ready = this.animate(animationOptions);
    }
    
    async animate(passedAnimationOptions){
        const stepOptions = Object.assign({}, 
            TextAnimation.defaultStepOptions,
            this.stepOptions
        );
        const animationOptions = Object.assign({}, 
            TextAnimation.defaultAnimationOptions,
            passedAnimationOptions, 
        );
        const resolutions = [];
        let index = 0;
        this.elements.forEach((el)=>{
            const animations = new TextAnimation(el);
            animations.lettering[stepOptions.context]();
            
            const lettering = new Lettering([el]);
            lettering[stepOptions.context]();
            const objects = el.querySelectorAll('*');
            objects.forEach((subEl)=>{
                resolutions.push(new Promise((resolve, reject)=>{
                    try{
                        subEl.style.minWidth = '0.3em';
                        if(stepOptions.fromHidden){
                            subEl.style.display = 'none';
                        }
                        setTimeout(()=>{
                            subEl.style.display = 'inline-block';
                            //el.addEventListener("animationstart", ()=>{}, false);
                            const endFn = ()=>{
                                subEl.removeEventListener('animationend', endFn);
                                resolve(lettering);
                            };
                            subEl.addEventListener('animationend', endFn, false);
                            subEl.classList.add(`animate__${'animated'}`);
                            subEl.classList.add(`animate__${animationOptions.effect}`);
                            subEl.classList.add(`animate__${animationOptions.speed}`);
                        }, stepOptions.delay * index);
                    }catch(ex){
                        reject(ex);
                    }
                }));
                index++;
            });
        });
    }
}