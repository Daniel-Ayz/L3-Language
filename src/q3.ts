import {
    CExp,
    CondClause,
    CondExp,
    Exp,
    IfExp, isAppExp, isAtomicExp, isCExp, isCondExp, isDefineExp, isExp, isIfExp, isLetExp, isLitExp, isProcExp,
    isProgram, makeAppExp,
    makeBoolExp,
    makeCondExp, makeDefineExp,
    makeIfExp, makeProcExp,
    makeProgram,
    Program
} from "./L31-ast";
import {Result, makeFailure, makeOk, bind} from "../shared/result";
import {isEmpty, map} from "ramda";
import {first, rest} from "../shared/list";


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
    makeOk(rewriteAllCond(exp))

export const rewriteCondToIf = (condExp: CondExp): IfExp => {return rewriteCondClause(condExp.condclauses)}

export const rewriteCondClause = (condClauses: CondClause[]): IfExp => {
    if(!isEmpty(condClauses)){
        if (condClauses.length === 2){
            return makeIfExp(condClauses[0].test, condClauses[0].then[0], condClauses[1].then[0])
        }
        else{
            return makeIfExp(first(condClauses).test,
                (first(condClauses)).then[0],
                rewriteCondClause(rest(condClauses)))
        }
    }
    else{
        return makeIfExp(makeBoolExp(true),makeBoolExp(true),makeBoolExp(true))
    }
}

const rewriteAllCond = (exp: Program | Exp): Program | Exp =>
    isExp(exp) ? rewriteAllCondExp(exp) :
        isProgram(exp) ? makeProgram(map(rewriteAllCondExp, exp.exps)) :
            exp;

const rewriteAllCondExp = (exp: Exp): Exp =>
    isCExp(exp) ? rewriteAllCondExpCExp(exp) :
        isDefineExp(exp) ? makeDefineExp(exp.var, rewriteAllCondExpCExp(exp.val)) :
            exp;



const rewriteAllCondExpCExp = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp :
        isLitExp(exp) ? exp :
            isIfExp(exp) ? makeIfExp(rewriteAllCondExpCExp(exp.test),
                    rewriteAllCondExpCExp(exp.then),
                    rewriteAllCondExpCExp(exp.alt)) :
                isAppExp(exp) ? makeAppExp(rewriteAllCondExpCExp(exp.rator),
                        map(rewriteAllCondExpCExp, exp.rands)) :
                    isProcExp(exp) ? makeProcExp(exp.args, map(rewriteAllCondExpCExp, exp.body)) :
                        isLetExp(exp) ? exp:
                            isCondExp(exp) ? rewriteAllCondExpCExp(rewriteCondToIf(exp)) :
                                exp;