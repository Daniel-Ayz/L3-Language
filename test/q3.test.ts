import { expect } from 'chai';
import { unparseL31, parseL31, parseL31Exp } from '../src/L31-ast';
import { L31ToL3 } from '../src/q3';
import { makeOk, bind, isFailure } from '../shared/result';
import { parse as p } from "../shared/parser";


describe('Q3 Tests', () => {
     it('test parse/unparse cond exp', () => {
          expect(bind(bind(p(`(cond ((> a b) (f a)) ((< a b) (g b)) (else 0))`),parseL31Exp), x=>makeOk(unparseL31(x)))).to.deep.equal(makeOk(`(cond ((> a b) (f a)) ((< a b) (g b)) (else 0))`));
     });

     it('test parse/unparse cond program', () => {
          expect(bind(parseL31(`(L31 (define c (cond ((> a b) (f a)) ((< a b) (g b)) (else 0))) (if c 3 4))`), x=>makeOk(unparseL31(x)))).to.deep.equal(makeOk(`(L31 (define c (cond ((> a b) (f a)) ((< a b) (g b)) (else 0))) (if c 3 4))`));
     });

     it('test parse wrong cond - missing else', () => {
          expect(bind(bind(p(`(cond ((> a b) (f a)) ((< a b) (g b)) )`),parseL31Exp), x=>makeOk(unparseL31(x)))).is.satisfy(isFailure);
     });

     it('test parse wrong cond - missing case', () => {
          expect(bind(bind(p(`(cond (else 0) )`),parseL31Exp), x=>makeOk(unparseL31(x)))).is.satisfy(isFailure);
     });

     it('test parse wrong cond - wrong else', () => {
          expect(bind(bind(p(`(cond ((> a b) (f a)) ((< a b) (g b)) (elsse 0))`),parseL31Exp), x=>makeOk(unparseL31(x)))).is.satisfy(isFailure);
     });

     it('trnasform cond-exp to if-exp', () => {
          expect(bind(bind(bind(p(`(cond ((> a b) (f a)) ((< a b) (g b)) (else 0))`),parseL31Exp),L31ToL3), x=>makeOk(unparseL31(x)))).to.deep.equal(makeOk(`(if (> a b) (f a) (if (< a b) (g b) 0))`));
     });

     it('trnasform cond-exp program to if-exp', () => {
          expect(bind(bind(parseL31(`(L31 (define c (cond ((> a b) (f a)) ((< a b) (g b)) (else 0))) (if c 3 4))`),L31ToL3), x=>makeOk(unparseL31(x)))).to.deep.equal(makeOk(`(L31 (define c (if (> a b) (f a) (if (< a b) (g b) 0))) (if c 3 4))`));
     });
});