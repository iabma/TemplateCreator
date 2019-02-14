let input = document.getElementsByTagName("textarea")[0],
    output = document.getElementById("out");

var dropMenu = [{ name: "Create Dropdown", fn: add }],
    optionMenu = [{ name: "Add Option", fn: option }];

let addDropMenu = new ContextMenu('.content', dropMenu, {
        className: "context-menu"
    }),
    addOptionMenu = new ContextMenu('.drop', optionMenu, {
        className: "context-menu"
    });

/* var level = 0,
    inProgression = 0,
    inVariable = 0,
    isFirst = true,
    updating = false,
    updateString = ""; */
edits = [],
    undone = [];

var formatted = {},
    id = 0;

let backgroundColor = d3.scaleLinear()
    .domain([0, 15])
    .range(["rgb(220, 220, 220)", "rgb(24, 24, 24)"])
    .interpolate(d3.interpolateHcl)

/* function search(id, tree) {
    let returnVal = null;
    Object.keys(tree).forEach(obj => {
        if (tree[obj].id == id) {
            returnVal = tree[obj];
        }
    });

    return returnVal;
}

function searchType(id, tree) {
    console.log(tree.id)
    console.log(id)
    if (tree.id == id) {
        return tree;
    }
    if (tree.content != null) {
        var i, result = null;
        console.log("pls");

        for (i = 0; result == null && i < tree.content.length; i++) {
            console.log("hi")
            result = searchType(id, tree.content[i]);
        }

        return result;
    }

    return null;
}

function replaceStr(tree, id, content) {
    if (tree.content != null) {
        var found = false;
        tree.content.forEach(obj => {
            if (obj.id == id) {
                obj.content = content;
                found = true;
            }
        });
        if (!found) {
            tree.content.push({
                id: id,
                type: "text",
                content: content
            });
        }
    } else {
        tree.content = [{
            id: id,
            type: "text",
            content: content
        }];
    }
}

function addDropdown(tree, id, name) {
    if (tree.content != null) {
        var found = false;
        tree.content.forEach(obj => {
            if (obj.id == id) {
                obj.name = name;
                found = true;
            }
        });
        if (!found) {
            tree.content.push({
                id: id,
                type: "variable",
                name: name,
                content: []
            });
        }
    } else {
        tree.content = [{
            id: id,
            type: "variable",
            name: name,
            content: []
        }];
    }
}

function addProgression(tree, id) {
    if (tree.content != null) {
        tree.content.push({
            id: id,
            type: "progression",
            content: []
        });
    } else {
        tree.content = [{
            id: id,
            type: "progression",
            content: []
        }];
    }
} */

function searchOpt(content, i) {
    let opt = {
        type: "progression",
        content: []
    }
    let str = content[i++];
    while (str != "/div") {
        if (str == 'div contenteditable="false" class="drop" style="background: rgb(176, 176, 176);"') {
            let ret = searchDropdown(content, i);
            i = ret[0] - 1;
            opt.content.push(ret[1]);
        } else if (str.length > 0 && str != " " && str != "/div") {
            opt.content.push(str);
        }
        str = content[i++];
    }
    if (opt.content.length == 1 && typeof opt.content[0] === "string") {
        return [i, opt.content[0]]
    } else {
        return [i, opt];
    }
}

function searchDropdown(content, i) {
    let obj = {
        type: "dropdown",
        content: []
    }
    let str = content[i++];
    while (str != "/div") {
        if (str == 'div class="content" contenteditable="true"') {
            let ret = searchOpt(content, i);
            i = ret[0];
            obj.content.push(ret[1])
        }
        str = content[i++];
    }
    return [i, obj];
}

function updateContent(typeName) {
    let content = document.getElementById(typeName).getElementsByClassName("content")[0].innerHTML.split(/[<>]/);
    var JSONContent = [];
    console.log(content)
    for (var i = 0; i < content.length; i++) {
        if (content[i] == 'div contenteditable="false" class="drop" style="background: rgb(176, 176, 176);"') {
            let ret = searchDropdown(content, i);
            i = ret[0] - 1;
            JSONContent.push(ret[1]);
        } else if (content[i].length > 0 && content[i] != " " && content[i] != "/div") {
            JSONContent.push(content[i]);
        }
    }
    if (formatted[typeName])
        formatted[typeName].content = JSONContent;
    updateJSON();
}

function add(div) {
    console.log(div.name)
    let selected = document.getSelection().getRangeAt(0);
    let info = selected.toString();
    selected.insertNode(document.createTextNode("\u0001"));
    selected.collapse(false);
    selected.insertNode(document.createTextNode("\u0001"));
    var prevContent = div.innerHTML.split("\u0001");
    prevContent[1] = addDrop(info);
    div.innerHTML = prevContent.join("");
    updateContent(div.closest(".template").id);
}

function option(div, info) {
    let opt = document.createElement("div");
    opt.className = "content";
    opt.contentEditable = true;
    opt.innerHTML = info ? info : "";
    opt.addEventListener("keyup", () => {
        updateContent(div.closest(".template").id)
    })
    div.appendChild(opt);
}

function addDrop(info, div) {
    let drop = document.createElement("div")
    drop.contentEditable = false;
    drop.className = "drop";
    drop.style.background = backgroundColor(3);
    option(drop, info);
    return drop.outerHTML;
}

function newTemplate() {
    document.getElementById("template").remove();
    let remove = document.createElement("div");
    remove.className = "create";
    remove.innerHTML = "x";
    remove.addEventListener("click", () => {
        template.remove();
    })
    let addType = document.createElement("div");
    addType.className = "create";
    addType.innerHTML = "add type";
    addType.addEventListener("click", () => {
        newType();
    });
    let field = document.createElement("textarea");
    field.className = "field";
    field.placeholder = "template name (e.g. WBC)";
    let template = document.createElement("div");
    template.className = "template";
    template.id = "mainTemplate";
    template.style.background = backgroundColor(0);
    template.appendChild(remove);
    template.appendChild(addType);
    template.appendChild(field);
    output.appendChild(template);
    field.focus();
    field.addEventListener("keyup", (key) => {
        formatted.name = field.value;
        updateJSON();
    });
}

function newType() {
    var depth = 1;
    let remove = document.createElement("div");
    remove.className = "create";
    remove.innerHTML = "x";
    let field = document.createElement("textarea");
    field.className = "field";
    field.placeholder = "type (i.e. English)";
    let content = document.createElement("div");
    content.className = "content";
    content.innerHTML = ""
    content.tabIndex = 0;
    content.contentEditable = true;
    content.name = depth;
    let type = document.createElement("div");
    type.className = "template";
    type.id = field.value;
    type.name = "type";
    type.style.background = backgroundColor(depth);
    type.appendChild(remove);
    type.appendChild(field);
    type.appendChild(content);
    document.getElementById("mainTemplate").appendChild(type);
    field.focus();
    var prev,
        prevContent = [];
    field.addEventListener("keyup", () => {
        type.id = field.value;
        if (prev != null) {
            if (prevContent.length > 0) {
                prevContent = formatted[prev].content;
            }
            delete formatted[prev];
        }
        formatted[field.value] = {
            content: prevContent
        };
        prev = field.value;
        updateContent(type.id);
    });
    content.addEventListener("keyup", () => {
        updateContent(type.id);
    })
    remove.addEventListener("click", () => {
        delete search(type.id, formatted);
        type.remove();
    })
}

/* function newString(parent, name, depth) {
    let remove = document.createElement("div");
    remove.className = "create";
    remove.innerHTML = "x";
    let field = document.createElement("textarea");
    field.className = "field";
    field.placeholder = "enter text (i.e. Platelets >= )";
    let string = document.createElement("div");
    string.className = "template";
    string.id = id++;
    string.style.background = backgroundColor(depth + 1);
    string.appendChild(remove);
    parent.appendChild(string);
    string.appendChild(field);
    if (parent.name == "type") {
        replaceStr(search(parent.id, formatted), string.id, field.value);
    } else {
        replaceStr(searchType(parent.id, formatted[name.value]), string.id, field.value);
    }
    updateJSON();
    field.focus();
    field.addEventListener("keyup", () => {
        if (parent.name == "type") {
            replaceStr(search(parent.id, formatted), string.id, field.value);
        } else {
            replaceStr(searchType(parent.id, formatted[name.value]), string.id, field.value);
        }
        updateJSON();
    });
    remove.addEventListener("click", () => {
        if (parent.name == "type") {
            let content = search(parent.id, formatted).content
            content.splice(content.indexOf(searchType(string.id, formatted[name.value])), 1);
        } else {
            let content = searchType(parent.id, formatted[name.value]).content
            content.splice(content.indexOf(searchType(string.id, formatted[name.value])), 1);
        }
        string.remove();
        updateJSON();
    })
}

function newDropdown(parent, name, depth) {
    depth++;
    let remove = document.createElement("div");
    remove.className = "create";
    remove.innerHTML = "x";
    let string = document.createElement("div");
    string.className = "create";
    string.innerHTML = "add text";
    let dropdown = document.createElement("div");
    dropdown.className = "create";
    dropdown.innerHTML = "add dropdown";
    let progression = document.createElement("div");
    progression.className = "create";
    progression.innerHTML = "add progression";
    let field = document.createElement("textarea");
    field.className = "field";
    field.placeholder = "name (i.e. VARIABLE1)";
    let drop = document.createElement("div");
    drop.className = "template";
    drop.id = id++;
    drop.style.background = backgroundColor(depth);
    drop.appendChild(remove);
    drop.appendChild(string);
    drop.appendChild(dropdown);
    drop.appendChild(progression);
    drop.appendChild(field);
    parent.appendChild(drop);
    field.focus();
    var exists = false,
        prevContent = [];
    field.addEventListener("keyup", () => {
        if (exists && prevContent.length > 0) {
            searchType(drop.id, formatted[name.value]).name = field.value;
        } else {
            if (parent.name == "type") {
                addDrop(search(parent.id, formatted), drop.id, field.value);
            } else {
                addDrop(searchType(parent.id, formatted[name.value]), drop.id, field.value);
            }
            exists = true;
        }
        updateJSON();
    });
    string.addEventListener("click", () => {
        newString(drop, name, depth);
    });
    dropdown.addEventListener("click", () => {
        newDropdown(drop, name, depth);
    });
    progression.addEventListener("click", () => {
        newProgression(drop, name, depth);
    });
    remove.addEventListener("click", () => {
        if (parent.name == "type") {
            let content = search(parent.id, formatted).content
            content.splice(content.indexOf(searchType(drop.id, formatted[name.value])), 1);
        } else {
            let content = searchType(parent.id, formatted[name.value]).content
            content.splice(content.indexOf(searchType(drop.id, formatted[name.value])), 1);
        }
        drop.remove();
        updateJSON();
    })
}

function newProgression(parent, name, depth) {
    depth++;
    let remove = document.createElement("div");
    remove.className = "create";
    remove.innerHTML = "x";
    let string = document.createElement("div");
    string.className = "create";
    string.innerHTML = "add text";
    let dropdown = document.createElement("div");
    dropdown.className = "create";
    dropdown.innerHTML = "add dropdown";
    let progression = document.createElement("div");
    progression.className = "template";
    progression.id = id++;
    progression.style.background = backgroundColor(depth);
    progression.appendChild(remove);
    progression.appendChild(string);
    progression.appendChild(dropdown);
    parent.appendChild(progression);
    if (parent.name == "type") {
        let tree = search(parent.id, formatted)
        addProgression(tree, progression.id);
    } else {
        let tree = searchType(parent.id, formatted[name.value])
        addProgression(tree, progression.id);
    }
    updateJSON();
    string.addEventListener("click", () => {
        newString(progression, name, depth);
    });
    dropdown.addEventListener("click", () => {
        newDropdown(progression, name, depth);
    });
    remove.addEventListener("click", () => {
        if (parent.name == "type") {
            let content = search(parent.id, formatted).content
            content.splice(content.indexOf(searchType(progression.id, formatted[name.value])), 1);
        } else {
            let content = searchType(parent.id, formatted[name.value]).content
            content.splice(content.indexOf(searchType(progression.id, formatted[name.value])), 1);
        }
        progression.remove();
        updateJSON();
    })
} */

function updateJSON() {
    document.getElementById("json").innerHTML = JSON.stringify(formatted, undefined, 4);
}

document.getElementById("json").addEventListener("click", () => {
    var range = document.createRange();
    range.selectNode(document.getElementById("json"));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
});

/* input.addEventListener("click", () => {
    input.value = "";
});

function next() {
    update("\n");
    for (i=0;i<level;i++) {
        update("\t");
    }
}

function open() {
    next();
    update("{");
    level++;
    next();
}

function combine() {
    if ((inVariable != 0 || inProgression != 0) && !isFirst) {
        update(",");
    }
    isFirst = false;
}

function template() {
    update("\n\"" + input.value + "\" : {");
    isFirst = true;
    level = 1;
}

function newType() {
    updating = true;
    update("\n\t\"" + input.value + "\" : {");
    level = 2;
    next();
    update("\"type\": \"progression\",");
    next();
    updating = false;
    update( "\"content\": [");
    isFirst = true;
    inProgression++;
    level++;
}

function progression() {
    updating = true;
    combine();
    open();
    update("\"type\": \"progression\",");
    next();
    updating = false;
    update( "\"content\": [");
    isFirst = true;
    inProgression++;
    level++;
}

function string() {
    updating = true;
    combine();
    open();
    update("\"type\": \"string\",");
    next();
    update( "\"content\": \"" + input.value + "\"");
    level--;
    next();
    updating = false;
    update("}");
}

function variable() {
    updating = true;
    combine();
    open();
    update("\"type\": \"variable\",");
    next();
    update( "\"name\": \"" + input.value + "\",");
    next();
    updating = false;
    update( "\"options\": [");
    isFirst = true;
    inVariable++;
    level++;
}

function _null() {
    updating = true;
    combine();
    next();
    updating = false;
    update("null");
}

function closeVarPro() {
    if (level == 1) {
        update("\n}");
        level = 0;
    } else if (level != 0) {
        level--;
        updating = true;
        next();
        updating = false;
        update("]");
        level--;
        updating = true;
        next();
        updating = false;
        update("}");
    }
}

function update(data) {
    if (updating)
        updateString += data;
    else {
        updateString += data;
        output.innerHTML += updateString;
        edits.unshift(updateString);
        console.log(edits)
        undone = [];
        updateString = "";
    }
}

function undo() {
    if (edits.length > 0) {
        let last = edits.shift();
        output.innerHTML = output.innerHTML.substring(0, output.innerHTML.length - last.length);
        console.log(edits)
        undone.unshift(last);
        console.log(undone)
    }
}

function redo() {
    if (undone.length > 0) {
        let reinstated = undone.shift()
        output.innerHTML += reinstated;
        edits.unshift(reinstated);
        console.log(edits)
    }
} */