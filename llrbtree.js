var LLRBTree = {};

(function() {
    'use strict';
    var RED = 0, BLACK = 1;

    // An rbtree is either a Leaf or a Node.

    var Node = function(l, h, r, c) {
        this.c = c; // color: (U RED BLACK)
        this.h = h; // height: integer
        this.l = l; // left: rbtree
        this.r = r; // right: rbtree

    };

    var Leaf = function() {};

    var EMPTY = new Leaf();


}());