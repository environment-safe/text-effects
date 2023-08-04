/* global describe:false, it:false */
import { chai } from '@environment-safe/chai';
import { Lettering } from '../src/index.mjs';
const should = chai.should();

describe('module', ()=>{
    describe('performs a simple test suite', ()=>{
        it('loads', async ()=>{
            should.exist(Lettering);
        });
    });
});

