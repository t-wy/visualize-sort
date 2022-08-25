
function getSelector(element) { // a way to get selector path of fixed-location elements
    var path = [];
    var parent;
    while (parent = element.parentNode) {
        var children = Array.from(parent.children);
        var index = children.indexOf(element);
        var onlyOne = children.filter(c => c.tagName === element.tagName).length === 1;
        path.unshift(element.tagName + (onlyOne?"":`:nth-child(${index + 1})`));
        element = parent;
    }
    return path.join(" > ").toLowerCase();
}

function titleCase(text) {
    return text[0].toUpperCase() + text.substring(1);
}