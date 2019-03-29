let input = document.getElementsByTagName("textarea")[0],
    output = document.getElementById("out");

var dropMenu = [{ name: "Create Dropdown", fn: add },
{ name: "Delete", fn: remove }],
    divDropMenu = [{ name: "Create Dropdown", fn: divAdd },
    { name: "Delete", fn: remove }],
    optionMenu = [{ name: "Add Option", fn: option },
    { name: "Delete", fn: remove }];

let addDropMenu = new ContextMenu('.span', dropMenu, {
    className: "context-menu"
}),
    addDivDropMenu = new ContextMenu('.content', divDropMenu, {
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
    .interpolate(d3.interpolateHcl),
    divBackgroundColor = d3.scaleLinear()
        .domain([0, 15])
        .range(["rgb(220, 190, 190)", "rgb(24, 0, 0)"])
        .interpolate(d3.interpolateHcl);

document.getElementById("json").addEventListener("click", () => {
    var range = document.createRange();
    range.selectNode(document.getElementById("json"));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
});

document.getElementById("import").addEventListener("change", read, false);

function read(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = (e) => {
        var content = e.target.result;
        generateTree(JSON.parse(content));
    };
    reader.readAsText(file);
}

function generateTree(content) {
    newTemplate(content.name);
    formatted.name = content.name;
    Object.keys(content).forEach(childName => {
        if (childName != "name") {
            newType(childName);
            generateType(childName, content[childName], document.getElementById(childName))
        }
    });
}

function generateType(name, type, parent) {
    let content = parent.children[2];
    content.removeChild(content.children[0]);
    type.content.forEach(child => {
        if (child.type == "text") {
            let text = document.createElement("div");
            text.className = "span";
            text.contentEditable = true;
            text.innerHTML = child.content;
            text.addEventListener("keyup", () => {
                updateContent(parent.id)
            });
            content.appendChild(text);
        } else {
            generateDrop(child, content);
        }
    });
    updateContent(name);
}

function generateDrop(tree, parent) {
    let drop = document.createElement("div")
    drop.contentEditable = false;
    drop.className = "drop";
    parent.appendChild(drop);
    drop.style.background = backgroundColor(determineDepth(drop));
    tree.content.forEach(opt => {
        if (opt.type == "text") {
            option(drop, opt.content);
        } else {
            let container = document.createElement("div");
            container.className = "content";
            drop.appendChild(container);
            generateProgression(opt, container);
            container.style.backgroundColor = divBackgroundColor(determineDepth(container));
        }
    })
}

function generateProgression(tree, parent) {
    tree.content.forEach(element => {
        if (element.type == "text") {
            let text = document.createElement("div");
            text.className = "span";
            text.contentEditable = true;
            text.innerHTML = element.content;
            text.addEventListener("keyup", () => {
                updateContent(parent.closest(".template").id)
            });
            parent.appendChild(text);
        } else {
            generateDrop(element, parent);
        }
    });
}

function cleanUpSpanText(span) {
    var clean = span.innerHTML;
    if (span.children.length > 0) {
        var newText = "";
        Array.from(span.children).forEach(div => {
            newText += div.innerHTML == "<br>" ? "" : div.innerHTML.replace("<br>", "");
            newText += "\n";
        });
        clean = newText.substring(0, newText.length - 1);
    }
    return clean;
}

function searchOpt(div) {
    let opt = {
        type: "progression",
        content: []
    };
    if (div.children.length == 1 && div.children[0].className == "span") {
        var c = "";
        if (div.children[0].innerHTML != "" && div.children[0].innerHTML != "<br>")
            c = cleanUpSpanText(div.children[0]);
        let text = {
            type: "text",
            content: c
        };
        return text;
    }
    Array.from(div.children).forEach(child => {
        if (child.className == "span" && child.innerHTML != "" && child.innerHTML != "<br>") {
            let text = {
                type: "text",
                content: cleanUpSpanText(child)
            };
            opt.content.push(text);
        } else if (child.className == "drop") {
            opt.content.push(searchDropdown(child));
        }
    });
    return opt;
}

function searchDropdown(content) {
    let obj = {
        type: "dropdown",
        content: []
    }
    Array.from(content.children).forEach(div => {
        obj.content.push(searchOpt(div))
    });
    return obj;
}

function updateContent(typeName) {
    let root = document.getElementById(typeName).getElementsByClassName("content")[0];
    var JSONContent = [];
    Array.from(root.children).forEach(child => {
        if (child.className == "span" && child.innerHTML != "" && child.innerHTML != "<br>") {
            let text = {
                type: "text",
                content: cleanUpSpanText(child)
            };
            JSONContent.push(text);
        } else if (child.className == "drop") {
            JSONContent.push(searchDropdown(child));
        }
    });
    if (formatted[typeName])
        formatted[typeName].content = JSONContent;
    updateJSON();
}

function remove(element) {
    let parent = element.parentElement
    if (parent.parentElement.className == "template" && parent.className != "template") {
        parent.removeChild(element);
        updateContent(parent.closest(".template").id);
    } else if (parent.className != "template") {
        parent.parentElement.removeChild(parent);
        updateContent(parent.parentElement.closest(".template").id);
    }
}

function add(span) {
    let parentDiv = span.parentElement;
    let selected = document.getSelection().getRangeAt(0);
    let info = selected.toString();
    selected.insertNode(document.createTextNode("\u0001"));
    selected.collapse(false);
    selected.insertNode(document.createTextNode("\u0001"));
    var prevContent = span.innerHTML.split("\u0001");

    parentDiv.removeChild(span);
    let firstSpan = document.createElement("div");
    firstSpan.className = "span";
    firstSpan.contentEditable = true;
    firstSpan.innerHTML = prevContent[0];
    firstSpan.addEventListener("keyup", () => {
        updateContent(parentDiv.closest(".template").id)
    });
    parentDiv.appendChild(firstSpan);
    let drop = document.createElement("div")
    drop.contentEditable = false;
    drop.className = "drop";
    parentDiv.appendChild(drop)
    drop.style.background = backgroundColor(determineDepth(drop));
    option(drop, info);
    let secondSpan = document.createElement("div");
    secondSpan.className = "span";
    secondSpan.contentEditable = true;
    secondSpan.innerHTML = prevContent[2];
    secondSpan.addEventListener("keyup", () => {
        updateContent(parentDiv.closest(".template").id)
    });
    parentDiv.appendChild(secondSpan);

    updateContent(parentDiv.closest(".template").id);
}

function divAdd(div) {
    let drop = document.createElement("div")
    drop.contentEditable = false;
    drop.className = "drop";
    div.appendChild(drop)
    drop.style.background = backgroundColor(determineDepth(drop));
    option(drop, "");
    let afterSpan = document.createElement("div");
    afterSpan.className = "span";
    afterSpan.contentEditable = true;
    afterSpan.addEventListener("keyup", () => {
        updateContent(div.closest(".template").id)
    });
    div.appendChild(afterSpan)
    updateContent(div.closest(".template").id)
}

function determineDepth(element) {
    let current = element,
        depth = 0;
    while (current.className != "template") {
        current = current.parentElement;
        depth++;
    }
    return depth;
}

function option(div, info) {
    let optionContainer = document.createElement("div");
    optionContainer.className = "content";
    let option = document.createElement("div");
    option.className = "span";
    option.contentEditable = true;
    option.innerHTML = info ? info : "";
    option.addEventListener("keyup", () => {
        updateContent(div.closest(".template").id)
    });
    optionContainer.appendChild(option);
    div.appendChild(optionContainer);
    optionContainer.style.backgroundColor = divBackgroundColor(determineDepth(optionContainer));
}

function newTemplate(text) {
    document.getElementById("template").style.visibility = "hidden";
    let existingTemplate = document.getElementById("mainTemplate")
    if (existingTemplate != null)
        existingTemplate.remove();
    let remove = document.createElement("div");
    remove.className = "create";
    remove.innerHTML = "x";
    let addType = document.createElement("div");
    addType.className = "create";
    addType.innerHTML = "add type";
    addType.addEventListener("click", () => {
        newType();
    });
    let field = document.createElement("div");
    field.contentEditable = true;
    field.className = "field";
    field.innerHTML = text != null ? text : "template name (e.g. WBC)";
    let template = document.createElement("div");
    template.className = "template";
    template.id = "mainTemplate";
    template.style.background = backgroundColor(0);
    template.appendChild(remove);
    template.appendChild(addType);
    template.appendChild(field);
    output.appendChild(template);
    field.focus();
    if (text != null) {
        formatted.name = text;
        updateJSON();
    }
    field.addEventListener("keyup", (key) => {
        formatted.name = cleanUpSpanText(field);
        updateJSON();
    });
    field.onclick = () => {
        if (field.innerHTML == "template name (e.g. WBC)") {
            field.innerHTML = "";
        }
    }
    remove.addEventListener("click", () => {
        formatted = {};
        template.remove();
        document.getElementById("template").style.visibility = "visible";
        updateJSON();
    });
}

function newType(text) {
    let remove = document.createElement("div");
    remove.className = "create";
    remove.innerHTML = "x";
    let field = document.createElement("div");
    field.contentEditable = true;
    field.className = "field";
    field.innerHTML = text != null ? text : "type (i.e. English)";
    let container = document.createElement("div");
    container.className = "content";
    container.tabIndex = 0;
    container.style.background = divBackgroundColor(1);
    let content = document.createElement("div");
    content.className = "span"
    content.tabIndex = 0;
    content.contentEditable = true;
    content.innerHTML = "Enter content here.";
    content.onclick = () => {
        if (content.innerHTML == "Enter content here.")
            content.innerHTML = "";
    };
    let type = document.createElement("div");
    type.className = "template";
    type.id = field.innerHTML;
    type.name = "type";
    type.style.background = divBackgroundColor(0);
    container.appendChild(content)
    type.appendChild(remove);
    type.appendChild(field);
    type.appendChild(container);
    document.getElementById("mainTemplate").appendChild(type);
    field.focus();
    var prev,
        prevContent = [],
        name;
    field.onclick = () => {
        if (field.innerHTML == "type (i.e. English)") {
            field.innerHTML = "";
        }
    }
    field.addEventListener("keyup", () => {
        name = cleanUpSpanText(field);
        type.id = name;
        if (prev != null) {
            if (prevContent.length > 0) {
                prevContent = formatted[prev].content;
            }
            delete formatted[prev];
        }
        formatted[name] = {
            content: prevContent
        };
        prev = name;
        updateContent(type.id);
    });
    content.addEventListener("keyup", () => {
        updateContent(type.id);
    })
    remove.addEventListener("click", () => {
        name = cleanUpSpanText(field);
        console.log(name, formatted[name])
        delete formatted[name];
        updateJSON();
        type.remove();
    })
    if (text != null) {
        formatted[text] = {
            content: []
        };
    }
}

function updateJSON() {
    document.getElementById("json").innerHTML = JSON.stringify(formatted, undefined, 4);
}

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