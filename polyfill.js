if (!String.prototype.trimStart && String.prototype.trimLeft) {
    String.prototype.trimStart = String.prototype.trimLeft;
}

if (!String.prototype.replaceAll && String.prototype.replace) {
    String.prototype.replaceAll = function(searchValue, replaceValue) { // not polyfilling regex as not used
        var start = 0;
        var result = "";
        var pos = null;
        while ((pos = this.indexOf(searchValue, start)) !== -1) {
            result += this.substring(start, pos) + replaceValue;
            start = pos + searchValue.length;
        }
        return result + this.substring(start);
    }
}

if (!Array.prototype.includes && String.prototype.indexOf && String.prototype.slice) {
    Array.prototype.includes = function(searchElement, fromIndex) {
        if (fromIndex === undefined) fromIndex = 0;
        return !!~this.indexOf(searchElement, fromIndex);
    }
}

if (typeof(ResizeObserver) === "undefined") {
    ResizeObserver = function(callback) {
        var getBox = function(object) {
            var g = function(key) {
                var temp;
                if (Number.isNaN(temp = parseFloat(styles.getPropertyValue(key)))) return 0;
                return temp;
            }
            var styles = window.getComputedStyle(object);
            var width = g('width');
            var height = g('height');
            var left = g('left');
            var top = g('top');
            return { "x": left, "y": top, "width": width, "height": height };
        }
        this.observe = function(object) {
            var currentSize = getBox(object);
            setInterval(function() {
                var tempSize = getBox(object);
                if (currentSize.width !== tempSize.width || currentSize.height !== tempSize.height) {
                    callback(); // not care about values as it is not used
                }
                currentSize = tempSize;
            }, 0);
        }
    }
}

var listeneroption = false;

(function(){
    try {
        var options = {
            get passive() {
                listeneroption = {passive: true};
                return false;
            }
        };
        window.addEventListener("test", null, options);
        window.removeEventListener("test", null, options);
    } catch (err) {
        listeneroption = false;
    }
})();