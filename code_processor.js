// variables for interpreter
var globalmemory = {};
var memory = {}; // current variables
var memorystack = [];
var stack = [];
var instructions = []; // compiled code
var labels = {}; // compiled code
var currentAlgo = null;
var _countEnabled = true;
var algoLoad = false;
var counters = {};
var sourcecode = []; // compiled code
var sourcecodeelements = []; // compiled code
var timer = null;

function compile(algo) {
    var instructionstemp = [];
    var sourcecodetemp = [];
    var labelstemp = {};
    var lang = languages[prolang];
    function add_src(src) {
        sourcecodetemp.push(...src);
    }
    function reverse(arr) {
        var temp = [...arr];
        temp.reverse();
        return temp;
    }
    function compileexpression(exp, store) {
        if (store === undefined) store = true;
        var typ = typeof(exp);
        if (exp === null || typ === 'boolean' || typ === "number") { // constants
            if (store) instructionstemp.push({"type": "loadconst", "value": exp}); // push the const to stack
            return lang.const(exp);
        } else if (typ === "string") { // variable name
            if (store) instructionstemp.push({"type": "load", "name": exp}); // get the variable and push to stack
            return lang.varname(exp);
        } else if (typ === "object") { // nested expression
            if (exp.type === "subscript") { // target[index]
                var target = compileexpression(exp.target, store);
                var index = compileexpression(exp.index, store);
                if (target === null) return null;
                if (index === null) return null;
                if (store) instructionstemp.push({"type": "loadindex"});
                return lang.subscript(target, index);
            } else if (exp.type === "random") { // random(min, max)
                var expmin = compileexpression(exp.min, store);
                var expmax = compileexpression(exp.max, store);
                if (expmin === null) return null;
                if (expmax === null) return null;
                if (store) instructionstemp.push({"type": "random"});
                return lang.random(expmin, expmax);
            } else if (exp.type === "length") { // target.length
                var target = compileexpression(exp.target, store);
                if (target === null) return null;
                if (store) instructionstemp.push({"type": "length"});
                return lang.getlength(target);
            } else if (exp.type === "op") {
                // + - * / // % ** << >> ^ & | ~ && || ! < <= > >= == != u+ u-
                if (["u+", "u-", "!", "~"].includes(exp.op)) { // 1 argument
                    if (exp.operands.length !== 1) return null;
                    var temp = compileexpression(exp.operands[0], store);
                    if (temp === null) return null;
                    if (store) instructionstemp.push({"type": "op", "op": exp.op});
                    return lang.operator1(exp.op, temp);
                } else if (exp.op === "&&") { // short-circuited and
                    if (exp.operands.length !== 2) return null;
                    var temp1 = compileexpression(exp.operands[0], store);
                    if (store) instructionstemp.push({"type": "dup"});
                    var temp3 = {"type": "jumpfalse", "loc": null};
                    if (store) instructionstemp.push(temp3);
                    var temp2 = compileexpression(exp.operands[1], store);
                    if (temp1 === null || temp2 === null) return null;
                    if (store) instructionstemp.push({"type": "op", "op": exp.op});
                    temp3.loc = instructionstemp.length;
                    return lang.operator2(exp.op, temp1, temp2);
                } else if (exp.op === "||") { // short-circuited or
                    if (exp.operands.length !== 2) return null;
                    var temp1 = compileexpression(exp.operands[0], store);
                    if (store) instructionstemp.push({"type": "dup"});
                    if (store) instructionstemp.push({"type": "op", "op": "!"});
                    var temp3 = {"type": "jumpfalse", "loc": null};
                    if (store) instructionstemp.push(temp3);
                    var temp2 = compileexpression(exp.operands[1], store);
                    if (temp1 === null || temp2 === null) return null;
                    if (store) instructionstemp.push({"type": "op", "op": exp.op});
                    temp3.loc = instructionstemp.length;
                    return lang.operator2(exp.op, temp1, temp2);
                } else { // 2 arguments
                    if (exp.operands.length !== 2) return null;
                    var temp1 = compileexpression(exp.operands[0], store);
                    var temp2 = compileexpression(exp.operands[1], store);
                    if (temp1 === null || temp2 === null) return null;
                    if (store) instructionstemp.push({"type": "op", "op": exp.op});
                    return lang.operator2(exp.op, temp1, temp2);
                }
            } else if (exp.type === "func") { // name(arg1, arg2, ...)
                var temp_arguments = [];
                for (var operand of exp.arguments) {
                    var temp = compileexpression(operand, store);
                    if (temp === null) return null;
                    temp_arguments.push(temp);
                }
                if (store) instructionstemp.push({"type": "call", "name": exp.name, "arg": exp.arguments.length});
                return lang.func(exp.name, temp_arguments);
            } else {
                return null; // unknown expression
            }
        } else {
            return null; // invalid object
        }
    }
    function compileleftvalue(exp) {
        var typ = typeof(exp);
        if (exp === null || typ === 'boolean' || typ === "number") { // constants
            return null; // constant cannot be assigned
        } else if (typ === "string") { // variable name
            instructionstemp.push({"type": "store", "name": exp}); // get the stack and push to variable
            return lang.varname(exp);
        } else if (typ === "object") { // nested expression
            if (exp.type === "subscript") { // target[index] = value
                var target = compileexpression(exp.target);
                var index = compileexpression(exp.index);
                if (target === null) return null;
                if (index === null) return null;
                instructionstemp.push({"type": "storeindex"}); // get the stack and push 
                return lang.subscript(target, index);
            } else {
                return null; // expression result cannot be assigned
            }
        } else {
            return null; // invalid object
        }
    }
    function setjumps(list) {
        list.forEach(branch => {
            instructionstemp[branch].loc = instructionstemp.length;
        })
    }
    function compileblock(block, continues, breaks, indentation) {
        // continues record the lines with continue statement
        // breaks record the lines with break statement
        // input: code, return: instruction numbers
        var temp, temp2, temp3;
        for (var instruction of block) {
            var breakpoint = null;
            if (!["nop", "mark", "unmark", "count", "if", "ifh", "oph", "for", "while", "do_while", "repeat_until"].includes(instruction.type)) {
                instructionstemp.push(breakpoint = {"type": "breakpoint", "start": sourcecodetemp.length, "end": null});
            }
            if (instruction.type === "nop") {
            } else if (instruction.type === "fail") {
                instructionstemp.push({"type": "fail"});
                add_src(lang.fail(indentation));
            } else if (instruction.type === "count") {
                instructionstemp.push({"type": "count", "value": instruction.value});
            } else if (instruction.type === "mark") {
                if (compileexpression(instruction.indices[0]) === null) return null;
                if (compileexpression(instruction.indices[1]) === null) return null;
                instructionstemp.push({"type": "mark", "color": instruction.color});
            } else if (instruction.type === "unmark") {
                if (compileexpression(instruction.indices[0]) === null) return null;
                if (compileexpression(instruction.indices[1]) === null) return null;
                instructionstemp.push({"type": "unmark"});
            } else if (instruction.type === "assign") { // target = value
                var tempvalue = compileexpression(instruction.value);
                var temptarget = compileleftvalue(instruction.target);
                if (tempvalue === null) return null;
                if (temptarget === null) return null;
                add_src(lang.assign(indentation, temptarget, tempvalue));
            } else if (instruction.type === "return") {
                if (instruction.value === null) {
                    add_src(lang.return0(indentation, currentfunc.variables)); // some language need to free the variables
                } else {
                    var tempvalue = compileexpression(instruction.value);
                    if (tempvalue === null) return null;
                    add_src(lang.return1(indentation, tempvalue, currentfunc.name, currentfunc.variables)); // some language may use the function name here
                }
                instructionstemp.push({"type": "ret"});
            } else if (instruction.type === "swap") { // target1 = target2
                var temp1 = compileexpression(instruction.targets[0]);
                if (temp1 === null) return null;
                var temp2 = compileexpression(instruction.targets[1]);
                if (temp2 === null) return null;
                if (compileleftvalue(instruction.targets[0]) === null) return null;
                if (compileleftvalue(instruction.targets[1]) === null) return null;
                instructionstemp.push({"type": "counter", "name": "swap"});
                add_src(lang.swap(indentation, temp1, temp2));
            } else if (["if", "ifh"].includes(instruction.type)) { // if (cond1) { branch1 } else if (cond2) { branch2 } else { branch3 };
                var isif = instruction.type === "if";
                if (instruction.cond.length < instruction.branches.length - 1 || instruction.cond.length > instruction.branches.length) return null; // invalid branch number
                var branches = []; // record the lines with branches
                temp3 = null;
                for (var i = 0; i < instruction.branches.length; ++i) {
                    if (temp3 !== null) {
                        temp3.loc = instructionstemp.length;
                    }
                    if (isif) instructionstemp.push(breakpoint = {"type": "breakpoint", "start": sourcecodetemp.length, "end": null}); // recreate another breakpoint
                    if (i < instruction.cond.length) {
                        var tempcond = compileexpression(instruction.cond[i]);
                        if (tempcond === null) return null;
                        instructionstemp.push(temp3 = {"type": "jumpfalse", "loc": null});
                        if (isif) {
                            if (i === 0) {
                                add_src(lang.if_start(indentation, tempcond));
                            } else {
                                add_src(lang.if_elseif(indentation, tempcond));
                            }
                        }
                    } else if (isif) {
                        add_src(lang.if_else(indentation));
                    }
                    if (isif) breakpoint.end = sourcecodetemp.length - 1; // only highlight to this line
                    if (compileblock(instruction.branches[i], continues, breaks, indentation + 1) === null) return null; // inherit continues and breaks
                    if (i < instruction.branches.length - 1) { // yet another branch
                        branches.push(instructionstemp.length);
                        instructionstemp.push({"type": "jump", "loc": null});
                    }
                }
                breakpoint = null; // no more breakpoint
                if (isif) {
                    add_src(lang.if_end(indentation));
                }
                if (temp3 !== null && temp3.loc === null) {
                    temp3.loc = instructionstemp.length;
                }
                setjumps(branches);
            } else if (instruction.type === "while") { // while (cond) { code };
                temp = instructionstemp.length; // jump back target
                instructionstemp.push(breakpoint = {"type": "breakpoint", "start": sourcecodetemp.length, "end": null}); // add breakpoint after recording target
                var tempcond = compileexpression(instruction.cond);
                if (tempcond === null) return null;
                add_src(lang.while_start(indentation, tempcond));
                breakpoint.end = sourcecodetemp.length - 1; // only highlight to this line
                instructionstemp.push(temp2 = {"type": "jumpfalse", "loc": null});
                var tempcontinues = [];
                var tempbreaks = [];
                if (compileblock(instruction.code, tempcontinues, tempbreaks, indentation + 1) === null) return null;
                setjumps(tempcontinues);
                instructionstemp.push({"type": "jump", "loc": temp});
                temp2.loc = instructionstemp.length;
                setjumps(tempbreaks);
                add_src(lang.while_end(indentation));
            } else if (instruction.type === "do_while") { // do { code } while (cond);
                temp = instructionstemp.length; // jump back target
                add_src(lang.do_while_start(indentation));
                var tempcontinues = [];
                var tempbreaks = [];
                if (compileblock(instruction.code, tempcontinues, tempbreaks, indentation + 1) === null) return null;
                instructionstemp.push(breakpoint = {"type": "breakpoint", "start": sourcecodetemp.length, "end": null}); // add breakpoint after the code block
                setjumps(tempcontinues);
                var tempcond = compileexpression(instruction.cond);
                if (tempcond === null) return null;
                instructionstemp.push(temp2 = {"type": "jumpfalse", "loc": null});
                instructionstemp.push({"type": "jump", "loc": temp});
                temp2.loc = instructionstemp.length;
                setjumps(tempbreaks);
                add_src(lang.do_while_end(indentation, tempcond));
            } else if (instruction.type === "repeat_until") { // repeat { code } until (cond);
                temp = instructionstemp.length; // jump back target
                add_src(lang.repeat_until_start(indentation));
                var tempcontinues = [];
                var tempbreaks = [];
                if (compileblock(instruction.code, tempcontinues, tempbreaks, indentation + 1) === null) return null;
                setjumps(tempcontinues);
                instructionstemp.push(breakpoint = {"type": "breakpoint", "start": sourcecodetemp.length, "end": null}); // add breakpoint after the code block
                var tempcond = compileexpression(instruction.cond);
                if (tempcond === null) return null;
                instructionstemp.push(temp2 = {"type": "jumpfalse", "loc": temp});
                setjumps(tempbreaks);
                add_src(lang.repeat_until_end(indentation, tempcond));
            } else if (instruction.type === "for") { // for (target = start; target < end; target += step) { code };
                // init: assign
                var tempstart = compileexpression(instruction.start);
                var temptarget = compileleftvalue(instruction.target);
                if (tempstart === null || temptarget === null) return null;
                temp = instructionstemp.length; // jump back target
                instructionstemp.push(breakpoint = {"type": "breakpoint", "start": sourcecodetemp.length, "end": null}); // add breakpoint after recording target
                // content: while-loop
                if (compileexpression(instruction.target) === null) return null;
                var tempend = compileexpression(instruction.end);
                if (tempend === null) return null;
                temp2 = "";
                if (instruction.direction === "up") {
                    temp2 = "<";
                } else if (instruction.direction === "down") {
                    temp2 = ">";
                } else {
                    return null; // unknown direction
                };
                if (instruction.inclusive) {
                    temp2 += "=";
                }
                instructionstemp.push({"type": "op", "op": temp2});
                instructionstemp.push(temp3 = {"type": "jumpfalse", "loc": null});
                var tempstep = compileexpression(instruction.step, false); // not added to instructions
                if (tempstep === null) return null;

                add_src(lang.for_start(indentation, temptarget, tempstart, tempend, tempstep, instruction.direction, instruction.inclusive));
                breakpoint.end = sourcecodetemp.length - 1; // only highlight to this line
                var tempcontinues = [];
                var tempbreaks = [];
                if (compileblock(instruction.code, tempcontinues, tempbreaks, indentation + 1) === null) return null;
                setjumps(tempcontinues);

                // next iteration expression
                compileexpression(instruction.target);
                compileexpression(instruction.step);
                instructionstemp.push({"type": "op", "op": "+"});
                // assign back
                compileleftvalue(instruction.target)

                instructionstemp.push({"type": "jump", "loc": temp});
                temp3.loc = instructionstemp.length;
                setjumps(tempbreaks);
                add_src(lang.for_end(indentation, temptarget)); // some language may use the counter name here
            } else if (instruction.type === "continue") { // continue;
                if (continues === null) return null; // not inside a loop
                continues.push(instructionstemp.length);
                instructionstemp.push({"type": "jump", "loc": null});
                add_src(lang.continue(indentation));
            } else if (instruction.type === "break") { // break;
                if (continues === null) return null; // not inside a loop
                breaks.push(instructionstemp.length);
                instructionstemp.push({"type": "jump", "loc": null});
                add_src(lang.break(indentation));
            } else if (instruction.type === "op" || instruction.type === "oph") {
                if (["++", "--"].includes(instruction.op)) { // 1 argument
                    if (instruction.operands.length !== 1) return null;
                    var temp = compileexpression(instruction.operands[0]);
                    if (temp === null) return null;
                    compileexpression(1);
                    instructionstemp.push({"type": "op", "op": instruction.op[0]});
                    // assign back
                    if (compileleftvalue(instruction.operands[0]) === null) return null;
                    if (instruction.type === "op") {
                        add_src(lang.opassign1(indentation, instruction.op, temp));
                    }
                } else { // 2 arguments
                    if (instruction.operands.length !== 2) return null;
                    var temp1 = compileexpression(instruction.operands[0]);
                    var temp2 = compileexpression(instruction.operands[1]);
                    if (temp1 === null || temp2 === null) return null;
                    instructionstemp.push({"type": "op", "op": instruction.op.slice(0,-1)}); // drop the "="
                    // assign back
                    if (compileleftvalue(instruction.operands[0]) === null) return null;
                    if (instruction.type === "op") {
                        add_src(lang.opassign2(indentation, instruction.op, temp1, temp2));
                    }
                }
            } else if (instruction.type === "func") { // name(arg1, arg2, ...)     
                var exp = compileexpression(instruction);               
                if (exp === null) return null; // treat as expression with no return
                add_src(lang.expline(indentation, exp));
            } else if (instruction.type === "init") { // [0, 0, 0, 0]
                var temp_arguments = [];
                for (var operand of instruction.shape) {
                    var temp = compileexpression(operand);
                    if (temp === null) return null;
                    temp_arguments.push(temp);
                }
                instructionstemp.push({"type": "init", "dim": instruction.shape.length});
                var temptarget = compileleftvalue(instruction.target);               
                if (temptarget === null) return null;
                add_src(lang.init(indentation, temptarget, temp_arguments));
            } else {
                console.log(instruction)
                return null; // unknown command
            }
            if (breakpoint !== null && breakpoint.end === null) {
                // mark the last line of real code
                breakpoint.end = sourcecodetemp.length - 1;
            }
        };
        return 0; // no error
    }
    add_src(lang.code_start(algo)); // global wrapper
    add_src([""]); // add an empty line to be more clear
    var currentfunc;
    for (currentfunc of algo) { 
        labelstemp[currentfunc.name] = instructionstemp.length; // function pointer
        currentfunc.arguments.forEach(variable => { // retain the order
            instructionstemp.push({"type": "def", "name": variable.name});
        });
        reverse(currentfunc.arguments).forEach(variable => {
            instructionstemp.push({"type": "store", "name": variable.name});
        });
        currentfunc.variables.forEach(variable => {
            instructionstemp.push({"type": "def", "name": variable.name});
        });
        add_src(lang.function_start(currentfunc));
        if (compileblock(currentfunc.code, null, null, lang.indentation + 1) === null) { 
            alert("Compile Failed!");
            debugger;
            return null;
        };
        // if (!func.use_swap) instructionstemp[temp] = {"type": "nop"};
        instructionstemp.push({"type": "ret"}); // return nothing
        add_src(lang.function_end(currentfunc)); // do all garbage collect here, if needed
        add_src([""]); // add an empty line to be more clear
    };
    add_src(lang.code_end(algo)); // global wrapper
    sourcecode = sourcecodetemp;
    instructions = instructionstemp;
    labels = labelstemp;
    return 0; // no error
}

function interpret() {
    if (!algoLoad) return;
    function pushpop(count, func) {
        var vars = [];
        for (var i = 0; i < count; ++i) {
            vars.unshift(stack.pop());
        };
        stack.push(func(...vars));
    }
    function createarray(shape) {
        if (shape.length) {
            var temp = [];
            for (var i = 0; i < shape[0]; ++i) {
                temp.push(createarray(shape.slice(1)));
            }
            return temp;
        } else {
            return 0;
        };
    }
    // var countbreak = 0;
    var countstart = new Date().getTime();
    while (algoLoad) {
        // console.log(memory.cursor);
        var ins = instructions[memory.cursor];
        if (ins.type === "def") {
            memory[ins.name] = 0; // createarray(ins.shape);
        } else if (ins.type === "init") {
            var dim = []
            for (var i = 0; i < ins.dim; ++i) {
                dim.unshift(stack.pop());
            }
            stack.push(createarray(dim));
        } else if (ins.type === "nop") {
        } else if (ins.type === "fail") {
            alert("The algorithm is wrong!");
            return;
        } else if (ins.type === "jump") {
            memory.cursor = ins.loc;
            continue;
        } else if (ins.type === "jumpfalse") {
            if (!stack.pop()) {
                memory.cursor = ins.loc;
                continue;  // no cursor + 1
            }
        } else if (ins.type === "count") {
            _countEnabled = ins.value;
        } else if (ins.type === "counter") {
            if (_countEnabled) ++counters[ins.name];
        } else if (ins.type === "dup") {
            var value = stack.pop();
            stack.push(value);
            stack.push(value);
        } else if (ins.type === "length") {
            var target = stack.pop();
            stack.push(target.length)
        } else if (ins.type === "random") {
            var max = stack.pop();
            var min = stack.pop();
            stack.push(Math.floor(random() * (max - min + 1)) + min)
        } else if (ins.type === "mark") {
            var right = stack.pop();
            var left = stack.pop();
            for (var index = left; index <= right; ++index) {
                marker[index] = ins.color;
                refreshsingle(index);
            }
        } else if (ins.type === "unmark") {
            var right = stack.pop();
            var left = stack.pop();
            for (var index = left; index <= right; ++index) {
                marker[index] = null;
                refreshsingle(index);          
            }
        } else if (ins.type === "loadconst") { // load constant
            stack.push(ins.value);
        } else if (ins.type === "load") { // load variable
            if (memory[ins.name] !== undefined) {
                stack.push(memory[ins.name]);
            } else if (globalmemory[ins.name] !== undefined) {
                stack.push(globalmemory[ins.name]);
            } else {
                alert(`Variable ${ins.name} is not defined!`);
                return;
            }
        } else if (ins.type === "loadindex") { // load variable
            var index = stack.pop();
            var target = stack.pop();
            stack.push(target[index]);
            if (target === array) {
                if (_countEnabled) ++counters.mainread;
                makeSound(target[index]);
            } else {
                if (_countEnabled) ++counters.arrayread;
            }
        } else if (ins.type === "store") {
            var value = stack.pop();
            if (memory[ins.name] !== undefined) {
                memory[ins.name] = value;
            } else {
                alert(`Local variable ${ins.name} is not defined!`);
                return;
            }
        } else if (ins.type === "storeindex") {
            var index = stack.pop();
            var target = stack.pop();
            var value = stack.pop();
            target[index] = value;
            if (target === array) {
                if (_countEnabled) ++counters.mainwrite;
                makeSound(target[index]);
                resizesingle(index, value);
            } else {
                if (_countEnabled) ++counters.arraywrite;
            }
        } else if (ins.type === "op") {
            if (ins.op === "+") {
                pushpop(2, (a, b) => a + b);
            } else if (ins.op === "-") {
                pushpop(2, (a, b) => a - b);
            } else if (ins.op === "*") {
                pushpop(2, (a, b) => a * b);
            } else if (ins.op === "/") {
                pushpop(2, (a, b) => a / b);
            } else if (ins.op === "//") {
                pushpop(2, (a, b) => Math.floor(a / b));
            } else if (ins.op === "%") {
                pushpop(2, (a, b) => a % b);
            } else if (ins.op === "**") {
                pushpop(2, (a, b) => Math.pow(a, b)); // a ** b is only supported in new browser versions
            } else if (ins.op === "<") {
                pushpop(2, (a, b) => a < b);
                if (_countEnabled) ++counters.compare;
            } else if (ins.op === "<=") {
                pushpop(2, (a, b) => a <= b);
                if (_countEnabled) ++counters.compare;
            } else if (ins.op === "==") {
                pushpop(2, (a, b) => a === b);
                if (_countEnabled) ++counters.compare;
            } else if (ins.op === "!=") {
                pushpop(2, (a, b) => a !== b);
                if (_countEnabled) ++counters.compare;
            } else if (ins.op === ">") {
                pushpop(2, (a, b) => a > b);
                if (_countEnabled) ++counters.compare;
            } else if (ins.op === ">=") {
                pushpop(2, (a, b) => a >= b);
                if (_countEnabled) ++counters.compare;
            } else if (ins.op === "<<") {
                pushpop(2, (a, b) => a << b);
            } else if (ins.op === ">>") {
                pushpop(2, (a, b) => a >> b);
            } else if (ins.op === "^") {
                pushpop(2, (a, b) => a ^ b);
            } else if (ins.op === "&") {
                pushpop(2, (a, b) => a & b);
            } else if (ins.op === "|") {
                pushpop(2, (a, b) => a | b);
            } else if (ins.op === "&&") {
                pushpop(2, (a, b) => a && b);
            } else if (ins.op === "||") {
                pushpop(2, (a, b) => a || b);
            } else if (ins.op === "u+") {
                pushpop(1, a => +a);
            } else if (ins.op === "u-") {
                pushpop(1, a => -a);
            } else if (ins.op === "~") {
                pushpop(1, a => ~a); // -a - 1
            } else if (ins.op === "!") {
                pushpop(1, a => !a);
            } else {
                alert(`Unknown operator: ${ins.op}!`); // operation not recognized
                return;
            }
        } else if (ins.type === "breakpoint") {
            ++memory.cursor;
            if (playMode === "Ultra" && (new Date().getTime() - countstart) * 60 < 1000) {
                continue;
            }
            highlightCode(ins.start, ins.end);
            break;
        } else if (ins.type === "call") { // call function
            memorystack.push(memory);
            memory = {"cursor": labels[ins.name], "label": ins.name};
            continue; // no cursor + 1
        } else if (ins.type === "ret") { // return
            if (memorystack.length === 0) {
                // completed, remove highlight
                sourcecodeelements.forEach(ele => ele.className = "");
                algoLoad = false;
                break;
            } else {
                memory = memorystack.pop();
            }
        } else {
            alert(`Unknown type: ${ins.type}!`);
            return;
        }
        ++memory.cursor;
    }
    readCount.innerText = counters.mainread + counters.arrayread;
    writeCount.innerText = counters.mainwrite + counters.arraywrite;
    compareCount.innerText = counters.compare;
    statReadCount.innerText = counters.mainread;
    statWriteCount.innerText = counters.mainwrite;
    statSwapCount.innerText = counters.swap;
    statCompareCount.innerText = counters.compare;
    statArrayReadCount.innerText = counters.arrayread;
    statArrayWriteCount.innerText = counters.arraywrite;
    statTotalReadCount.innerText = counters.mainread + counters.arrayread;
    statTotalWriteCount.innerText = counters.mainwrite + counters.arraywrite;
    updateMemory();
    if (algoLoad) {        
        if (playMode === "Ultra" || playMode === "Fast") {
            timer = immediateInterpret();
        } else if (playMode === "Medium") {
            timer = setTimeout(interpret, 10);
        } else if (playMode === "Slow") {
            timer = setTimeout(interpret, 100);
        }
    }
}

function updateMemory() {
    var temptarget = [...memorystack, memory];
    // tabvariables.innerText = "";
    // remove extra dropdown
    var childrens = tabvariables.children;
    while (childrens.length > temptarget.length) {
        tabvariables.removeChild(childrens[temptarget.length]);
    }
    // add missing dropdown
    while (childrens.length < temptarget.length) {
        var div = document.createElement("div");
        div.className = "nav-container nav-dropdownable";
        var button = document.createElement("button");
        button.className = "nav-label nav-seethrough";
        div.appendChild(button);
        var div2 = document.createElement("div");
        div2.className = "nav-dropdown";
        div.appendChild(div2);
        tabvariables.appendChild(div);
    }
    // modify dropdown
    for (var temp = 0; temp < temptarget.length; ++temp) {
        var m = temptarget[temp];
        var button = childrens[temp].querySelector(".nav-label");
        button.innerHTML = temptarget[temp].label;
        var targetele = childrens[temp].querySelector(".nav-dropdown");
        // remove extra dropdown
        var childrens2 = targetele.children;
        var variablenames = Object.keys(m).filter(k => !((["cursor", "label"].includes(k) || Array.isArray(m[k]))));
        while (childrens2.length > variablenames.length) {
            targetele.removeChild(childrens2[variablenames.length]);
        }
        // add missing dropdown
        while (childrens2.length < variablenames.length) {
            var div3 = document.createElement("div");
            div3.className = "nav-text nav-seethrough";
            targetele.appendChild(div3);
        }
        // modify dropdown
        for (var temp2 = 0; temp2 < variablenames.length; ++temp2) {
            var k = variablenames[temp2];
            childrens2[temp2].innerText = k + ": " + m[k];
        }
    }
}

function highlightCode(start, end) {
    sourcecodeelements.forEach(ele => ele.className = "");
    for (var i = start; i <= end; ++i) {
        sourcecodeelements[i].className = "active";
    }
}

(function (){
    var timerpool = {};
    var timerpoolcount = 0;
    window.addEventListener("message", function(event) {
        var label = event.data;
        if (timerpool[label]) interpret();
        delete timerpool[label];
    }, false);

    immediateInterpret = function () {
        ++timerpoolcount;
        var label = timerpoolcount.toString();
        timerpool[label] = true;
        window.postMessage(label, "*");
        return label;
    }

    killTimer = function () {
        if (timer !== null) {
            if (typeof(timer) == "number") {
                clearTimeout(timer);
            } else {
                timerpool[timer] = false;
            }
            timer = null;
        }
    }
})();

function copy() {
    // copy implementation to clipboard
    var targettext = codearea.innerText.replaceAll("\n\n\t\n", "\n").replaceAll("\xa0", " ").substring(2); // \xa0: &nbsp;, [0:2]: "\t\n"
    if (navigator.clipboard) {
        navigator.clipboard.writeText(targettext).then(
            () => alert("Copied to clipboard!")
        );
    } else { // fallback
        var target = codearea;
        var temp = document.createElement('textarea');
        temp.value = targettext;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        alert("Copied to clipboard!");
    }
}

function initGlobal() {
    globalmemory = {"a": array}; // reset memory
}

function clear(parent) { // polyfill
    try {
        parent.innerText = "";
    } catch (_) {
        while (parent.firstChild) {
            parent.firstChild.remove()
        }
    }
}

function runalgo(algoname, hotfix) { // hotfix does not reset variables
    if (hotfix === undefined) hotfix = false;
    if (algoname === null) return;
    var algo = algorithms[algoname];

    if (compile([...algo.functions, ...algorithms.verify.functions, ...algorithms.main.functions]) === null) return;
    clear(codearea);
    sourcecodeelements = [];
    for (var line = 0; line < sourcecode.length; ++line) {
        var tr = document.createElement("tr");
        {
            var th = document.createElement("th");
            th.dataset.line = line + 1;
            tr.appendChild(th);
        }
        {
            var td = document.createElement("td");
            var startSpaces = sourcecode[line].length - sourcecode[line].trimStart().length;
            var div = document.createElement("div");
            if (sourcecode[line] === "") {
                div.innerHTML = "&nbsp;";
            } else {
                div.innerHTML = "&nbsp;".repeat(startSpaces) + sourcecode[line].slice(startSpaces);
            }
            div.style.marginLeft = `${startSpaces}ch`;
            td.appendChild(div);
            td.style.textIndent = `-${startSpaces}ch`;
            tr.appendChild(td);
        }
        sourcecodeelements.push(tr);
        codearea.appendChild(tr);
    }
    if (!hotfix) {
        currentAlgo = algoname;
        initGlobal();
        _countEnabled = true;
        memorystack = [];
        stack = []; // reset memory
        memory = {"cursor": labels.main, "label": "main"};
        marker = Array(arraySize).fill(null); // remove all marker color		
        refresh();
        description.innerHTML = algo.description;
        counters.mainread = 0;
        counters.mainwrite = 0;
        counters.arrayread = 0;
        counters.arraywrite = 0;
        counters.compare = 0;
        counters.swap = 0;
        algoLoad = true;        
        randomReset();
        continueAlgo();
    } else {
        var ins, cur;
        if (algoLoad && 
            (cur = memory.cursor - 1) < instructions.length &&
            (ins = instructions[cur]).type === "breakpoint") {
            highlightCode(ins.start, ins.end);
        }
    }
}


function continueAlgo(override) {
    if (override === undefined) override = false;
    killTimer();
    if (playMode !== "Pause" && (override || playMode !== "Step")) {
        interpret();
    };
}