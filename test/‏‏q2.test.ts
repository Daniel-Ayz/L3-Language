import fs from "fs";
import { expect } from 'chai';
import {  evalL3program } from '../imp/L3-eval';
import { Value } from "../imp/L3-value";
import { Result, bind, makeOk } from "../shared/result";
import { parseL3 } from "../imp/L3-ast";
import { listPrim} from "../imp/evalPrimitive";


const evalP = (x: string): Result<Value> =>
    bind(parseL3(x), evalL3program);


const q2: string = fs.readFileSync(__dirname + '/../src/q2.l3', { encoding: 'utf-8' });

const q2_test_string: string = `

(define empty? (lambda (x) (eq? x '() )))

(define length
    (lambda (lst)
        (if (empty? lst)
            0
            (+ 1 (length (cdr lst))))
    )
)

(define list=?
    (lambda (lst1 lst2)
        (if (and (empty? lst1) (empty? lst2))
            #t
            (if (empty? lst1)
                #f
                (if (empty? lst2)
                    #f
                    (if (and (pair? (car lst1)) (pair? (car lst2)))
                        (and (list=? (car lst1) (car lst2)) (list=? (cdr lst1) (cdr lst2)))
                        (and (eq? (car lst1) (car lst2)) (list=? (cdr lst1) (cdr lst2)))))))
    )    
)

`;

const q23_test_string: string = `

(define empty? (lambda (x) (eq? x '() )))

(define compose
    (lambda (f g)
        (lambda (x)
            (f (g x))
        )
    )
)

(define pipe
    (lambda (fs)  
        (if (empty? fs)
            (lambda (x) x)
            (compose (pipe (cdr fs)) (car fs))
        )
    )
)

(define square 
    (lambda (x) 
        (make-ok (* x x))
    )
)

(define inverse 
    (lambda (x) 
        (if (= x 0) 
            (make-error "div by 0") 
            (make-ok (/ 1 x))
        )
    )
)

(define inverse-square-inverse (pipe (list inverse (bind square) (bind inverse))))
`;


describe('Q2 Tests', () => {
    
    /**
     * Q2.1--(a) tests
     */
    it("Q21a", () => {
        expect(evalP(`(L3` + q2 + `3)`)).to.deep.equal(makeOk(3));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t (take '() 2)) (empty? t)` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t (take '() 0)) (empty? t)` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t (take (list 1 2 3) 2)) (list=? t '(1 2))` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t (take (list 1 2) 3)) (list=? t '(1 2))` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t (take-map '() (lambda (x) (* x x)) 2)) (empty? t)` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t (take-map (list 1 2 3) (lambda (x) (* x x)) 2)) (list=? t '(1 4))` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t (take-map (list 1 2 3) (lambda (x) (* x x)) 3)) (list=? t '(1 4 9))` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t (take-map (list 1 2) (lambda (x) (* x x)) 3)) (list=? t '(1 4))` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t (take-filter '() (lambda (x) (> x 1)) 2)) (empty? t)` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t (take-filter (list 1 2 3) (lambda (x) (> x 3)) 2)) (empty? t)` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t (take-filter (list 1 2 3) (lambda (x) (> x 1)) 2)) (list=? t '(2 3))` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t (take-filter (list 1 2) (lambda (x) (> x 1)) 3)) (list=? t '(2))` + `)`)).to.deep.equal(makeOk(true));
    });

        /**
     * Q2.1--(b) tests
     */
        it("Q21b", () => {
            expect(evalP(`(L3` + q2 + `3)`)).to.deep.equal(makeOk(3));
            expect(evalP(`(L3` + q2 + q2_test_string + `3)`)).to.deep.equal(makeOk(3));
            expect(evalP(`(L3` + q2 + q2_test_string + `(define sub (sub-size '() 0)) (list=? sub '(()))` + `)`)).to.deep.equal(makeOk(true));
            expect(evalP(`(L3` + q2 + q2_test_string + `(define sub (sub-size (list 1 2 3) 1)) (list=? sub '((1) (2) (3)))` + `)`)).to.deep.equal(makeOk(true));
            expect(evalP(`(L3` + q2 + q2_test_string + `(define sub (sub-size (list 1 2 3) 2)) (list=? sub '((1 2) (2 3)))` + `)`)).to.deep.equal(makeOk(true));
            expect(evalP(`(L3` + q2 + q2_test_string + `(define sub (sub-size (list 1 2 3) 3)) (list=? sub '((1 2 3)))` + `)`)).to.deep.equal(makeOk(true));
            expect(evalP(`(L3` + q2 + q2_test_string + `(define sub (sub-size-map '() (lambda (x) (+ x 1)) 0)) (list=? sub '(()))` + `)`)).to.deep.equal(makeOk(true));
            expect(evalP(`(L3` + q2 + q2_test_string + `(define sub (sub-size-map (list 1 2 3) (lambda (x) (+ x 1)) 1)) (list=? sub '((2) (3) (4)))` + `)`)).to.deep.equal(makeOk(true));
            expect(evalP(`(L3` + q2 + q2_test_string + `(define sub (sub-size-map (list 1 2 3) (lambda (x) (+ x 1)) 2)) (list=? sub '((2 3) (3 4)))` + `)`)).to.deep.equal(makeOk(true));
            expect(evalP(`(L3` + q2 + q2_test_string + `(define sub (sub-size-map (list 1 2 3) (lambda (x) (+ x 1)) 3)) (list=? sub '((2 3 4)))` + `)`)).to.deep.equal(makeOk(true));
        });


    /**
     * Q2.2--(a) tests
     */
    it("Q22a", () => {
        expect(evalP(`(L3` + q2 + `3)`)).to.deep.equal(makeOk(3));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t '(1 (#t 3 4) 2)) (root t)` + `)`)).to.deep.equal(makeOk(1));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t '(1 (#t 3 4) 2)) (list=? (left t) '(#t 3 4))` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t '(1 (#t 3 4) 2)) (right t)` + `)`)).to.deep.equal(makeOk(2));
    });
    

    /**
     * Q2.2--(b) tests
     */
    it("Q22b", () => {
        expect(evalP(`(L3` + q2 + `3)`)).to.deep.equal(makeOk(3));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t '(1 (#t 3 #t) 2)) (count-node t #t)` + `)`)).to.deep.equal(makeOk(2));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t '(1 (#t 3 #t) 2)) (count-node t 4)` + `)`)).to.deep.equal(makeOk(0));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t '(1 (#t 3 4) 2)) (list=? (mirror-tree t) '(1 2 (#t 4 3)))` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + q2_test_string + `(define t '(5 (#t 4 2) (12 () 3))) (list=? (mirror-tree t) '(5 (12 3 ()) (#t 2 4)))` + `)`)).to.deep.equal(makeOk(true));
    });


    /**
     * Q2.3--(a) tests
     */
    it("Q23a", () => {
        expect(evalP(`(L3`+ q2 + `3)`)).to.deep.equal(makeOk(3));
        expect(evalP(`(L3` + q2 + `(define ok (make-ok 1)) (ok? ok)` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + `(define ok (make-ok 1)) (error? ok)` + `)`)).to.deep.equal(makeOk(false));
        expect(evalP(`(L3` + q2 + `(define ok (make-ok 1)) (result? ok)` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + `(define ok (make-ok 1)) (result->val ok)` + `)`)).to.deep.equal(makeOk(1));
        expect(evalP(`(L3` + q2 + `(define error (make-error "some error message")) (error? error)` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + `(define error (make-error "some error message")) (ok? error)` + `)`)).to.deep.equal(makeOk(false));
        expect(evalP(`(L3` + q2 + `(define error (make-error "some error message")) (result? error)` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + `(define error (make-error "some error message")) (result->val error)` + `)`)).to.deep.equal(makeOk("some error message"));
        expect(evalP(`(L3` + q2 + `(define not-ok 'ok) (ok? not-ok)` + `)`)).to.deep.equal(makeOk(false));
        expect(evalP(`(L3` + q2 + `(define not-ok 'ok) (error? not-ok)` + `)`)).to.deep.equal(makeOk(false));
        expect(evalP(`(L3` + q2 + `(define not-ok 'ok) (result? not-ok)` + `)`)).to.deep.equal(makeOk(false));
        expect(evalP(`(L3` + q2 + `(define not-ok 'ok) (error? (result->val not-ok))` + `)`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3` + q2 + `(define not-ok 'ok) (result->val (result->val not-ok))` + `)`)).to.deep.equal(makeOk("Error: not a result"));
        expect(evalP(`(L3` + q2 + `(define not-error 'error) (ok? not-error)` + `)`)).to.deep.equal(makeOk(false));
        expect(evalP(`(L3` + q2 + `(define not-error 'error) (error? not-error)` + `)`)).to.deep.equal(makeOk(false));
        expect(evalP(`(L3` + q2 + `(define not-error 'error) (result? not-error)` + `)`)).to.deep.equal(makeOk(false));
    });

    /**
     * Q2.3--(b) tests
     */
    it("Q23b", () => {
        expect(evalP(`(L3`+ q2 + `3)`)).to.deep.equal(makeOk(3));
        expect(evalP(`(L3` + q2 + `(define inc-result (bind (lambda (x) (make-ok (+ x 1))))) (define ok (make-ok 1)) (result->val (inc-result ok))` + `)`)).to.deep.equal(makeOk(2));
        expect(evalP(`(L3` + q2 + `(define inc-result (bind (lambda (x) (make-ok (+ x 1))))) (define error (make-error "some error message")) (result->val (inc-result error))` + `)`)).to.deep.equal(makeOk("some error message"));
        expect(evalP(`(L3` + q2 + q23_test_string + `(result->val (inverse-square-inverse 2))` + `)`)).to.deep.equal(makeOk(4));
        expect(evalP(`(L3` + q2 + q23_test_string + `(result->val (inverse-square-inverse 0))` + `)`)).to.deep.equal(makeOk("div by 0"));
    });

});