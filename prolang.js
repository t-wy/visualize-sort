var nothing = () => [];
var indent_spaces = 4;
var indent = (len) => ' '.repeat(len * indent_spaces);
var fail_msg = "The algorithm is wrong!";
var exp = (exp, order) => ({"exp": exp, "order": order});
var _textColor = color => text => `<span style="color:${color}">${text}</span>`;
var _const = _textColor("LightCoral"); // red
var _keyword = _textColor("SkyBlue"); // blue
var _function = _textColor("Khaki"); // yellow
var _string = _textColor("DarkSeaGreen"); // green
var _comment = _textColor("Gray"); // gray
var dummylist = [3, 1, 2, 5, 6, 4];
var dummy = dummylist.map(n => _const(n)).join(", ");
function search_object(obj, keyword) {
    for (var value of Object.values(obj)) {
        if (Array.isArray(value)) {
            if (search_block(value, keyword)) return true;
        } else if (typeof(value) === "object") {
            if (search_object(value, keyword)) return true;
        } else {
            if (value === keyword) return true;
        }
    }
    return false;
}
function search_block(block, keyword) {
    for (var code of block) {
        if (search_object(code, keyword)) return true;
    }
    return false;
}
function search_algo(algo, keyword) {
    for (var func of algo) {
        if (search_block(func.code, keyword)) return true;
    }
    return false;
}
var languages = {
    "pseudocode": {
        "name": "Pseudocode",
        "indentation": 0,
        "operators": {
            "**": {"op": "", "order": 0},
            "u+": {"op": "+"},
            "u-": {"op": "-"},
            "~": {"op": "~"},
            "*": {"op": "×"},
            "/": {"op": "/"},
            "//": {"op": "//"},
            "%": {"op": _keyword("mod")},
            "+": {"op": "+"},
            "-": {"op": "-"},
            "<<": {"op": "<<"},
            ">>": {"op": ">>"},
            "&": {"op": "&"},
            "^": {"op": "⊕"},
            "|": {"op": "|"},
            "<": {"op": "<"},
            "<=": {"op": "≤"},
            ">": {"op": ">"},
            ">=": {"op": "≥"},
            "!=": {"op": "≠"},
            "==": {"op": "="},
            "!": {"op": _keyword("not ") + " "},
            "&&": {"op": _keyword("and")},
            "||": {"op": _keyword("or")},
        },
        "code_start": () => [`a = [${dummy}] ${_comment("# the array to be sorted")}`],
        "code_end": () => [`${_function("main")}()`],
        "function_start": (func) => {
            return [`${_keyword("function")} ${_function(func.name)}(${func.arguments.map(x => x.name).join(", ")})`];
        },     
        "function_end": nothing,

        "if_start": (indentation, cond) => {
            return [indent(indentation) + `${_keyword("if")} ${cond.exp} ${_keyword("then")}`];
        },     
        "if_elseif": (indentation, cond) => {
            return [indent(indentation) + `${_keyword("else if")} ${cond.exp} ${_keyword("then")}`];
        },     
        "if_else": (indentation) => {
            return [indent(indentation) + `${_keyword("else")}`];
        },     
        "if_end": (indentation) => {
            return [indent(indentation) + `${_keyword("end if")}`];
        },

        "while_start": (indentation, cond) => {
            return [indent(indentation) + `${_keyword("while")} ${cond.exp} ${_keyword("do")}`];
        },     
        "while_end": (indentation) => {
            return [indent(indentation) + `${_keyword("end while")}`];
        },

        "do_while_start": (indentation) => {
            return [indent(indentation) + `${_keyword("do")}`];
        },     
        "do_while_end": (indentation, cond) => {
            return [indent(indentation) + `${_keyword("while")} ${cond.exp}`];
        },

        "repeat_until_start": (indentation) => {
            return [indent(indentation) + `${_keyword("repeat")}`];
        },     
        "repeat_until_end": (indentation, cond) => {
            return [indent(indentation) + `${_keyword("until")} ${cond.exp}`];
        },

        "for_start": function(indentation, target, start, end, step, direction, inclusive) {
            var extra = "";
            var tempend = end;
            var one = this.const(1);
            if (step.exp !== one.exp) { // step not 1
                extra = ` ${_keyword("step")} ${step.exp}`;
            }
            if (!inclusive) {
                if (direction === "up") {
                    tempend = this.operator2("-", tempend, one);
                } else {
                    tempend = this.operator2("+", tempend, one);
                }
            }
            return [indent(indentation) + `${_keyword("for")} ${target.exp} ← ${start.exp} ${_keyword(direction === "up"?"to":"down to")} ${tempend.exp}${extra} ${_keyword("do")}`];
        },     
        "for_end":  (indentation) => {
            return [indent(indentation) + `${_keyword("end for")}`];
        },

        "fail": (indentation) => {
            return [indent(indentation) + `${_function("output")} ${_string(`"${fail_msg}"`)}`]
        },
        "assign": (indentation, target, value) => {
            return [indent(indentation) + `${target.exp} ← ${value.exp}`]
        },
        "continue": (indentation) => {
            return [indent(indentation) + `${_keyword("continue")}`]
        },
        "break": (indentation) => {
            return [indent(indentation) + `${_keyword("break")}`]
        },
        "return0": (indentation) => {
            return [indent(indentation) + `${_keyword("return")}`]
        },
        "return1": (indentation, value) => {
            return [indent(indentation) + `${_keyword("return")} ${value.exp}`]
        },
        "swap": (indentation, target1, target2) => {
            return [indent(indentation) + `${_keyword("swap")} ${target1.exp} ${_keyword("and")} ${target2.exp}`]
        },
        "expline": (indentation, expression) => {
            return [indent(indentation) + expression.exp]
        },
        "opassign1": function (indentation, op, arg) {
            if (op === "++") {
                return [indent(indentation) + `${_keyword("increment")} ${arg.exp}`]
            } else { // --
                return [indent(indentation) + `${_keyword("decrement")} ${arg.exp}`]
            }
        },
        "opassign2": function(indentation, op, arg1, arg2) {
            var tempop = op.slice(0, -1);
            return [indent(indentation) + `${arg1.exp} ← ` + this.operator2(tempop, arg1, arg2).exp]
        },
        "init": function(indentation, target, shape) {
            if (shape.length == 0) return [indent(indentation) + `${target.exp} ← ` + this.const(0).exp];
            return [indent(indentation) + `${target.exp} ← ` + `${_function("a zero array of shape")} [${shape.map(s => s.exp).join(", ")}]`];
        },


        "func": (name, args) => exp(`${_function(name)}(${args.map(x => x.exp).join(", ")})`, 1),
        "varname": (name) => exp(name, 1),
        "const": (value) => exp(_const(value === null?"Nothing":typeof(value) === "number"?value.toString():value?"True":"False"), 1),
        "subscript": (target, index) => exp(`${target.exp}[${index.exp}]`, 1),
        "getlength": (target) => exp(`${_function("length of")} ${target.exp}`, -1),
        "random": (min, max) => exp(`${_function("a random integer in")} [${min.exp}, ${max.exp}]`, -1),
        "operator1": function(op, arg) {
            var info = this.operators[op];
            var temp = arg.exp;
            if (arg.order !== 1) {
                temp = `(${temp})`;
            }
            return exp(`${info.op}${temp}`, -1);
        },
        "operator2": function(op, arg1, arg2) {
            var info = this.operators[op];
            var temp1 = arg1.exp;
            var temp2 = arg2.exp;
            var zero = this.const(0).exp;
            var one = this.const(1).exp;
            if (arg1.order !== 1) {
                temp1 = `(${temp1})`;
            }
            if (arg2.order !== 1 && !["**", "<<", ">>"].includes(op)) {
                temp2 = `(${temp2})`;
            }
            if (op == "**") {
                return exp(`${temp1}<sup>${temp2}</sup>`, -1);
            } else if (op == "<<") {
                if (temp2 === one) {
                    return exp(`${temp1} × 2`, -1);
                }
                return exp(`${temp1} × 2<sup>${temp2}</sup>`, -1);
            } else if (op == "//") {
                return exp(`⌊${temp1} / ${temp2}⌋`, 1);
            } else if (op == ">>") {
                if (temp2 === one) {
                    return exp(`⌊${temp1} / 2⌋`, 1);
                }
                return exp(`⌊${temp1} / 2<sup>${temp2}</sup>⌋`, 1);
            } else {
                return exp(`${temp1} ${info.op} ${temp2}`, -1);
            }
        },
    },
    "python": {
        "name": "Python",
        "indentation": 0,
        "operators": { // https://docs.python.org/3/reference/expressions.html
            "**": {"op": "**", "order": 0},
            "u+": {"op": "+", "order": 1},
            "u-": {"op": "-", "order": 1},
            "~": {"op": "~", "order": 1},
            "*": {"op": "*", "order": 2},
            "/": {"op": "/", "order": 2},
            "//": {"op": "//", "order": 2},
            "%": {"op": "%", "order": 2},
            "+": {"op": "+", "order": 3},
            "-": {"op": "-", "order": 3},
            "<<": {"op": "<<", "order": 4},
            ">>": {"op": ">>", "order": 4},
            "&": {"op": "&", "order": 5},
            "^": {"op": "^", "order": 5},
            "|": {"op": "|", "order": 5},
            "<": {"op": "<", "order": 6},
            "<=": {"op": "<=", "order": 6},
            ">": {"op": ">", "order": 6},
            ">=": {"op": ">=", "order": 6},
            "!=": {"op": "!=", "order": 6},
            "==": {"op": "==", "order": 6},
            "!": {"op": _keyword("not") + " ", "order": 7},
            "&&": {"op": _keyword("and"), "order": 8},
            "||": {"op": _keyword("or"), "order": 9},
        },
        "opassigns": ["+", "-", "*", "/", "//", "%", "**", ">>", "<<", "&", "|", "^"], // https://docs.python.org/3/reference/simple_stmts.html
        "code_start": () => [`a = [${dummy}] ${_comment("# the array to be sorted")}`],
        "code_end": () => [`${_function("main")}()`],
        "function_start": (func) => {
            return [`${_keyword("def")} ${_function(func.name)}(${func.arguments.map(x => x.name).join(", ")}):`,
            ...(search_block(func.code, "random")?[indent(1) + `${_keyword("import")} ${_function("random")}`]:[])];
        },     
        "function_end": nothing,

        "if_start": (indentation, cond) => {
            return [indent(indentation) + `${_keyword("if")} ${cond.exp}:`];
        },     
        "if_elseif": (indentation, cond) => {
            return [indent(indentation) + `${_keyword("elif")} ${cond.exp}:`];
        },     
        "if_else": (indentation) => {
            return [indent(indentation) + `${_keyword("else")}:`];
        },     
        "if_end": nothing,

        "while_start": (indentation, cond) => {
            return [indent(indentation) + `${_keyword("while")} ${cond.exp}:`];
        },     
        "while_end": nothing,

        "do_while_start": function (indentation) {
            return [indent(indentation) + `${_keyword("while")} ${this.const(true).exp}:`];
        },     
        "do_while_end": function (indentation, cond) {
            return [indent(indentation + 1) + `${_keyword("if")} ${this.operator1("!", cond).exp}:`, indent(indentation + 2) + `${_keyword("break")}`];
        },

        "repeat_until_start": function (indentation) {
            return [indent(indentation) + `${_keyword("while")} ${this.const(true).exp}:`];
        },     
        "repeat_until_end": function (indentation, cond) {
            return [indent(indentation + 1) + `${_keyword("if")} ${cond.exp}:`, indent(indentation + 2) + `${_keyword("break")}`];
        },

        "for_start": function(indentation, target, start, end, step, direction, inclusive) {
            var extra = "";
            var tempstart = start.exp + ", ";
            var one = this.const(1).exp;
            var tempend = end.exp;
            if (start.exp === this.const(0).exp && step.exp === one) {
                // range(x), only 1 argument
                tempstart = "";
            } else if (step.exp !== one) { // step not 1
                extra = `, ${step.exp}`;
            }
            if (inclusive) {
                if (direction === "up") {
                    if (end.order > this.operators["+"].order) {
                        tempend = `(${tempend})`;
                    }
                    tempend += ` + ` + one;
                } else {
                    if (end.order > this.operators["-"].order) {
                        tempend = `(${tempend})`;
                    }
                    tempend += ` - ` + one;
                }
            }
            return [indent(indentation) + `${_keyword("for")} ${target.exp} ${_keyword("in")} ${_function("range")}(${tempstart}${tempend}${extra}):`];
        },     
        "for_end": nothing,

        "fail": (indentation) => {
            return [indent(indentation) + `${_function("print")}(${_string(`"${fail_msg}"`)})`]
        },
        "assign": (indentation, target, value) => {
            return [indent(indentation) + `${target.exp} = ${value.exp}`]
        },
        "continue": (indentation) => {
            return [indent(indentation) + `${_keyword("continue")}`]
        },
        "break": (indentation) => {
            return [indent(indentation) + `${_keyword("break")}`]
        },
        "return0": (indentation) => {
            return [indent(indentation) + `${_keyword("return")}`]
        },
        "return1": (indentation, value) => {
            return [indent(indentation) + `${_keyword("return")} ${value.exp}`]
        },
        "swap": (indentation, target1, target2) => {
            return [indent(indentation) + `${target1.exp}, ${target2.exp} = ${target2.exp}, ${target1.exp}`]
        },
        "expline": (indentation, expression) => {
            return [indent(indentation) + expression.exp]
        },
        "opassign1": (indentation, op, arg) => {
            if (op === "++") {
                return [indent(indentation) + `${arg.exp} += ${_const(1)}`]
            } else { // --
                return [indent(indentation) + `${arg.exp} -= ${_const(1)}`]
            }
        },
        "opassign2": function(indentation, op, arg1, arg2) {
            var tempop = op.slice(0, -1);
            var info = this.operators[tempop];
            if (this.opassigns.includes(tempop)) {
                return [indent(indentation) + `${arg1.exp} ${info.op}= ${arg2.exp}`]
            } else {
                return [indent(indentation) + `${arg1.exp} = ` + this.operator2(tempop, arg1, arg2).exp]
            }
        },
        "init": function(indentation, target, shape) {
            var temp = this.const(0).exp;
            if (!shape.length) return [indent(indentation) + `${target.exp} = ` + temp];
            var start = shape[shape.length - 1];
            if (start.order >= this.operators["*"].order) {
                temp = `[${temp}] * (${start.exp})`
            } else {
                temp = `[${temp}] * ${start.exp}`
            }
            for (var i = shape.length - 2; i >= 0; --i) {
                temp = `[${temp} ${_keyword("for")} _ ${_keyword("in")} ${_function("range")}(${shape[i].exp})]`;
            }
            return [indent(indentation) + target.exp + " = " + temp];
        },


        "func": (name, args) => exp(`${_function(name)}(${args.map(x => x.exp).join(", ")})`, -1),
        "varname": (name) => exp(name, -1),
        "const": (value) => exp(_const(value === null?"None":typeof(value) === "number"?value.toString():value?"True":"False"), -1),
        "subscript": (target, index) => exp(`${target.exp}[${index.exp}]`, -1),
        "getlength": (target) => exp(`${_function("len")}(${target.exp})`, -1),
        "random": (min, max) => exp(`${_function("random.randint")}(${min.exp}, ${max.exp})`, -1),
        "operator1": function(op, arg) {
            var info = this.operators[op];
            var temp = arg.exp;
            if (arg.order > info.order) {
                temp = `(${temp})`;
            }
            return exp(`${info.op}${temp}`, info.order);
        },
        "operator2": function(op, arg1, arg2) {
            var info = this.operators[op];
            var temp1 = arg1.exp;
            var temp2 = arg2.exp;
            if (op === "**") { // right to left
                if (arg1.order >= info.order) {
                    temp1 = `(${temp1})`;
                }
                if (arg2.order > info.order) {
                    temp2 = `(${temp2})`;
                }
            } else {
                if (arg1.order > info.order) {
                    temp1 = `(${temp1})`;
                }
                if (arg2.order >= info.order) {
                    temp2 = `(${temp2})`;
                }
            }
            return exp(`${temp1} ${info.op} ${temp2}`, info.order);
        },
    },
    "js": {
        "name": "JavaScript",
        "indentation": 0,
        "operators": { // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
            "!": {"op": "!", "order": 0}, // also mark as unary
            "~": {"op": "~", "order": 0},
            "u+": {"op": "+", "order": 0},
            "u-": {"op": "-", "order": 0},
            "**": {"op": "**", "order": 1},
            "*": {"op": "*", "order": 2},
            "/": {"op": "/", "order": 2}, // no //
            "%": {"op": "%", "order": 2},
            "+": {"op": "+", "order": 3},
            "-": {"op": "-", "order": 3},
            "<<": {"op": "<<", "order": 4},
            ">>": {"op": ">>", "order": 4},
            "<": {"op": "<", "order": 5},
            "<=": {"op": "<=", "order": 5},
            ">": {"op": ">", "order": 5},
            ">=": {"op": ">=", "order": 5},
            "==": {"op": "===", "order": 6},
            "!=": {"op": "!==", "order": 6},
            "&": {"op": "&", "order": 7},
            "^": {"op": "^", "order": 8},
            "|": {"op": "|", "order": 9},
            "&&": {"op": "&&", "order": 10},
            "||": {"op": "||", "order": 11},
        },
        "opassigns": ["+", "-", "**", "/", "*", "%", "<<", ">>", "&", "^", "|", "&&", "||"],
        "code_start": () => [`a = [${dummy}]; ${_comment("// the array to be sorted")}`],
        "code_end": () => [`${_function("main")}();`],
        "function_start": (func) => {
            return [`${_keyword("function")} ${_function(func.name)}(${func.arguments.map(x => x.name).join(", ")}) {`,
            ...((func.variables.length || search_block(func.code, "swap"))?[indent(1) + _keyword("var") + " " + [...func.variables.map(v => v.name), ...(search_block(func.code, "swap")?["temp"]:[])].join(", ") + ";"]:[])];
        },     
        "function_end": (indentation) => [indent(indentation) + "}"],

        "if_start": (indentation, cond) => {
            return [indent(indentation) + `${_keyword("if")} (${cond.exp}) {`];
        },     
        "if_elseif": (indentation, cond) => {
            return [indent(indentation) + `} ${_keyword("else if")} (${cond.exp}) {`];
        },     
        "if_else": (indentation) => {
            return [indent(indentation) + `} ${_keyword("else")} {`];
        },     
        "if_end": (indentation) => [indent(indentation) + "}"],

        "while_start": (indentation, cond) => {
            return [indent(indentation) + `${_keyword("while")} (${cond.exp}) {`];
        },     
        "while_end": (indentation) => [indent(indentation) + "}"],

        "do_while_start": (indentation) => {
            return [indent(indentation) + `${_keyword("do")} {`];
        },     
        "do_while_end": (indentation, cond) => {
            return [indent(indentation) + `} ${_keyword("while")} (${cond.exp});`];
        },

        "repeat_until_start": (indentation) => {
            return [indent(indentation) + `${_keyword("do")} {`];
        },     
        "repeat_until_end": function (indentation, cond) {
            return [indent(indentation) + `} ${_keyword("while")} (${this.operator1("!", cond).exp});`];
        },

        "for_start": function(indentation, target, start, end, step, direction, inclusive) {
            var op = "";
            if (direction === "up") {
                op = "<";
            } else {
                op = ">";
            }
            if (inclusive) {
                op += "=";
            }
            var nextstep;
            if (step.exp === this.const(1).exp) {
                nextstep = `++${target.exp}`;
            } else if (step.exp === this.const(-1).exp) {
                nextstep = `--${target.exp}`;
            } else {
                nextstep = `${target.exp} += ${step.exp}`;
            }
            return [indent(indentation) + `${_keyword("for")} (${target.exp} = ${start.exp}; ${this.operator2(op, target, end).exp}; ${nextstep}) {`];
        },     
        "for_end": (indentation) => [indent(indentation) + "}"],

        "fail": (indentation) => {
            return [indent(indentation) + `${_function("console.log")}(${_string(`"${fail_msg}"`)});`]
        },
        "assign": (indentation, target, value) => {
            return [indent(indentation) + `${target.exp} = ${value.exp};`]
        },
        "continue": (indentation) => {
            return [indent(indentation) + `${_keyword("continue")};`]
        },
        "break": (indentation) => {
            return [indent(indentation) + `${_keyword("break")};`]
        },
        "return0": (indentation) => {
            return [indent(indentation) + `${_keyword("return")};`]
        },
        "return1": (indentation, value) => {
            return [indent(indentation) + `${_keyword("return")} ${value.exp};`]
        },
        "swap": (indentation, target1, target2) => {
            return [indent(indentation) + `temp = ${target1.exp};`,
                    indent(indentation) + `${target1.exp} = ${target2.exp};`,
                    indent(indentation) + `${target2.exp} = temp;`,]
        },
        "expline": (indentation, expression) => {
            return [indent(indentation) + expression.exp + ';']
        },
        "opassign1": (indentation, op, arg) => {
            if (op === "++") {
                return [indent(indentation) + `++${arg.exp};`]
            } else { // --
                return [indent(indentation) + `--${arg.exp};`]
            }
        },
        "opassign2": function(indentation, op, arg1, arg2) {
            var tempop = op.slice(0, -1);
            if (this.opassigns.includes(tempop)) {
                var info = this.operators[tempop];
                return [indent(indentation) + `${arg1.exp} ${info.op}= ${arg2.exp};`]
            } else {
                return [indent(indentation) + `${arg1.exp} = ` + this.operator2(tempop, arg1, arg2).exp + ";"]
            }
        },
        "init": function(indentation, target, shape) {
            var temp = this.const(0).exp;
            if (!shape.length) return [indent(indentation) + `${target.exp} = ` + temp];
            if (shape.length >= 1) temp = `${_keyword("Array")}(${shape[shape.length - 1].exp}).${_function("fill")}(${temp})`;
            for (var i = shape.length - 2; i >= 0; --i) {
                temp = `[...${_keyword("Array")}(${shape[i].exp})].${_function("map")}(() => ${temp})`;
            }
            return [indent(indentation) + target.exp + " = " + temp];
        },


        "func": (name, args) => exp(`${_function(name)}(${args.map(x => x.exp).join(", ")})`, -1),
        "varname": (name) => exp(name, -1),
        "const": (value) => exp(_const(value === null?"null":typeof(value) === "number"?value.toString():value?"true":"false"), -1),
        "subscript": (target, index) => exp(`${target.exp}[${index.exp}]`, -1),
        "getlength": (target) => exp(`${target.exp}.${_function("length")}`, -1),
        "random": function (min, max) {
            var maxmin1 = this.operator2("+", this.operator2("-", max, min), this.const(1));
            if (min.exp === this.const(0).exp) {
                var maxmin1 = this.operator2("+", max, this.const(1));
            } else if (min.exp === this.const(1).exp) {
                var maxmin1 = max;
            }
            var mult = this.operator2("*", exp(`${_function("Math.random")}()`), maxmin1);
            var floor = exp(`${_function("Math.floor")}(` + mult.exp + `)`, -1);
            if (min.exp === this.const(0).exp) {
                return floor;
            }
            return this.operator2("+", floor, min);
        },
        "operator1": function(op, arg) {
            var info = this.operators[op];
            var temp = arg.exp;
            if (arg.order > info.order || arg.order === 1) { // Unary operator used immediately before exponentiation expression.
                temp = `(${temp})`;
            }
            return exp(`${info.op}${temp}`, info.order);
        },
        "operator2": function(op, arg1, arg2) {
            if (op === "//") {
                return exp(`${_function("Math.floor")}(${this.operator2("/", arg1, arg2).exp})`, -1);
            }
            var info = this.operators[op];
            var temp1 = arg1.exp;
            var temp2 = arg2.exp;
            if (op === "**") { // right to left
                if (arg1.order >= info.order) {
                    temp1 = `(${temp1})`;
                }
                if (arg2.order > info.order) {
                    temp2 = `(${temp2})`;
                }
            } else {
                if (arg1.order > info.order) {
                    temp1 = `(${temp1})`;
                }
                if (arg2.order >= info.order) {
                    temp2 = `(${temp2})`;
                }
            }
            return exp(`${temp1} ${info.op} ${temp2}`, info.order);
        },
    },
    "C99": {
        "name": "C (C99)",
        "indentation": 0,
        "operators": { // https://en.cppreference.com/w/c/language/operator_precedence
            "u+": {"op": "+", "order": 0}, // also mark as unary
            "u-": {"op": "-", "order": 0},
            "!": {"op": "!", "order": 0},
            "~": {"op": "~", "order": 0}, // no **
            "*": {"op": "*", "order": 1},
            "/": {"op": "/", "order": 1},
            "//": {"op": "/", "order": 1},
            "%": {"op": "%", "order": 1},
            "+": {"op": "+", "order": 2},
            "-": {"op": "-", "order": 2},
            "<<": {"op": "<<", "order": 3},
            ">>": {"op": ">>", "order": 3},
            "<": {"op": "<", "order": 4},
            "<=": {"op": "<=", "order": 4},
            ">": {"op": ">", "order": 4},
            ">=": {"op": ">=", "order": 4},
            "==": {"op": "==", "order": 5},
            "!=": {"op": "!=", "order": 5},
            "&": {"op": "&", "order": 6},
            "^": {"op": "^", "order": 7},
            "|": {"op": "|", "order": 8},
            "&&": {"op": "&&", "order": 9},
            "||": {"op": "||", "order": 10},
        },
        "opassigns": ["+", "-", "/", "*", "%", "<<", ">>", "&", "^", "|"],
        "code_start": function (algo) {
            var temp = [`${_keyword("#include")} &lt;stdio.h&gt;`];
            if (search_algo(algo, "random")) {
                temp.push(`${_keyword("#include")} &lt;stdlib.h&gt;`)
            };
            temp.push(`${_keyword("long")} a[] = {${dummy}}; ${_comment("// the array to be sorted")}`);
            temp.push(`${_keyword("long")} asize;`);
            if (search_algo(algo, "**")) {
                temp = [
                    ...temp,
                    "",
                    `${_keyword("long")} ${_function("powi")}(${_keyword("long")} x, ${_keyword("long")} n) {`,
                    indent(1) + `${_keyword("long")} p = x;`,
                    indent(1) + `${_keyword("long")} r = 1;`,
                    indent(1) + `${_keyword("while")} (n > 0) {`,
                    indent(2) + `${_keyword("if")} (n % 2) r *= p;`,
                    indent(2) + `p *= p;`,
                    indent(2) + `n >>= 1;`,
                    indent(1) + `}`,
                    indent(1) + `${_keyword("return")} r;`,
                    `}`,
                ];
            };
            return temp;
        },
        "code_end": () => [
            `${_keyword("int")} ${_function("main")}() {`,
            indent(1) + `asize = ${_keyword("sizeof")} a / ${_keyword("sizeof")} *a;`,
            indent(1) + `_main();`,
            indent(1) + `${_keyword("return")} ${_const("0")};`,
            "}"
        ],
        "function_start": function (func) {
            var ret_type = func.return === null?"void":func.return.type === "bool"?"int":"long";
            var temp = [
                `${_keyword(ret_type)} ${_function(func.name==="main"?"_main":func.name)}(${func.arguments.map(x => _keyword("long") + " " + "*".repeat(x.dim) + x.name).join(", ")}) {`
            ]
            var vars = func.variables.filter(x => x.dim == 0);
            if (vars.length || search_block(func.code, "swap")) {
                temp = [
                    ...temp,
                    indent(1) + _keyword("long") + " " + [...vars.map(v => v.name), ...(search_block(func.code, "swap")?["temp"]:[])].join(", ") + ";"
                ]
            }
            return temp;
        },     
        "function_end": (indentation) => [indent(indentation) + "}"],

        "if_start": (indentation, cond) => {
            return [indent(indentation) + `${_keyword("if")} (${cond.exp}) {`];
        },     
        "if_elseif": (indentation, cond) => {
            return [indent(indentation) + `} ${_keyword("else if")} (${cond.exp}) {`];
        },     
        "if_else": (indentation) => {
            return [indent(indentation) + `} ${_keyword("else")} {`];
        },     
        "if_end": (indentation) => [indent(indentation) + "}"],

        "while_start": (indentation, cond) => {
            return [indent(indentation) + `${_keyword("while")} (${cond.exp}) {`];
        },     
        "while_end": (indentation) => [indent(indentation) + "}"],

        "do_while_start": (indentation) => {
            return [indent(indentation) + `${_keyword("do")} {`];
        },     
        "do_while_end": (indentation, cond) => {
            return [indent(indentation) + `} ${_keyword("while")} (${cond.exp});`];
        },

        "repeat_until_start": (indentation) => {
            return [indent(indentation) + `${_keyword("do")} {`];
        },     
        "repeat_until_end": function (indentation, cond) {
            return [indent(indentation) + `} ${_keyword("while")} (${this.operator1("!", cond).exp});`];
        },

        "for_start": function(indentation, target, start, end, step, direction, inclusive) {
            var op = "";
            if (direction === "up") {
                op = "<";
            } else {
                op = ">";
            }
            if (inclusive) {
                op += "=";
            }
            var nextstep;
            if (step.exp === this.const(1).exp) {
                nextstep = `++${target.exp}`;
            } else if (step.exp === this.const(-1).exp) {
                nextstep = `--${target.exp}`;
            } else {
                nextstep = `${target.exp} += ${step.exp}`;
            }
            return [indent(indentation) + `${_keyword("for")} (${target.exp} = ${start.exp}; ${this.operator2(op, target, end).exp}; ${nextstep}) {`];
        },     
        "for_end": (indentation) => [indent(indentation) + "}"],

        "fail": (indentation) => {
            return [indent(indentation) + `${_function("printf")}(${_string(`"${fail_msg}\\n"`)});`]
        },
        "assign": (indentation, target, value) => {
            return [indent(indentation) + `${target.exp} = ${value.exp};`]
        },
        "continue": (indentation) => {
            return [indent(indentation) + `${_keyword("continue")};`]
        },
        "break": (indentation) => {
            return [indent(indentation) + `${_keyword("break")};`]
        },
        "return0": (indentation) => {
            return [indent(indentation) + `${_keyword("return")};`]
        },
        "return1": function (indentation, value, _, vars) {
            return [indent(indentation) + `${_keyword("return")} ${value.exp};`]
        },
        "swap": (indentation, target1, target2) => {
            return [indent(indentation) + `temp = ${target1.exp};`,
                    indent(indentation) + `${target1.exp} = ${target2.exp};`,
                    indent(indentation) + `${target2.exp} = temp;`,]
        },
        "expline": (indentation, expression) => {
            return [indent(indentation) + expression.exp + ';']
        },
        "opassign1": (indentation, op, arg) => {
            if (op === "++") {
                return [indent(indentation) + `++${arg.exp};`]
            } else { // --
                return [indent(indentation) + `--${arg.exp};`]
            }
        },
        "opassign2": function(indentation, op, arg1, arg2) {
            var tempop = op.slice(0, -1);
            if (this.opassigns.includes(tempop)) {
                var info = this.operators[tempop];
                return [indent(indentation) + `${arg1.exp} ${info.op}= ${arg2.exp};`]
            } else {
                return [indent(indentation) + `${arg1.exp} = ` + this.operator2(tempop, arg1, arg2).exp + ";"]
            }
        },
        "init": function(indentation, target, shape) {
            var temp = this.const(0).exp;
            if (!shape.length) return [indent(indentation) + `${target.exp} = ` + temp];
            return [indent(indentation) + _keyword("long ") + target.exp + shape.map(x => `[${x.exp}]`).join("") + ";"];
        },


        "func": (name, args) => exp(`${_function(name)}(${args.map(x => x.exp).join(", ")})`, -1),
        "varname": (name) => exp(name, -1),
        "const": (value) => exp(_const(value === null?"0":typeof(value) === "number"?value.toString():value?"1":"0"), -1),
        "subscript": (target, index) => exp(`${target.exp}[${index.exp}]`, -1),
        "getlength": function (target) {
            if (target.exp === "a") {
                return exp("asize", -1);
            } else {
                return exp("not supported", -1);
            }
        },
        "random": function (min, max) {
            var maxmin1 = this.operator2("+", this.operator2("-", max, min), this.const(1));
            if (min.exp === this.const(0).exp) {
                var maxmin1 = this.operator2("+", max, this.const(1));
            } else if (min.exp === this.const(1).exp) {
                var maxmin1 = max;
            }
            var mods = this.operator2("%", exp(`rand()`, -1), maxmin1);
            if (min.exp === this.const(0).exp) {
                return mods;
            }
            return this.operator2("+", mods, min);
        },
        "operator1": function(op, arg) {
            var info = this.operators[op];
            var temp = arg.exp;
            if (arg.order > info.order) {
                temp = `(${temp})`;
            }
            return exp(`${info.op}${temp}`, info.order);
        },
        "operator2": function(op, arg1, arg2) {
            var temp1 = arg1.exp;
            var temp2 = arg2.exp;
            if (op === "/") {
                if (arg1.order > -1) {
                    temp1 = `(${temp1})`;
                }
                return exp(`(float)${temp1} / ${temp2}`, this.operators["/"].order);
            } else if (op === "**") {
                return exp(`${_function("powi")}(${arg1.exp}, ${arg2.exp})`, -1);
            }
            var info = this.operators[op];
            // left to right
            if (arg1.order > info.order) {
                temp1 = `(${temp1})`;
            }
            if (arg2.order >= info.order) {
                temp2 = `(${temp2})`;
            }
            return exp(`${temp1} ${info.op} ${temp2}`, info.order);
        },
    }
}

var prolang = Object.keys(languages)[0]; // currently selected language
if (typeof selectlanguage !== "undefined") {
    Object.keys(languages).forEach(lang => {
        var option = document.createElement("option");
        option.value = lang;
        option.innerText = languages[lang].name;
        selectlanguage.appendChild(option);
    })
}