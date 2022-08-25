// tools
function _range(start, end, step, direction, inclusive) {
    if (end === undefined) {
        end = start;
        start = 0;
    };
    if (step === undefined) step = 1;
    if (direction === undefined) direction = "up";
    if (inclusive === undefined) inclusive = false;
    return {"start": start, "end": end, "step": step, "direction": direction, "inclusive": inclusive}
}
function _break() {
    return {"type": "break"}
}
function _continue() {
    return {"type": "continue"}
}
function _for(target, range, content) {
    return {"type": "for", "target": target, "start": range.start, "end": range.end, "step": range.step, "direction": range.direction, "inclusive": range.inclusive, "code": content}
}
function _while(condition, content) {
    return {"type": "while", "cond": condition, "code": content}
}
function _do_while(content, condition) {
    return {"type": "do_while", "cond": condition, "code": content}
}
function _repeat_until(content, condition) {
    return {"type": "repeat_until", "cond": condition, "code": content}
}
function _infix(op1, op, op2) {
    return {"type": "op", "op": op, "operands": [op1, op2]}
}
function _not(op) {
    return {"type": "op", "op": "!", "operands": [op]}
}
function _op1(op, op1) {
    return {"type": "op", "op": op, "operands": [op1]}
}
function _sub(target, index) {
    return {"type": "subscript", "target": target, "index": index}
}
function _length(target) {
    return {"type": "length", "target": target};
}
function _assign(target, value) {
    return {"type": "assign", "target": target, "value": value};
}
function _if() {
    var arg = [...arguments];
    var cond = [];
    var bran = [];
    for (var i = 0; i < arg.length - 1; i += 2) {
        cond.push(arg[i]);
        bran.push(arg[i + 1]);
    };
    if (arg.length & 1) {
        bran.push(arg[arg.length - 1]);
    }
    return {"type": "if", "cond": cond, "branches": bran}
}
function _ifh() {
    var arg = [...arguments];
    var cond = [];
    var bran = [];
    for (var i = 0; i < arg.length - 1; i += 2) {
        cond.push(arg[i]);
        bran.push(arg[i + 1]);
    };
    if (arg.length & 1) {
        bran.push(arg[arg.length - 1]);
    }
    return {"type": "ifh", "cond": cond, "branches": bran}
}
function _swap(target1, target2) {
    return {"type": "swap", "targets": [target1, target2]}
}
function _mark(color, index1, index2) {
    return {"type": "mark", "indices": [index1, index2 === undefined?index1:index2], "color": color}
}
function _unmark(index1, index2) {
    return {"type": "unmark", "indices": [index1, index2 === undefined?index1:index2]}
}
function _v(target) {
    var temp = function(index) {
        return _v(_sub(temp.dict, index));
    }
    temp.dict = target;
    return temp;
}
function _func(funcname) {
    var arg = [...arguments].slice(1);
    return {"type": "func", "name": funcname, "arguments": arg};
}
function _return(value) {
    return {"type": "return", "value": value};
}
function _fail() {
    return {"type": "fail"};
}
function _count(flag) {
    return {"type": "count", "value": flag};
}
function _random(min, max) {
    return {"type": "random", "min": min, "max": max};
}
function _init(target, shape) {
    return {"type": "init", "target": target, "shape": shape};
}

// define
var algorithms = {
    "main": {
        "description": "",
        "functions": [
            {
                "name": "main",
                "arguments": [],
                "variables": [],
                "return": null,
                "code": [
                    _func("sort", "a"),
                    _count(false),
                    _if(_not(_func("verify", "a")), [
                        _fail()
                    ]),
                ]
            }
        ]
    },
    "verify": {
        "description": "",
        "functions": [
            {
                "name": "verify",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                ],
                "return": {"type": "bool", "dim": 0},
                "code": [
                    _assign("n", _length("a")),
                    _unmark(0, _infix("n", "-", 1)),
                    _for("i", _range(1, "n"), [
                        _if(_infix(_v("a")(_infix("i", "-", 1)).dict, ">", _v("a")("i").dict), [
                            _return(false)
                        ]),
                        _mark("lime", _infix("i", "-", 1))
                    ]),
                    _mark("lime", _infix("n", "-", 1)),
                    _return(true)
                ]
            }
        ]
    },
    "bubble0": {
        "description": "Bubble Sort does comparisons to adjacent elements sequentially in each pass. Swaps are performed if elements are out of order. At the end of each pass, the largest item from the unsorted part must be at the last position of that part. However, a smaller element can only move towards the beginning by 1 position each pass.",
        "functions": [
            {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                    {"name": "j", "dim": 0},
                ],
                "return": null,
                "code": [
                    _assign("n", _length("a")),
                    _for("i", _range(1, "n"), [
                        _for("j", _range(0, _infix("n", "-", "i")), [
                            _mark("red", "j"),
                            _mark("red", _infix("j", "+", 1)),
                            _if(_infix(_v("a")("j").dict, ">", _v("a")(_infix("j", "+", 1)).dict), [
                                _swap(_v("a")("j").dict, _v("a")(_infix("j", "+", 1)).dict)
                            ]),
                            _unmark(_infix("j", "+", 1)),
                            _unmark("j")
                        ]),
                        _mark("lime", _infix("n", "-", "i"))
                    ]),
                    _mark("lime", 0)
                ]
            }
        ]
    },
    "bubble1": {
        "description": "The optimized version of bubble sort is based on the fact that all elements after the last swap in the pass are sorted. This allows us to skip many redundant comparisons while keeping the swap count the same. The improvement is significant in the k-sorted case, as the array can be sorted within k passes instead of n - 1 passes.",
        "functions": [
            {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                    {"name": "nextn", "dim": 0},
                ],
                "return": null,
                "code": [
                    _assign("n", _length("a")),
                    _while(_infix("n", ">", 1), [
                        _assign("nextn", 0),
                        _mark("#cccc00", "nextn"),
                        _for("i", _range(1, "n"), [
                            _mark("red", "i"),
                            _mark("red", _infix("i", "-", 1)),
                            _if(_infix(_v("a")("i").dict, "<", _v("a")(_infix("i", "-", 1)).dict), [
                                _swap(_v("a")("i").dict, _v("a")(_infix("i", "-", 1)).dict),
                                _unmark("nextn"),
                                _mark("#cccc00", "i"),
                                _assign("nextn", "i"),
                            ]),
                            _unmark("i"),
                            _unmark(_infix("i", "-", 1)),
                            _mark("#cccc00", "nextn"),
                        ]),
                        _mark("lime", "nextn", _infix("n", "-", 1)),
                        _assign("n", "nextn")
                    ]),
                ]
            }
        ]
    },
    "cocktail0": {
        "description": "Cocktail Shaker Sort (or Bidirectional Bubble Sort) is a variation of bubble sort. It is similar to bubble sort, except that in each pass the compare direction is reversed. In this case, the largest item from the unsorted part must be at the last position of that part when the sort direction is towards the end of the array. Also, the smallest item from the unsorted part must be at the first position of that part when the sort direction is towards the beginning.",
        "functions": [
            {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                    {"name": "j", "dim": 0},
                ],
                "return": null,
                "code": [
                    _assign("n", _length("a")),
                    _for("i", _range(0, _infix("n", ">>", 1)), [
                        _for("j", _range("i", _infix(_infix("n", "-", "i"), "-", 1)), [
                            _mark("red", "j"),
                            _mark("red", _infix("j", "+", 1)),
                            _if(_infix(_v("a")("j").dict, ">", _v("a")(_infix("j", "+", 1)).dict), [
                                _swap(_v("a")("j").dict, _v("a")(_infix("j", "+", 1)).dict)
                            ]),
                            _unmark(_infix("j", "+", 1)),
                            _unmark("j")
                        ]),
                        _mark("lime", _infix(_infix("n", "-", "i"), "-", 1)),
                        _for("j", _range(_infix(_infix("n", "-", "i"), "-", 3), "i", -1, "down", true), [
                            _mark("red", "j"),
                            _mark("red", _infix("j", "+", 1)),
                            _if(_infix(_v("a")("j").dict, ">", _v("a")(_infix("j", "+", 1)).dict), [
                                _swap(_v("a")("j").dict, _v("a")(_infix("j", "+", 1)).dict)
                            ]),
                            _unmark(_infix("j", "+", 1)),
                            _unmark("j")
                        ]),
                        _mark("lime", "i")
                    ]),
                    _mark("lime", _infix("n", ">>", 1))
                ]
            }
        ]
    },    
    "cocktail1": {
        "description": "Similar to Bubble Sort's optimization, cocktail shaker sort can also be optimized to reduce the number of passes required, by recording the last sorted index after each pass.",
        "functions": [
            {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "low", "dim": 0},
                    {"name": "high", "dim": 0},
                    {"name": "t", "dim": 0},
                    {"name": "i", "dim": 0},
                ],
                "return": null,
                "code": [
                    _assign("low", 0),
                    _assign("high", _infix(_length("a"), "-", 2)),
                    _while(_infix("low", "<=", "high"), [
                        _assign("t", "low"),
                        _mark("#cccc00", "t"),
                        _for("i", _range("low", "high", 1, "up", true), [
                            _mark("red", "i"),
                            _mark("red", _infix("i", "+", 1)),
                            _if(_infix(_v("a")("i").dict, ">", _v("a")(_infix("i", "+", 1)).dict), [
                                _swap(_v("a")("i").dict, _v("a")(_infix("i", "+", 1)).dict),
                                _unmark("t"),
                                _mark("#cccc00", "i"),
                                _assign("t", "i"),
                            ]),
                            _unmark(_infix("i", "+", 1)),
                            _unmark("i"),
                            _mark("#cccc00", "t"),
                        ]),
                        _unmark("t"),
                        _mark("lime", _infix("t", "+", 1), _infix("high", "+", 1)),
                        _assign("high", _infix("t", "-", 1)),
                        _assign("t", "high"),
                        _mark("#cccc00", "t"),
                        _for("i", _range("high", "low", -1, "down", true), [
                            _mark("red", "i"),
                            _mark("red", _infix("i", "+", 1)),
                            _if(_infix(_v("a")("i").dict, ">", _v("a")(_infix("i", "+", 1)).dict), [
                                _swap(_v("a")("i").dict, _v("a")(_infix("i", "+", 1)).dict),
                                _unmark("t"),
                                _mark("#cccc00", "i"),
                                _assign("t", "i"),
                            ]),
                            _unmark(_infix("i", "+", 1)),
                            _unmark("i"),
                            _mark("#cccc00", "t"),
                        ]),
                        _unmark("t"),
                        _mark("lime", "low", "t"),
                        _assign("low", _infix("t", "+", 1)),
                    ]),
                    _mark("lime", "low"),
                ]
            }
        ]
    },
    "selection0": {
        "description": "Selection Sort chooses the smallest element in the unsorted section and swap it to the front of the section in each pass. n - 1 passes are needed. This does far less swap than bubble sort, yet they have the same time complexity. Since the whole array has to be accessed in order to choose the smallest element, there are no significant optimizations in the total numner of passes that work for all situation.",
        "functions": [
            {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                    {"name": "j", "dim": 0},
                    {"name": "min", "dim": 0},
                ],
                "return": null,
                "code": [
                    _assign("n", _length("a")),
                    _for("i", _range(_infix("n", "-", 1)), [
                        _assign("min", "i"),
                        _for("j", _range(_infix("i", "+", 1), "n"), [
                            _mark("red", "min"),
                            _mark("red", "j"),
                            _if(_infix(_v("a")("j").dict, "<", _v("a")("min").dict), [
                                _unmark("min"),
                                _assign("min", "j")
                            ]),
                            _unmark("min"),
                            _unmark("j")
                        ]),
                        _swap(_v("a")("i").dict, _v("a")("min").dict),
                        _mark("lime", "i")
                    ]),
                    _mark("lime", _infix("n", "-", 1))
                ]
            }
        ]
    },
    "selection1": {
        "description": "Selection Sort with an extra variable to record the value of the smallest element in the pass to reduce the number of array accesses.",
        "functions": [
            {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                    {"name": "j", "dim": 0},
                    {"name": "min", "dim": 0},
                    {"name": "minv", "dim": 0},
                ],
                "return": null,
                "code": [
                    _assign("n", _length("a")),
                    _for("i", _range(_infix("n", "-", 1)), [
                        _assign("min", "i"),
                        _assign("minv", _v("a")("i").dict),
                        _for("j", _range(_infix("i", "+", 1), "n"), [
                            _mark("red", "j"),
                            _if(_infix(_v("a")("j").dict, "<", "minv"), [
                                _assign("min", "j"),
                                _assign("minv", _v("a")("j").dict)
                            ]),
                            _unmark("j")
                        ]),
                        _swap(_v("a")("i").dict, _v("a")("min").dict),
                        _mark("lime", "i")
                    ]),
                    _mark("lime", _infix("n", "-", 1))
                ]
            }
        ]
    },
    "insertion0": {
        "description": "Insertion Sort inserts each unsorted element to the correct place in the sorted list by repeatedly comparing with the previous element to find the correct position. Though the worst time complexitry is still quadratic, it is efficient for k-sorted array since at most k swaps are needed in each pass.",
        "functions": [
            {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                    {"name": "j", "dim": 0},
                ],
                "return": null,
                "code": [
                    _assign("n", _length("a")),
                    _mark("lime", 0),
                    _for("i", _range(1, "n"), [
                        _mark("red", "i"),
                        _assign("j", "i"),
                        _mark("red", _infix("j", "-", 1)),
                        _while(_infix(_infix("j", ">", 0), "&&", _infix(_v("a")(_infix("j", "-", 1)).dict, ">", _v("a")("j").dict)), [
                            _swap(_v("a")(_infix("j", "-", 1)).dict, _v("a")("j").dict),
                            _mark("lime", "j"),
                            _op1("--", "j"),
                            _ifh(_infix("j", ">", 0), [
                                _mark("red", _infix("j", "-", 1)),
                            ])
                        ]),
                        _mark("lime", "j"),
                        _ifh(_infix("j", ">", 0), [
                            _mark("lime", _infix("j", "-", 1)),
                        ])
                    ]),
                ]
            }
        ]
    },
    "merge0": {
        "description": "Merge Sort uses divide-and-conquer strategy to split the array into two halves, sorting each of them, and merge them back into a sorted array. An extra array needs to be defined when merging, which is a drawback to implement in devices with limited extra memory. Also, it needs to be run completely even if the initial array is already sorted.",
        "functions": [               
            {
                "name": "merge",
                "arguments": [
                    {"name": "a", "dim": 1},
                    {"name": "low", "dim": 0},
                    {"name": "mid", "dim": 0},
                    {"name": "high", "dim": 0},
                ],
                "variables": [
                    {"name": "lcur", "dim": 0},
                    {"name": "rcur", "dim": 0},
                    {"name": "cur", "dim": 0},
                    {"name": "arr", "dim": 1},
                ],
                "return": null,
                "code": [
                    _init("arr", [_infix(_infix("high", "-", "low"), "+", 1)]),
                    _assign("lcur", "low"),
                    _assign("rcur", _infix("mid", "+", 1)),
                    _mark("red", "lcur"),
                    _mark("red", "rcur"),
                    _assign("cur", 0),
                    _while(_infix(_infix("lcur", "<=", "mid"), "||", _infix("rcur", "<=", "high")), [
                        _if(_infix(_infix("rcur", ">", "high"), "||", _infix(_infix("lcur", "<=", "mid"), "&&", _infix(_v("a")("lcur").dict, "<=", _v("a")("rcur").dict))), [
                            _assign(_v("arr")("cur").dict, _v("a")("lcur").dict),
                            _op1("++", "lcur"),
                            _unmark(_infix("lcur", "-", 1)),
                            _ifh(_infix("lcur", "<=", "mid"), [
                                _mark("red", "lcur"),
                            ])
                        ], [
                            _assign(_v("arr")("cur").dict, _v("a")("rcur").dict),
                            _op1("++", "rcur"),
                            _unmark(_infix("rcur", "-", 1)),
                            _ifh(_infix("rcur", "<=", "high"), [
                                _mark("red", "rcur"),
                            ]),
                        ]),
                        _op1("++", "cur")
                    ]),
                    _for("cur", _range(_infix(_infix("high", "-", "low"), "+", 1)), [
                        _mark("red", _infix("cur", "+", "low")),
                        _assign(_v("a")(_infix("cur", "+", "low")).dict, _v("arr")("cur").dict),
                        _unmark(_infix("cur", "+", "low")),
                    ])
                ]
            }, {
                "name": "mergesort",
                "arguments": [
                    {"name": "a", "dim": 1},
                    {"name": "low", "dim": 0},
                    {"name": "high", "dim": 0},
                ],
                "variables": [
                    {"name": "mid", "dim": 0},
                ],
                "return": null,
                "code": [
                    _if(_infix("low", "<", "high"), [
                        _assign("mid", _infix(_infix("low", "+", "high"), ">>", 1)),
                        _func("mergesort", "a", "low", "mid"),
                        _func("mergesort", "a", _infix("mid", "+", 1), "high"),
                        _func("merge", "a", "low", "mid", "high")
                    ])
                ]
            }, {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [],
                "return": null,
                "code": [
                    _func("mergesort", "a", 0, _infix(_length("a"), "-", 1))
                ]
            }
        ]
    },
    "merge1": {
        "description": "Bottom-up merge sort works similarly to the normal merge sort, except that the left subarray always has a size of a power of 2 when merging takes place. It does not require recursion, but a for loop with increasing step instead. It also requires a temporary array as the storage.",
        "functions": [               
            {
                "name": "merge",
                "arguments": [
                    {"name": "a", "dim": 1},
                    {"name": "arr", "dim": 1},
                    {"name": "low", "dim": 0},
                    {"name": "mid", "dim": 0},
                    {"name": "high", "dim": 0},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "lcur", "dim": 0},
                    {"name": "rcur", "dim": 0},
                    {"name": "cur", "dim": 0},
                ],
                "return": null,
                "code": [
                    _assign("n", _length("a")),
                    _if(_infix("mid", ">", "n"), [
                        _assign("mid", "n")
                    ]),
                    _if(_infix("high", ">", "n"), [
                        _assign("high", "n")
                    ]),
                    _assign("lcur", "low"),
                    _assign("rcur", "mid"),
                    _mark("red", "lcur"),
                    _ifh(_infix("rcur", "<", "high"), [
                        _mark("red", "rcur"),
                    ]),
                    _assign("cur", "low"),
                    _while(_infix("cur", "<", "high"), [
                        _if(_infix(_infix("rcur", ">=", "high"), "||", _infix(_infix("lcur", "<", "mid"), "&&", _infix(_v("a")("lcur").dict, "<=", _v("a")("rcur").dict))), [
                            _assign(_v("arr")("cur").dict, _v("a")("lcur").dict),
                            _op1("++", "lcur"),
                            _unmark(_infix("lcur", "-", 1)),
                            _ifh(_infix("lcur", "<", "mid"), [
                                _mark("red", "lcur"),
                            ])
                        ], [
                            _assign(_v("arr")("cur").dict, _v("a")("rcur").dict),
                            _op1("++", "rcur"),
                            _unmark(_infix("rcur", "-", 1)),
                            _ifh(_infix("rcur", "<", "high"), [
                                _mark("red", "rcur"),
                            ]),
                        ]),
                        _op1("++", "cur")
                    ]),
                    _for("cur", _range("low", "high", 1, "up", false), [
                        _mark("red", "cur"),
                        _assign(_v("a")("cur").dict, _v("arr")("cur").dict),
                        _unmark("cur"),
                    ])
                ]
            }, {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "arr", "dim": 1},
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                    {"name": "step", "dim": 0},
                ],
                "return": null,
                "code": [
                    _assign("n", _length("a")),
                    _init("arr", ["n"]),
                    _assign("step", 1),
                    _while(_infix("step", "<", "n"), [
                        _for("i", _range(0, "n", _infix("step", "<<", 1)), [
                            _func("merge", "a", "arr", "i", _infix("i", "+", "step"), _infix("i", "+", _infix("step", "<<", 1)))
                        ]),
                        _infix("step", "<<=", 1)
                    ])
                ]
            }
        ]
    },
    "bogo0": {
        "description": "Bogosort is a sorting algorithm that shuffles the whole array until it is sorted. The best-case time complexity is O(n), which is the time complexity to shuffle the array. The average time complexity is O((n+1)!), which is not even a polynomial. The worse-case time complexity is unbounded, which means there is no guarantee that the array can be sorted in finite time. Fisher–Yates Shuffle is used in this implementation.",
        "functions": [               
            {
                "name": "shuffle",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                    {"name": "j", "dim": 0},
                ],
                "return": null,
                "code": [
                    _assign("n", _length("a")),
                    _for("i", _range(_infix("n", "-", 1), 0, -1, "down"), [
                        _mark("red", "i"),
                        _assign("j", _random(0, "i")),
                        _mark("red", "j"),
                        _swap(_v("a")("i").dict, _v("a")("j").dict),
                        _unmark("i"),
                        _unmark("j"),
                    ])
                ]
            }, {
                "name": "sorted",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                ],
                "return": {"type": "bool", "dim": 0},
                "code": [
                    _assign("n", _length("a")),
                    _unmark(0, _infix("n", "-", 1)),
                    _for("i", _range(1, "n"), [
                        _if(_infix(_v("a")(_infix("i", "-", 1)).dict, ">", _v("a")("i").dict), [
                            _unmark(0, _infix("n", "-", 1)),
                            _return(false)
                        ]),
                        _mark("lime", _infix("i", "-", 1))
                    ]),
                    _mark("lime", _infix("n", "-", 1)),
                    _unmark(0, _infix("n", "-", 1)),
                    _return(true)
                ]
            }, {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [],
                "return": null,
                "code": [
                    _while(_not(_func("sorted", "a")), [
                        _func("shuffle", "a")
                    ])
                ]
            }
        ]
    },
    "bogo1": {
        "description": "Bounded Bogosort replaces the shuffle function of bogosort by looping through all the permutations of the array instead. The worst-case complexity in this case is bounded to O((n+1)!). Heap's algorithm is used in this implementation to list out the permutations.",
        "functions": [
            {
                "name": "sorted",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                ],
                "return": {"type": "bool", "dim": 0},
                "code": [
                    _assign("n", _length("a")),
                    _unmark(0, _infix("n", "-", 1)),
                    _for("i", _range(1, "n"), [
                        _if(_infix(_v("a")(_infix("i", "-", 1)).dict, ">", _v("a")("i").dict), [
                            _unmark(0, _infix("n", "-", 1)),
                            _return(false)
                        ]),
                        _mark("lime", _infix("i", "-", 1))
                    ]),
                    _mark("lime", _infix("n", "-", 1)),
                    _unmark(0, _infix("n", "-", 1)),
                    _return(true)
                ]
            }, {
                "name": "generate",
                "arguments": [
                    {"name": "a", "dim": 1},
                    {"name": "n", "dim": 0},
                ],
                "variables": [
                    {"name": "i", "dim": 0},
                ],
                "return": {"type": "bool", "dim": 0},
                "code": [
                    _if(_infix("n", "==", 1), [
                        _return(_func("sorted", "a"))
                    ], [
                        _for("i", _range("n"), [
                            _if(_func("generate", "a", _infix("n", "-", 1)), [
                                _return(true)
                            ]),
                            _if(_infix(_infix("n", "%", 2), "==", 0), [
                                _mark("red", "i"),
                                _mark("red", _infix("n", "-", 1)),
                                _swap(_v("a")("i").dict, _v("a")(_infix("n", "-", 1)).dict),
                                _unmark("i"),
                                _unmark(_infix("n", "-", 1)),
                            ], [
                                _mark("red", 0),
                                _mark("red", _infix("n", "-", 1)),
                                _swap(_v("a")(0).dict, _v("a")(_infix("n", "-", 1)).dict),
                                _unmark(0),
                                _unmark(_infix("n", "-", 1)),
                            ])
                        ])
                    ]),
                    _return(false)
                ]
            }, {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                ],
                "return": null,
                "code": [
                    _assign("n", _length("a")),
                    _if(_not(_func("generate", "a", "n")), [
                        _fail()
                    ])
                ]
            }
        ]
    },
    "bozo0": {
        "description": "Bozosort is a sorting algorithm inspired by bogosort. It swaps two random elements from the array until it is sorted.",
        "functions": [
            {
                "name": "sorted",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                ],
                "return": {"type": "bool", "dim": 0},
                "code": [
                    _assign("n", _length("a")),
                    _unmark(0, _infix("n", "-", 1)),
                    _for("i", _range(1, "n"), [
                        _if(_infix(_v("a")(_infix("i", "-", 1)).dict, ">", _v("a")("i").dict), [
                            _unmark(0, _infix("n", "-", 1)),
                            _return(false)
                        ]),
                        _mark("lime", _infix("i", "-", 1))
                    ]),
                    _mark("lime", _infix("n", "-", 1)),
                    _unmark(0, _infix("n", "-", 1)),
                    _return(true)
                ]
            }, {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                    {"name": "j", "dim": 0},
                ],
                "return": null,
                "code": [
                    _assign("n", _length("a")),
                    _while(_not(_func("sorted", "a")), [
                        _assign("i", _random(0, _infix("n", "-", 1))),
                        _mark("red", "i"),
                        _assign("j", _random(0, _infix("n", "-", 1))),
                        _mark("red", "j"),
                        _swap(_v("a")("i").dict, _v("a")("j").dict),
                        _unmark("i"),
                        _unmark("j"),
                    ])
                ]
            }
        ]
    },
    "stooge0": {
        "description": "Stooge Sort uses recursion strategy to sort an array. It bases on the fact that an array can be sorted by first sorting the first 2/3 of the array, then the last 2/3, and finally the first 2/3 again. Since each recursive call produces 3 calls with the range only shrink by 1/3, the time complexity is O(n<sup>log<sub>1.5</sub>3</sup>) ≈ O(n<sup>2.71</sup>), which is even slower than bubble sort.",
        "functions": [               
            {
                "name": "stoogesort",
                "arguments": [
                    {"name": "a", "dim": 1},
                    {"name": "low", "dim": 0},
                    {"name": "high", "dim": 0},
                ],
                "variables": [
                    {"name": "count", "dim": 0},
                ],
                "return": null,
                "code": [
                    _mark("red", "low"),
                    _mark("red", "high"),
                    _if(_infix(_v("a")("low").dict, ">", _v("a")("high").dict), [
                        _swap(_v("a")("low").dict, _v("a")("high").dict),
                    ]),
                    _unmark("low"),
                    _unmark("high"),
                    _if(_infix(_infix("high", "-", "low"), ">", 1), [
                        _assign("count", _infix(_infix(_infix("high", "-", "low"), "+", 1), "//", 3)),
                        _func("stoogesort", "a", "low", _infix("high", "-", "count")),
                        _func("stoogesort", "a", _infix("low", "+", "count"), "high"),
                        _func("stoogesort", "a", "low", _infix("high", "-", "count")),
                    ]),
                ]
            }, {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [],
                "return": null,
                "code": [
                    _func("stoogesort", "a", 0, _infix(_length("a"), "-", 1))
                ]
            }
        ]
    },
    "quickH": {
        "description": "Quick Sort recursively picks a pivot and partition the array into two parts by comparing with the pivot. The original quick sort is developed by Tony Hoare in 1959. This version takes the middle element as the pivot and checks for inversions on two sides of the pivots and do swappings. This is not a stable sort, which mean elements with the same value containing extra data may end up swapping their orders.",
        "functions": [               
            {
                "name": "partition",
                "arguments": [
                    {"name": "a", "dim": 1},
                    {"name": "low", "dim": 0},
                    {"name": "high", "dim": 0},
                ],
                "variables": [
                    {"name": "pivot", "dim": 0},
                    {"name": "left", "dim": 0},
                    {"name": "right", "dim": 0},
                ],
                "return": {"type": "int", "dim": 0},
                "code": [
                    _mark("#cccc00", "low", "high"),
                    _assign("pivot", _v("a")(_infix(_infix("high", "+", "low"), ">>", 1)).dict),
                    _assign("left", _infix("low", "-", 1)),
                    _assign("right", _infix("high", "+", 1)),
                    _while(true, [
                        _do_while([
                            _ifh(_infix("left", ">=", "low"), [
                                _mark("#cccc00", "left"),
                            ]),
                            _mark("red", _infix("left", "+", 1)),
                            _op1("++", "left"),
                        ], _infix(_v("a")("left").dict, "<", "pivot")),
                        _do_while([
                            _ifh(_infix("right", "<=", "high"), [
                                _mark("#cccc00", "right"),
                            ]),
                            _mark("red", _infix("right", "-", 1)),
                            _op1("--", "right"),
                        ], _infix(_v("a")("right").dict, ">", "pivot")),
                        _if(_infix("left", ">=", "right"), [
                            _unmark("low", "high"),
                            _return("right")
                        ]),
                        _swap(_v("a")("left").dict, _v("a")("right").dict),
                        _mark("#cccc00", "left"),
                        _mark("#cccc00", "right"),
                    ])
                ]
            }, {
                "name": "quicksort",
                "arguments": [
                    {"name": "a", "dim": 1},
                    {"name": "low", "dim": 0},
                    {"name": "high", "dim": 0},
                ],
                "variables": [
                    {"name": "pivot", "dim": 0},
                ],
                "return": null,
                "code": [
                    _if(_infix(_infix(_infix("low", ">=", 0), "&&", _infix("high", ">=", 0)), "&&", _infix("low", "<", "high")), [
                        _assign("pivot", _func("partition", "a", "low", "high")),
                        _func("quicksort", "a", "low", "pivot"),
                        _func("quicksort", "a", _infix("pivot", "+", 1), "high"),
                    ])
                ]
            }, {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [],
                "return": null,
                "code": [
                    _func("quicksort", "a", 0, _infix(_length("a"), "-", 1))
                ]
            }
        ]
    },
    "quickL": {
        "description": "Quick Sort recursively picks a pivot and partition the array into two parts by comparing with the pivot. This version of quick sort is attributed to Nico Lomuto. This version takes the last element as the pivot and moves the larger elements to the right of it by swapping. This is not a stable sort, which mean elements with the same value containing extra data may end up swapping their orders.",
        "functions": [               
            {
                "name": "partition",
                "arguments": [
                    {"name": "a", "dim": 1},
                    {"name": "low", "dim": 0},
                    {"name": "high", "dim": 0},
                ],
                "variables": [
                    {"name": "pivot", "dim": 0},
                    {"name": "i", "dim": 0},
                    {"name": "left", "dim": 0},
                ],
                "return": {"type": "int", "dim": 0},
                "code": [
                    _mark("#cccc00", "low", "high"),
                    _assign("pivot", _v("a")("high").dict),
                    _assign("left", _infix("low", "-", 1)),
                    _ifh(_infix("left", ">=", "low"), [
                        _mark("red", "left"),
                    ]),
                    _mark("blue", "high"),
                    _for("i", _range("low", "high"), [
                        _mark("red", "i"),
                        _if(_infix(_v("a")("i").dict, "<=", "pivot"), [
                            _ifh(_infix("left", ">=", "low"), [
                                _mark("#cccc00", "left"),
                            ]),
                            _mark("red", _infix("left", "+", 1)),
                            _op1("++", "left"),
                            _swap(_v("a")("left").dict, _v("a")("i").dict)
                        ]),
                        _mark("#cccc00", "i"),
                    ]),
                    _ifh(_infix("left", ">=", "low"), [
                        _mark("#cccc00", "left"),
                    ]),
                    _mark("red", _infix("left", "+", 1)),
                    _op1("++", "left"),
                    _mark("red", "high"),
                    _swap(_v("a")("left").dict, _v("a")("high").dict),
                    _unmark("low", "high"),
                    _return("left")
                ]
            }, {
                "name": "quicksort",
                "arguments": [
                    {"name": "a", "dim": 1},
                    {"name": "low", "dim": 0},
                    {"name": "high", "dim": 0},
                ],
                "variables": [
                    {"name": "pivot", "dim": 0},
                ],
                "return": null,
                "code": [
                    _if(_infix(_infix("low", ">=", 0), "&&", _infix("low", "<", "high")), [
                        _assign("pivot", _func("partition", "a", "low", "high")),
                        _func("quicksort", "a", "low", _infix("pivot", "-", 1)),
                        _func("quicksort", "a", _infix("pivot", "+", 1), "high"),
                    ])
                ]
            }, {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [],
                "return": null,
                "code": [
                    _func("quicksort", "a", 0, _infix(_length("a"), "-", 1))
                ]
            }
        ]
    },
    "quickL3": {
        "description": "It is noticed that a common initial array, which is the already sorted array, results in the worst-case performance O(n<sup>2</sup>) in Lomuto partition version. To prevent a bad pivot from being chosen, some suggests that median-of-3 can be used as the pivot instead. The median-of-3 is defined as the median between values of low, high and the middle elements. This also improves the number of comparsions during sorting.",
        "functions": [               
            {
                "name": "partition",
                "arguments": [
                    {"name": "a", "dim": 1},
                    {"name": "low", "dim": 0},
                    {"name": "high", "dim": 0},
                ],
                "variables": [
                    {"name": "pivot", "dim": 0},
                    {"name": "mid", "dim": 0},
                    {"name": "i", "dim": 0},
                    {"name": "left", "dim": 0},
                ],
                "return": {"type": "int", "dim": 0},
                "code": [
                    _mark("#cccc00", "low", "high"),
                    _assign("mid", _infix(_infix("low", "+", "high"), ">>", 1)),
                    _mark("red", "mid"),
                    _mark("red", "low"),
                    _if(_infix(_v("a")("mid").dict, "<", _v("a")("low").dict), [
                        _swap(_v("a")("low").dict, _v("a")("mid").dict)
                    ]),
                    _mark("#cccc00", "mid"),
                    _mark("red", "high"),
                    _if(_infix(_v("a")("high").dict, "<", _v("a")("low").dict), [
                        _swap(_v("a")("low").dict, _v("a")("high").dict)
                    ]),
                    _mark("#cccc00", "low"),
                    _mark("red", "mid"),
                    _if(_infix(_v("a")("mid").dict, "<", _v("a")("high").dict), [
                        _swap(_v("a")("mid").dict, _v("a")("high").dict)
                    ]),
                    _mark("#cccc00", "mid"),
                    _mark("#cccc00", "high"),
                    _assign("pivot", _v("a")("high").dict),
                    _assign("left", _infix("low", "-", 1)),
                    _ifh(_infix("left", ">=", "low"), [
                        _mark("red", "left"),
                    ]),
                    _mark("blue", "high"),
                    _for("i", _range("low", "high"), [
                        _mark("red", "i"),
                        _if(_infix(_v("a")("i").dict, "<=", "pivot"), [
                            _ifh(_infix("left", ">=", "low"), [
                                _mark("#cccc00", "left"),
                            ]),
                            _mark("red", _infix("left", "+", 1)),
                            _op1("++", "left"),
                            _swap(_v("a")("left").dict, _v("a")("i").dict)
                        ]),
                        _mark("#cccc00", "i"),
                    ]),
                    _ifh(_infix("left", ">=", "low"), [
                        _mark("#cccc00", "left"),
                    ]),
                    _mark("red", _infix("left", "+", 1)),
                    _op1("++", "left"),
                    _swap(_v("a")("left").dict, _v("a")("high").dict),
                    _unmark("low", "high"),
                    _return("left")
                ]
            }, {
                "name": "quicksort",
                "arguments": [
                    {"name": "a", "dim": 1},
                    {"name": "low", "dim": 0},
                    {"name": "high", "dim": 0},
                ],
                "variables": [
                    {"name": "pivot", "dim": 0},
                ],
                "return": null,
                "code": [
                    _if(_infix(_infix("low", ">=", 0), "&&", _infix("low", "<", "high")), [
                        _assign("pivot", _func("partition", "a", "low", "high")),
                        _func("quicksort", "a", "low", _infix("pivot", "-", 1)),
                        _func("quicksort", "a", _infix("pivot", "+", 1), "high"),
                    ])
                ]
            }, {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [],
                "return": null,
                "code": [
                    _func("quicksort", "a", 0, _infix(_length("a"), "-", 1))
                ]
            }
        ]
    },
    "heap0": {
        "description": "Heap Sort creates a max-heap from the array. After that, it extracts the maximum element from the heap one-by-one and put it at the end of the unsorted section. The unsorted part is kept as a valid max-heap throughout the extraction process. Heap structure significantly improves sorting speed from the standard selection sort. It also has a guaranteed linearithmic worst-case time complexity (O(n log n)).",
        "functions": [
            {
                "name": "siftDown",
                "arguments": [
                    {"name": "a", "dim": 1},
                    {"name": "i", "dim": 0},
                    {"name": "n", "dim": 0},
                ],
                "variables": [
                    {"name": "swap", "dim": 0},
                ],
                "return": null,
                "code": [
                    _while(_infix(_infix(_infix("i", "<<", 1), "+", 1), "<", "n"), [
                        _assign("swap", _infix(_infix("i", "<<", 1), "+", 1)),
                        _mark("#cccc00", "i"),
                        _mark("red", "swap"),
                        _ifh(_infix(_infix("swap", "+", 1), "<", "n"), [
                            _mark("red", _infix("swap", "+", 1)),
                        ]),
                        _if(_infix(_infix(_infix("swap", "+", 1), "<", "n"), "&&", _infix(_v("a")("swap").dict, "<", _v("a")(_infix("swap", "+", 1)).dict)), [
                            _unmark("swap"),
                            _op1("++", "swap")
                        ]),
                        _unmark(_infix(_infix("i", "<<", 1), "+", 1)),
                        _ifh(_infix(_infix(_infix("i", "<<", 1), "+", 2), "<", "n"), [
                            _unmark(_infix(_infix("i", "<<", 1), "+", 2)),
                        ]),
                        _mark("red", "swap"),
                        _mark("red", "i"),
                        _if(_infix(_v("a")("i").dict, ">", _v("a")("swap").dict), [
                            _unmark("i"),
                            _unmark("swap"),
                            _break()
                        ]),
                        _swap(_v("a")("i").dict, _v("a")("swap").dict),
                        _unmark("i"),
                        _assign("i", "swap"),
                        _unmark("swap"),
                    ])
                ]
            },
            {
                "name": "sort",
                "arguments": [
                    {"name": "a", "dim": 1},
                ],
                "variables": [
                    {"name": "n", "dim": 0},
                    {"name": "i", "dim": 0},
                ],
                "return": null,
                "code": [
                    _assign("n", _length("a")),
                    _for("i", _range(_infix(_infix("n", "-", 2), ">>", 1), 0, -1, "down", true), [
                        _func("siftDown", "a", "i", "n")
                    ]),
                    _for("i", _range(_infix("n", "-", 1), 0, -1, "down"), [
                        _swap(_v("a")("i").dict, _v("a")(0).dict),
                        _mark("lime", "i"),
                        _func("siftDown", "a", 0, "i"),
                    ]),
                    _mark("lime", 0),
                ]
            }
        ]
    },
}