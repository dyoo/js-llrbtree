/*jslint vars: true, white: true, nomen: true, maxerr: 50, indent: 4 */

var LLRBTree = {};

// The code basically follows the structure of
// https://github.com/kazu-yamamoto/llrbtree
//
// Mostly comes from the code in:
//
// https://github.com/kazu-yamamoto/llrbtree/blob/master/Data/RBTree/LL.hs
//
// as well as:
//
// https://github.com/kazu-yamamoto/llrbtree/blob/master/Data/RBTree/Internal.hs

(function() {
    'use strict';

    // function declarations
    var turnR, turnB;
    var insert_, balanceL, balanceR, replaceX, remove_;
    var removeLT, removeGT, removeEQ;
    var isRed, isBlack, isBlackLeftBlack, isBlackLeftRed;
    var hardMin;
    var minimum, removeMin_;


    // red and black colors.
    var R = "RED", B = "BLACK";

    // An rbtree is either a Leaf or a Node.

    var Node = function(c, //h,
                        l, x, r) {
        this.c = c; // color: (U R B)
        //this.h = h; // height: int
        this.l = l; // left: rbtree
        this.x = x; // x : element
        this.r = r; // right: rbtree
    };

    var Leaf = function() {};

    var EMPTY = new Leaf();


    // Either returns the element, or undefined if we hit a leaf.
    var find = function(tree, x, cmp) {
        while (true) {
            if (tree instanceof Leaf) { return undefined; }
            else {
                var cmpval = cmp(x, tree.x);
                if (cmpval < 0) {
                    tree = tree.l;
                } else if (cmpval > 0) {
                    tree = tree.r;
                } else {
                    return tree.x;
                }
            }
        }
    };



    var insert = function(tree, x, cmp) {
        return turnB(insert_(tree, x, cmp));
    };

    insert_ = function(tree, x, cmp) {
        var cmpval;
        if (tree instanceof Leaf) {
            return new Node(R, //1,
                            EMPTY, x, EMPTY);
        } else {
            cmpval = cmp(x, tree.x);
            if (cmpval < 0) {
                return balanceL(tree.c, tree.h, insert_(tree.l, x, cmp), tree.x, tree.r);
            } else if (cmpval > 0) {
                return balanceR(tree.c, tree.h, tree.l, tree.x, insert_(tree.r, x, cmp));
            } else {
                return replaceX(tree, x);
            }
        }
    };

    balanceL = function(c, h, l, x, r) {
        if (c === B &&
            l instanceof Node && l.c === R 
            && l.l instanceof Node && l.l.c === R) {
            return new Node(R,// h+1,
                            turnB(l.l), l.x, new Node(B, //h,
                                                      l.r, x, r));
        } else {
            return new Node(c,// h,
                            l, x, r);
        }
    };

    balanceR = function(c, h, l, x, r) {
        if (c === B &&
           l instanceof Node && l.c === R &&
           r instanceof Node && r.c === R) {
            return new Node(R,// h+1,
                            turnB(l), x, turnB(r));
        } else if (r instanceof Node &&
                  r.c === R) {
            return new Node(c,// h,
                            new Node(R,// r.h,
                                     l, x, r.l), r.x, r.r);
        } else {
            return new Node(c,// h,
                            l, x, r);
        }
    };


    var remove = function(tree, x, cmp) {
        var removed;
        if (tree instanceof Leaf) { 
            return tree; 
        } else {
            removed = remove_(turnR(tree), x, cmp);
            if (removed instanceof Leaf) {
                return removed;
            } else {
                return turnB(removed);
            }
        }
    };

    remove_ = function(tree, x, cmp) {
        var cmpval;
        if (tree instanceof Leaf) { 
            return tree; 
        } else {
            cmpval = cmp(x, tree.x);
            if (cmpval < 0) {
                return removeLT(x, tree.c, tree.h, tree.l, tree.x, tree.r, cmp);
            } else if (cmpval > 0) { 
                return removeGT(x, tree.c, tree.h, tree.l, tree.x, tree.r, cmp);
            } else {
                return removeEQ(x, tree.c, tree.h, tree.l, tree.x, tree.r, cmp);
            }
        }
    };

    removeLT = function(kx, c, h, l, x, r, cmp) {
        var isBB;
        var isBR;
        if (c === R) {
            isBB = isBlackLeftBlack(l);
            isBR = isBlackLeftRed(r);
            if (isBB && isBR) {
                return new Node(R,
                                //h,
                                new Node(B,// r.h,
                                         remove_(turnR(l), kx, cmp), x, r.l.l),
                                r.l.x,
                                new Node(B,// r.h,
                                         r.l.r, r.x, r.r));
            } else if (isBB) {
                return balanceR(B, h-1, remove_(turnR(l), kx, cmp), x, turnR(r));
            }
        }
        return new Node(c,// h,
                        remove_(l, kx, cmp), x,  r);
    };


    removeGT = function(kx, c, h, l, x, r, cmp) {
        var isBB, isBR;
        if (l instanceof Node && l.c === R) {
            return balanceR(c, h, l.l, l.x, remove_(new Node(R,// h,
                                                             l.r, x, r), kx, cmp));
        }
        if (c === R) {
            isBB = isBlackLeftBlack(r);
            isBR = isBlackLeftRed(l);
            if (isBB && isBR) {
                return new Node(R, 
                                //h,
                                turnB(l.l), 
                                l.x, 
                                balanceR(B, l.h, l.r, x, remove_(turnR(r), kx, cmp)));
            } 
            if (isBB) {
                return balanceR(B, h-1, turnR(l), x, remove_(turnR(r), kx, cmp));
            }
        }
        if (c === R) {
            return new Node(R,// h,
                            l, x, remove_(r, kx, cmp));
        }
        throw new Error("removeGT");
    };

    removeEQ = function(kx, c, h, l, x, r, cmp) {
        var isBB, isBR, m;
        if (c === R && l instanceof Leaf && r instanceof Leaf) {
            return EMPTY;
        }
        if (l instanceof Node && l.c === R) {
            return balanceR(c, h, l.l, l.x, remove_(new Node(R,// h,
                                                             l.r, x, r), kx, cmp));
        }
        if (c === R) {
            isBB = isBlackLeftBlack(r);
            isBR = isBlackLeftRed(l);
            if (isBB && isBR) {
                m = minimum(r);
                return balanceR(R, h, turnB(l.l), l.x, balanceR(B, l.h, l.r, m, removeMin_(turnR(r))));
            }
            if (isBB) {
                m = minimum(r);
                return balanceR(B, h-1, turnR(l), m, removeMin_(turnR(r)));
            }
        }
        if (c === R &&
            r instanceof Node && r.c === B) {
            m = minimum(r);
            return new Node(R,// h,
                            l, m, new Node(B,// r.h,
                                           removeMin_(r.l), r.x, r.r));
        }
        try {
            throw new Error("removeEQ");
        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    };


    removeMin_ = function(t) {
        var h, l, x, r, isBB, isBR;
        if (t instanceof Node && t.c === R && 
            t.l instanceof Leaf && t.r instanceof Leaf) {
            return EMPTY;
        }
        if (t instanceof Node && t.c === R) {
            h = t.h; l = t.l; x = t.x; r = t.r;
            isBB = isBlackLeftBlack(l);
            isBR = isBlackLeftRed(r);
            if (isRed(l)) {
                return new Node(R,// h,
                                removeMin_(l), x, r);
            } else if (isBB && isBR) {
                return hardMin(t);
            } else if (isBB) {
                return balanceR(B, h-1, removeMin_(turnR(l)), x, turnR(r));
            } else {
                return new Node(R,// h,
                                new Node(B,// l.h,
                                         removeMin_(l.l), l.x, l.r), x, r);
            }
        }
        throw new Error("removeMin");
    };


    hardMin = function(t) {
        if (t instanceof Node && t.c === R &&
            t.r instanceof Node && t.r.c === B &&
            t.r.l instanceof Node && t.r.l.c === R) {
            return new Node(R,
                            //t.h, 
                            new Node(B,// t.r.h,
                                     removeMin_(turnR(t.l)), t.x, t.r.l.l), 
                            t.r.l.x,
                            new Node(B,// t.r.h,
                                     t.r.l.r, t.r.x, t.r.r));
        }
        throw new Error("hardMin");
    };



    //////////////////////////////////////////////////////////////////////

    // turnB: llrbtree -> llrbtree
    turnB = function(tree) {
        if (tree instanceof Leaf) { throw new Error("turnB"); }
        return new Node(B, //tree.h,
                        tree.l, tree.x, tree.r);
    };

    // turnR: llrbtree -> llrbtree
    turnR = function(tree) {
        if (tree instanceof Leaf) { throw new Error("turnR"); }
        return new Node(R, //tree.h,
                        tree.l, tree.x, tree.r);
    };

    // turnR: llrbtree x -> llrbtree
    replaceX = function(tree, x) {
        if (tree instanceof Leaf) { throw new Error("replaceElt"); }
        return new Node(tree.c, //tree.h,
                        tree.l, x, tree.r);
    };

    // isBlack: llrbtree -> boolean
    isBlack = function(tree) {
        if (tree instanceof Leaf) { return true; }
        return tree.c === B;
    };

    // isRed: llrbtree -> boolean
    isRed = function(tree) {
        if (tree instanceof Leaf) { return false; }
        return tree.c === R;
    };

    // isBlackLeftBlack: llrbtree -> boolean
    isBlackLeftBlack = function(tree) {
        if (tree instanceof Node) {
            if (tree.c === B) {
                if (tree.l instanceof Leaf) {
                    return true;
                } else {
                    return tree.l.c === B;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    };


    // isBlackLeftRed: llrbtree -> boolean
    isBlackLeftRed = function(tree) {
        if (tree instanceof Node) {
            if (tree.c === B) {
                if (tree.l instanceof Node) {
                    return tree.l.c === R;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    };


    // minimum: llrbtree -> X
    // Returns the minimum element in the tree.
    minimum = function(tree) {
        if (tree instanceof Leaf) { throw new Error("minimum"); }
        while(true) {
            if (tree.l instanceof Leaf) { 
                return tree.x;
            }
            tree = tree.l;
        }
    };




    //////////////////////////////////////////////////////////////////////
    LLRBTree.EMPTY = EMPTY;
    LLRBTree.insert = insert;
    LLRBTree.find = find;
    LLRBTree.remove = remove;

}());