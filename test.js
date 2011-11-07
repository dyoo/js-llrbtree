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
             }
         });








// insert all the letter of the alphabet, then delete them in random
// order.  See that nothing breaks.  Do this repeatedly.



