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

    // red and black colors.
    var R = 0, B = 1;

    // An rbtree is either a Leaf or a Node.

    var Node = function(c, h, l, x, r) {
        this.c = c; // color: (U R B)
        this.h = h; // height: int
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

    var insert_ = function(tree, x, cmp) {
        var cmpval;
        if (tree instanceof Leaf) {
            return new Node(R, 1, EMPTY, x, EMPTY);
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

    var balanceL = function(c, h, l, x, r) {
        if (c === B &&
            l instanceof Node && l.c === R 
            && l.l instanceof Node && l.l.c === R) {
            return new Node(R, h+1, turnB(l.l), l.x, new Node(B, h, l.r, x, r));
        } else {
            return new Node(c, h, l, x, r);
        }
    };

    var balanceR = function(c, h, l, x, r) {
        if (c === B &&
           l instanceof Node && l.c === R &&
           r instanceof Node && r.c === R) {
            return new Node(R, h+1, turnB(l), x, turnB(r));
        } else if (r instanceof Node &&
                  r.c === R) {
            return new Node(c, h, new Node(R, r.h, l, x, r.l), r.x, r.r);
        } else {
            return new Node(c, h, l, x, r);
        }
    };


    var remove = function(tree, x, cmp) {
        var removed;
        if (tree instanceof Leaf) { 
            return tree; 
        } else {
            removed = remove_(tree, x, cmp);
            if (removed instanceof Leaf) {
                return removed;
            } else {
                return turnB(removed);
            }
        }
    };

    var remove_ = function(tree, x, cmp) {
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

    var removeLT = function(kx, c, h, l, x, r, cmp) {
        var isBB;
        var isBR;
        if (c === R &&
            r instanceof Node && r.c === B &&
            r.l instanceof Node &&
            r.l.c === R) {
            isBB = isBlackLeftBlack(l);
            isBR = isBlackLeftRed(r);
            if (isBB && isBR) {
                return new Node(R,
                                h,
                                new Node(B, r.h, remove_(kx, turnR(l), cmp), x, r.l.l),
                                r.l.x,
                                new Node(B, r.h, r.l.r, r.x, r.r));
            } else if (isBB) {
                return balanceR(B, h-1, remove_(kx, turnR(l), cmp), x, turnR(r));
            }
        }
        return new Node(c, h, remove_(kx, l, cmp) x r);
    };


    var removeGT = function(kx, c, h, l, x, r, cmp) {

    };

    var removeEQ = function(kx, c, h, l, x, r, cmp) {
    };


    //////////////////////////////////////////////////////////////////////

    // turnB: llrbtree -> llrbtree
    var turnB = function(tree) {
        if (tree instanceof Leaf) { throw new Error("turnB"); };
        return new Node(B, tree.h, tree.l, tree.x, tree.r);
    };

    // turnR: llrbtree -> llrbtree
    var turnR = function(tree) {
        if (tree instanceof Leaf) { throw new Error("turnR"); };
        return new Node(R, tree.h, tree.l, tree.x, tree.r);
    };

    // turnR: llrbtree x -> llrbtree
    var replaceX = function(tree, x) {
        if (tree instanceof Leaf) { throw new Error("replaceElt"); };
        return new Node(tree.c, tree.h, tree.l, x, tree.r);
    };

    // isBlack: llrbtree -> boolean
    var isBlack = function(tree) {
        if (tree instanceof Leaf) { return true; }
        return tree.c === B;
    };

    // isRed: llrbtree -> boolean
    var isRed = function(tree) {
        if (tree instanceof Leaf) { return true; }
        return tree.c === R;
    };

    // isBlackLeftBlack: llrbtree -> boolean
    var isBlackLeftBlack = function(tree) {
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
    var isBlackLeftRed = function(tree) {
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





    //////////////////////////////////////////////////////////////////////
    LLRBTree.EMPTY = EMPTY;
    LLRBTree.insert = insert;
    LLRBTree.find = find;
    LLRBTree.remove = remove;

}());