// var JefNode = require('json-easy-filter').JefNode;
unflattenToObject = function(array, parent) {
    var tree = {};
    parent = typeof parent !== 'undefined' ? parent : {id: 0};

    var childrenArray = array.filter(function(child) {
        return child.parentid == parent.id;
    });

    if (childrenArray.length > 0) {
        var childrenObject = {};
        // Transform children into a hash/object keyed on token
        childrenArray.forEach(function(child) {
            childrenObject[child.id] = child;
        });
        if (parent.id == 0) {
            tree = childrenObject;
        } else {
            parent['children'] = childrenObject;
        }
        childrenArray.forEach(function(child) {
            unflattenToObject(array, child);
        })
    }

    return tree;
};
//
// var arr = [
//     {'id':1 ,'parentid': 0},
//     {'id':2 ,'parentid': 1},
//     {'id':3 ,'parentid': 1},
//     {'id':4 ,'parentid': 2},
//     {'id':5 ,'parentid': 0},
//     {'id':6 ,'parentid': 0},
//     {'id':7 ,'parentid': 4}
// ];
// path="";
//
// tree = unflattenToObject(arr);
// console.log(JSON.stringify(tree))
// // js_traverse(tree)
//
//
// function js_traverse(o) {
//     var type = typeof o
//     if (type == "object") {
//         for (var key in o) {
//             console.log("key: ", key)
//             js_traverse(o[key])
//         }
//     } else {
//         console.log(o)
//     }
// }
// var json={"glossary": {
//     "title": "example glossary",
//     "GlossDiv": {
//         "title": "S",
//         "GlossList": {
//             "GlossEntry": {
//                 "ID": "SGML",
//                 "SortAs": "SGML",
//                 "GlossTerm": "Standard Generalized Markup Language",
//                 "Acronym": "SGML",
//                 "Abbrev": "ISO 8879:1986",
//                 "GlossDef": {
//                     "para": "A meta-markup language, used to create markup languages such as DocBook.",
//                     "GlossSeeAlso": ["GML",
//                         "XML"]
//                 },
//                 "GlossSee": "markup"
//             }
//         }
//     }
// }};
//
// function getKeys(keys, obj, path) {
//     for(key in obj) {
//         var currpath = path+'/'+key;
//         keys.push([key, currpath]);
//         if(typeof(obj[key]) == 'object' && !(obj[key] instanceof Array))
//             getKeys(keys, obj[key], currpath);
//     }
// }
// //
// var keys = [];
// getKeys(keys, json, '');
// for(var i=0; i<keys.length; i++)
//     console.log(keys[i][0] + '=' + keys[i][1]);

// var source=[{'k':'01'},
//     {'k':'02', 'children': [
//         {'k':'05'},
//         {'k':'06', 'children': [
//             {'k':'ABC'},
//             {'k':'PQR'}
//         ]},
//         {'k':'07'}
//     ]},
//     {'k':'03'}];

// function getChildren(key){
//     var x = source.filter(function(s){
//         return s.k == key;
//     });
//
//     if( x.length && typeof x[0].children !== 'undefined') {
//         return x[0].children;
//     }
//
//     return false;
// }

// // console.log(getChildren('02'))
// var data = [
//     {'k':'01'} ,
//     {'k':'02',
//         'children':[
//             {'k':'05'},
//             {'k':'06',
//                 'children':[
//                     {'k':'ABC'},
//                     {'k':'PQR'}
//                 ]
//             },
//             {'k':'07'}
//         ]
//     },
//     {'k':'03'}
// ];
//
// function mergeChildren(sources) {
//     var children = [];
//     for (var index in sources) {
//         var source = sources[index];
//         children.push({k: source.k});
//         if (source.children) {
//             children = children.concat(mergeChildren(source.children))
//         }
//     }
//     return children;
// }
//
// function findChildrenForK(sources, k) {
//     for (var index in sources) {
//         var source = sources[index];
//         if (source.k === k) {
//             if (source.children) {
//                 return mergeChildren(source.children);
//             }
//         }
//     }
// }
//
// // console.log(findChildrenForK(data, '01'))
// function getChilds(source){
//
//     source.forEach(function(x,y){
//
//         console.log(x.k);
//
//         if( x.children != undefined){
//
//             getChilds(x.children);
//
//         }
//
//     })
//
// }
// getChilds(JSON.stringify(tree))

function levelAndSort(data, startingLevel) {
    // indexes
    var indexed = {};        // the original values
    var nodeIndex = {};      // tree nodes
    var i;
    for (i = 0; i < data.length; i++) {
        var id = data[i].id;
        var node = {
            id: id,
            level: startingLevel,
            children: [],
            sorted: false
        };
        indexed[id] = data[i];
        nodeIndex[id] = node;
    }

    // populate tree
    for (i = 0; i < data.length; i++) {
        var node = nodeIndex[data[i].id];
        var pNode = node;
        var j;
        var nextId = indexed[pNode.id].parentId;
        for (j = 0; nextId in nodeIndex; j++) {
            pNode = nodeIndex[nextId];
            if (j == 0) {
                pNode.children.push(node.id);
            }
            node.level++;
            nextId = indexed[pNode.id].parentId;
        }
    }

    // extract nodes and sort-by-level
    var nodes = [];
    for (var key in nodeIndex) {
        nodes.push(nodeIndex[key]);
    }
    nodes.sort(function(a, b) {
        return a.level - b.level;
    });

    // refine the sort: group-by-siblings
    var retval = [];
    for (i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var parentId = indexed[node.id].parentId;
        if (parentId in indexed) {
            var pNode = nodeIndex[parentId];
            var j;
            for (j = 0; j < pNode.children.length; j++) {
                var child = nodeIndex[pNode.children[j]];
                if (!child.sorted) {
                    indexed[child.id].level = child.level;
                    retval.push(indexed[child.id]);
                    child.sorted = true;
                }
            }
        }
        else if (!node.sorted) {
            indexed[node.id].level = node.level;
            retval.push(indexed[node.id]);
            node.sorted = true;
        }
    }
    return retval;
}

var startingLevel = 1;
var someData = [ { username: 'tronghuy2807',
        fullname: 'Đỗ Trọng Huy',
        email: 'tronghuy2807@gmail.com',
        phone: '01674106164',
        birthdate: '1993-07-28',
        sex: 'Nam',
        cmt: '01784523',
        org: 'Viking',
        bankacc: '0123456',
        bankbranch: 'VPBank - Dong Do',
        addr: 'Ha Noi',
        img: '',
        __v: 0,
        id: '001',
        parentId: '' },
        { username: 'namnt',
            fullname: 'Nguyễn Thành Nam',
            email: 'namnt@gmail.com',
            phone: '01674106168',
            birthdate: '1993-05-06',
            sex: 'Nam',
            cmt: '01457893',
            org: 'Viking',
            bankacc: '0123456',
            bankbranch: 'VPBank - Dong Do',
            id: '002',
            parentId: '001',
            addr: 'Ha Noi',
            img: '',
            __v: 0 },
        { username: 'phuongha',
            fullname: 'Hoàng Anh Phương',
            email: 'phuongha@gmail.com',
            phone: '01674106164',
            birthdate: '1993-08-28',
            sex: 'Nam',
            cmt: '01457893',
            org: 'Viking',
            bankacc: '0123456',
            bankbranch: 'VPBank - Dong Do',
            id: '003',
            parentId: '001',
            addr: 'Ha Noi',
            img: '',
            __v: 0 },
        { username: 'hieplv',
            fullname: 'Lê Văn Hiệp',
            email: 'hieplv@gmail.com',
            phone: '01674106168',
            birthdate: '1993-03-31',
            sex: 'Nam',
            cmt: '01457893',
            org: 'VCCorp',
            bankacc: '0123456',
            bankbranch: 'VPBank - Dong Do',
            id: '004',
            parentId: '002',
            addr: 'Ha Noi',
            img: '',
            __v: 0 },
        { username: 'huongnt',
            fullname: 'Nguyễn Thị Hương',
            email: 'huongnt@gmail.com',
            phone: '01674106168',
            birthdate: '1995-01-01',
            sex: 'Nữ',
            cmt: '01784523',
            org: 'Viking',
            bankacc: '0123456',
            bankbranch: 'VPBank - Dong Do',
            id: '005',
            parentId: '002',
            addr: 'Ha Noi',
            img: '',
            __v: 0 },
        { username: 'nghiant',
            fullname: 'Nguyễn Tuấn Nghĩa',
            email: 'nghiant@gmail.com',
            phone: '01674106168',
            birthdate: '1993-02-02',
            sex: 'Nam',
            cmt: '01457893',
            org: 'NS',
            bankacc: '0123456',
            bankbranch: 'VPBank - Dong Do',
            id: '006',
            parentId: '005',
            addr: 'Ha Noi',
            img: '',
            __v: 0 },
        { username: 'tuongvc',
            fullname: 'Vũ Cát Tường',
            email: 'tuongvc@gmail.com',
            phone: '01674106164',
            birthdate: '1992-03-03',
            sex: 'Nữ',
            cmt: '01457893',
            org: 'VCCorp',
            bankacc: '0123456',
            bankbranch: 'VPBank - Dong Do',
            id: '007',
            parentId: '006',
            addr: 'Ha Noi',
            img: '',
            __v: 0 },
        { username: 'namnv1',
            fullname: 'Nguyễn Văn Nam',
            email: 'namnv1@gmail.com',
            phone: '0912724400',
            birthdate: '1992-04-04',
            sex: 'Nam',
            cmt: '01457893',
            org: 'VCCorp',
            bankacc: '0123456',
            bankbranch: 'VPBank - Dong Do',
            id: '008',
            parentId: '006',
            addr: 'Ha Noi',
            img: '',
            __v: 0 } ];
var outputArray = levelAndSort(someData, startingLevel);
console.log(outputArray)
myL =[];
myList =[];
function getChildren(arr,list) {
    a=[];
    for(j=0;j<list.length;j++) {
        for (i= 0; i < arr.length; i++) {
            if (arr[i].parentId === list[j].id) {
                myL.push(arr[i]);
                a.push(arr[i]);
            }
        }
    }
    if(a.length>0) {
        getChildren(outputArray,a);
    }
}
for(m=0;m<outputArray.length;m++){
    if(outputArray[m].parentId==="id-2"){
        myList.push(outputArray[m]);
    }
}
getChildren(outputArray,myList)
// console.log(myList)
// console.log(myL)