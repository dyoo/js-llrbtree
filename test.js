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


var shuffle = function(array) {
    var tmp, current, top = array.length;
    if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }
    return array;
};



var EMPTY = LLRBTree.EMPTY;
var insert = function(tree, n) {
    return LLRBTree.insert(tree, n, numcmp);
};

var remove = function(tree, n) {
    return LLRBTree.remove(tree, n, numcmp);
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

             'inserting repeatedly should be fine': function() {
                 var t = insert(EMPTY, 0);
                 t = insert(EMPTY, 0);
                 t = insert(EMPTY, 0);
                 t = insert(EMPTY, 0);
                 t = insert(EMPTY, 0);
                 value_of(find(t, 0)).should_be(0);
                 value_of(find(t, 1)).should_be(undefined);
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
             },


             'shuffle and test' : function() {
                 var a = [];
                 var i;
                 var tree;
                 var BIG;
                 for (BIG = 1; BIG <= 100000; BIG = BIG * 10) {
                     for (i = 0; i < BIG; i++) {
                         a[i] = i;
                     }

                     shuffle(a);
                     var startTime = new Date();
                     tree = insertMany(EMPTY, a);
                     var stopTime = new Date();
                     if (window.console) {
                         console.log(BIG, stopTime-startTime);
                     }
                     for (i = 0; i < a.length; i++) {
                         value_of(find(tree, a[i])).should_be(a[i]);
                     }
                 }
             },


             'removing from an empty should be idempotent': function() {
                 var t = EMPTY;
                 value_of(remove(t, 0)).should_be(EMPTY);
             },


             'removing nonexisting element should do nothing': function() {
                 var t = insert(EMPTY, 1);
                 value_of(remove(t, -1)).should_be(insert(EMPTY, 1));
             },

             'removing nonexisting element should do nothing': function() {
                 var t = insert(EMPTY, 1);
                 value_of(remove(t, 0)).should_be(insert(EMPTY, 1));
             },

             'removing element should get us empty': function() {
                 var t = insert(EMPTY, 1);
                 value_of(remove(t, 1)).should_be(EMPTY);
             }


         });








// insert all the letter of the alphabet, then delete them in random
// order.  See that nothing breaks.  Do this repeatedly.



