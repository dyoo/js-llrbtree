// insert the letters of some small set, in all permutations, make
// sure we get them in the right order.

var perms = function(a) {
    var i, j, results = [], inserted;
    if (a.length === 0) { return [a]; }
    var subPerms = perms(a.slice(1));
    for (i = 0; i < subPerms.length; i++) {
        inserted = insertBetween(a[0], subPerms[i]);
        for (j = 0; j < inserted.length; j++ ) {
            results.push(inserted[j]);
        }
    }
    return results;
};



var EMPTY = LLRBTree.EMPTY;
var insert = function(tree, n) {
    return LLRBTree.insert(tree, n, numcmp);
};

var insertMany = function(tree, a) {
    var i;
    for (i = 0; i < a.length; i++) {
        tree = insert(tree, a[i]);
    }
    return tree;
};


var find = function(tree, n) {
    return LLRBTree.find(tree, n, numcmp);
};

var numcmp = function(x, y) { 
    if (x < y) { return -1; }
    if (x > y) { return 1; }
    return 0;
};


describe('simple tests',
         {
             'empty test': function() {
                 value_of(find(EMPTY, 0)).should_be(undefined);
             },

             'insert single element': function() {
                 value_of(find(insert(EMPTY, 0), 0)).should_be(0);
             },

             'insert single element, search failing': function() {
                 value_of(find(insert(EMPTY, 0), 1)).should_be(undefined);
             },
             
             'insert a few elements in sequence': function() {
                 var t = EMPTY;
                 var i;
                 for (i = 0; i < 100; i++) {
                     t = insert(t, i);
                 }
                 for (i = 0; i < 100; i++) {
                     value_of(find(t, i)).should_be(i);
                 }
                 value_of(find(t, -1)).should_be(undefined);
                 value_of(find(t, 100)).should_be(undefined);
             },

             'insert a few elements in reverse sequence': function() {
                 var t = EMPTY;
                 var i;
                 for (i = 99; i >= 0; i--) {
                     t = insert(t, i);
                 }
                 for (i = 0; i < 100; i++) {
                     value_of(find(t, i)).should_be(i);
                 }
                 value_of(find(t, -1)).should_be(undefined);
                 value_of(find(t, 100)).should_be(undefined);
             },

             'insert a few numbers in scrambled order': function() {
                 var a = [3, 1, 4, 2, 6, 19, -50, 27];
                 var i;
                 var tree = insertMany(EMPTY, a);
                 for (i = 0; i < a.length; i++) {
                     value_of(find(tree, a[i])).should_be(a[i]);
                 }
             }
         });








// insert all the letter of the alphabet, then delete them in random
// order.  See that nothing breaks.  Do this repeatedly.



