function changePlayMode(newPlayMode) {
    playMode = newPlayMode;
    continueAlgo(true);
}
function changeColorMode(newColorMode) {
    colorMode = newColorMode;
    if (arraySize < 2500) {
        array.forEach((value, index) => {
            bars[index].style.backgroundColor = makeColor(index);
        });
    } else {
        for (var temp = 0; temp < 2500; ++temp) {
            var index = Math.floor(arraySize * temp / 2500);
            var value = array[index];
            bars[temp].style.backgroundColor = makeColor(index);
        }
    }
}
function setMute(state) {
    mute = state;
}
var mute = false;
var playMode = "Medium";
var colorMode = "Rainbow";
var waveType = "triangle";
var arraySize = 100;
var array = []; // reserved name: a
var marker = [];
var bars = [];
var arraychart = document.getElementById("arraychart");
var audioContext = {"resume": ()=>{}};
var makeSound = function() {
    var audiosupported = (typeof(this.AudioContext) === "function");
    if (audiosupported) {
        audioContext = new AudioContext();
        var compressor = audioContext.createDynamicsCompressor(); // adjust volume and prevent iPad getting too loud
        compressor.connect(audioContext.destination);
        var oscillators = [];
        var beep = function(frequency) {
            // if (audioContext.state !== "running") { // to prevent Safari stop after prompt
            audioContext.resume();
            // audioContext.state is still running even when it is not producing any sound
            // }			
            var oscillator = audioContext.createOscillator();
            var gainNode = audioContext.createGain(); // single note use
            oscillator.frequency.value = frequency;
            oscillator.type = waveType;
            oscillator.value = 0.1;
            var duration = 0.1; //((playMode == "Ultra" || playMode == "Fast" || playMode == "Medium") ? 0.01 : 0.1);
            var period = 1 / frequency;
            duration = Math.ceil(duration / period) * period; // prevent clicking
            var ct = audioContext.currentTime;
            oscillator.start(ct);
            oscillator.stop(ct + duration); // duration = 0.1s
            // ADSR: also to remove click
            gainNode.gain.setValueAtTime(0, ct + 0);
            gainNode.gain.linearRampToValueAtTime(1, ct + duration / 40);
            gainNode.gain.linearRampToValueAtTime(0.9, ct + duration / 8);
            gainNode.gain.setValueAtTime(0.9, ct + duration * 0.7);
            gainNode.gain.linearRampToValueAtTime(0, ct + duration);
            // Conenct to output
            // oscillator.connect(audioContext.destination);
            oscillator.connect(gainNode);
            gainNode.connect(compressor);
            oscillators.push(oscillator);
            if (oscillators.length > 100) { // at most 100 oscillators running
                oscillators.shift().stop();
            }
        };
        return function(value) {
            // beep(400 * Math.pow(3.3, (value / arraySize) * 2 - 1)) // 1/3.3 to 3.3 times;
            if (mute) return;
            beep(120 + 1200 * Math.pow(value / arraySize, 2)) // simulating sound of sorting
        };
    } else {
        return function(value) {}; // dummy function
    }
}();
function makeColor(index) {
    if (colorMode === "Rainbow"){
        return `hsl(${360 * array[index] / arraySize}, 100%, 50%)`;
    } else if (marker[index] !== null) {
        return marker[index]
    } else {
        return "white";
    }
};
function resize() {
    var k = parseInt(prompt(`Enter the new array size (2 to 2500): \n(Changing the array size will terminate the currently running sort!)`, arraySize.toString()));
    if (Number.isNaN(k) || k < 2 || k > 2500) {
        alert("Invalid size!");
        return;
    }
    arraySize = k;
    settingArraySize.innerText = k;
    shuffle("random");
}
function changeIndent() {
    var k = parseInt(prompt(`Enter the new indentation (1 to 8):\n`, indent_spaces.toString()));
    if (Number.isNaN(k) || k < 1 || k > 8) {
        alert("Invalid indentation!");
        return;
    }
    indent_spaces = k;
    settingIndent.innerText = k;
    runalgo(currentAlgo, true); // change source code
    continueAlgo();
}
function changeProgrammingLanguage(newProgrammingLangugae) {
    prolang = newProgrammingLangugae;
    runalgo(currentAlgo, true); // change source code
    continueAlgo();
}
function shuffle(mode) {
    algoLoad = false;
    highlightCode(0, -1); // remove highlight
    var arraytemp = Array(arraySize).fill(); // initialize with undefined
    randomReset();
    switch (mode) {
        case "random":
            // from 1 to N
            arraytemp = arraytemp.map((_,b) => b + 1);
            // Fisher–Yates Shuffle
            for (var i = arraySize - 1; i > 0; --i) {
                var index = Math.floor(random() * (i + 1));
                var temp = arraytemp[index];
                arraytemp[index] = arraytemp[i];
                arraytemp[i] = temp;
            }
            break;
        case "dupes":
            // allow repeated elements within [1, N]
            arraytemp = arraytemp.map(() => Math.floor(random() * arraySize + 1));
            break;
        case "reversed":
            // from N to 1
            arraytemp = arraytemp.map((_,b) => arraySize - b);
            break;
        case "k-sorted":
            // from 1 to N
            arraytemp = arraytemp.map((_,b) => b + 1);
            var k = parseInt(prompt(`Enter the value of k (0 to ${arraySize - 1}): \n(Each element is at most k places away from the sorted position)`, "10"));
            if (Number.isNaN(k) || k < 0 || k >= arraySize) {
                alert("Invalid value of k!");
                return;
            }
            // shuffle such that index i goes within [i - k, i + k]
            // not even though
            // use min heap
            var heap = Array(k + 1).fill(null);
            var heapSize = 0;
            var heapPop = function(index) {
                var result = heap[index];
                heap[index] = heap[--heapSize];
                var i = index;
                while (true) {
                    var left = (i << 1) + 1;
                    var right = (i << 1) + 2;
                    var smaller = left;
                    if (left >= heapSize) { // hit bottom
                        break;
                    } else if (right < heapSize && heap[right] <= heap[left]) {
                        smaller = right;
                    }
                    if (heap[i] < heap[smaller]) { // satisfy min heap
                        break;
                    }
                    var temp = heap[smaller];
                    heap[smaller] = heap[i];
                    heap[i] = temp;
                    i = smaller;
                }
                return result;
            }
            for (var i = 0; i < k; ++i) {
                // push k values to heap
                heap[heapSize++] = arraytemp[i]; // it must be the max
            }
            for (var i = 0; i < arraySize; ++i) {
                // push k values to heap
                if (i + k < arraySize) {
                    heap[heapSize++] = arraytemp[i + k]; // it must be the max
                }
                if (heap[0] === i + 1 - k) {
                    arraytemp[i] = heapPop(0);
                } else {
                    arraytemp[i] = heapPop(Math.floor(random() * heapSize));
                }
            }
            break;
        case "ordered":
        default:
            // from 1 to N
            arraytemp = arraytemp.map((_,b) => b + 1);
    }
    array = arraytemp; // replace if success
    marker = Array(arraySize).fill(null);
    refresh();
}
function refresh() {
    clear(arraychart); // remove all bars
    bars = []
    if (arraySize < 2500) {
        array.forEach((value, index) => {
            var element = document.createElement("div");
            element.className = "bar";
            element.style.height = `${100 * value / arraySize}%`;
            element.style.backgroundColor = makeColor(index);
            arraychart.appendChild(element);
            bars.push(element);
        });
    } else {
        for (var temp = 0; temp < 2500; ++temp) {
            var index = Math.floor(arraySize * temp / 2500);
            var value = array[index];
            var element = document.createElement("div");
            element.className = "bar";
            element.style.height = `${100 * value / arraySize}%`;
            element.style.backgroundColor = makeColor(index);
            arraychart.appendChild(element);
            bars.push(element);
        }
    }
}
function refreshsingle(index) {
    if (arraySize < 2500) {
        bars[index].style.backgroundColor = makeColor(index);
    } else {
        var group = Math.floor(2500 * index / arraySize);
        if (index === Math.floor(arraySize * group / 2500) ||
            index === Math.floor(arraySize * (group + 1) / 2500)) {
            bars[group].style.backgroundColor = makeColor(index);
        }
    }
}
function resizesingle(index, value) {
    if (arraySize < 2500) {
        bars[index].style.height = `${100 * value / arraySize}%`;
        refreshsingle(index);
    } else {
        var group = Math.floor(2500 * index / arraySize);
        if (index === Math.floor(arraySize * group / 2500) ||
            index === Math.floor(arraySize * (group + 1) / 2500)) {
            bars[group].style.height = `${100 * value / arraySize}%`;
            refreshsingle(index);
        }
    }
}

// copy all mouse event to touchscreen event
// Array.from(document.querySelectorAll("[onmousedown]")).forEach(ele => ele.ontouchstart = ele.onmousedown);
// https://chromestatus.com/feature/4764225348042752 : listener but not ontouchstart
Array.from(document.querySelectorAll("[onmousedown]")).forEach(ele => ele.addEventListener("touchstart", ele.onmousedown, listeneroption));
var nobodyscroll = function(e) {
    e.stopImmediatePropagation(); // no body scroll please
}
description.addEventListener('scroll', nobodyscroll, { passive: false });
sourcecodediv.addEventListener('scroll', nobodyscroll, { passive: false });
// use Array.from to ensure early browser support (NodeList.forEach: Chrome 51+, Array.from: Chrome 45)

// horizontal scroll support
var customAttributeSupported = function() {
    var temp = document.createElement("a");
    temp.style.setProperty("--offset", "0");
    return temp.style.getPropertyValue("--offset") === "0";
}();
var setOffset = function() {
    if (customAttributeSupported) {
        return function(element, offset) {
            element.style.setProperty("--offset", offset);
        }
    } else {
        return function(element, offset) {
            element.style.setProperty("left", offset + "px");
            element.newStyle.innerHTML = `${element.selector}::before {\nleft:${-offset}px;\n}}`;
        }
    }
}();

Array.from(document.getElementsByClassName("hscroll")).forEach(hscroll => {
    if (!customAttributeSupported) {
        var newStyle = document.createElement("style");
        newStyle.innerHTML = "";
        document.head.appendChild(newStyle);
        hscroll.newStyle = newStyle;
        hscroll.selector = getSelector(hscroll);
    }
    var scroll = 0;
    var touches = {};
    setOffset(hscroll, 0);
    var fix = function() {
        setOffset(hscroll, 0); // hack by not reseting scrollWidth by pseudoElement
        if (scroll < 0) scroll = 0;
        if (scroll > hscroll.scrollWidth - hscroll.clientWidth) scroll = hscroll.scrollWidth - hscroll.clientWidth;
        setOffset(hscroll, -scroll);
    }
    hscroll.addEventListener("wheel", (evt) => {
        // evt.preventDefault();
        scroll += evt.deltaY;
        fix();
    }, listeneroption);
    hscroll.addEventListener("touchstart", (evt) => {
        Array.from(evt.changedTouches).forEach(t => touches[t.identifier] = t.pageX);
    }, listeneroption);
    hscroll.addEventListener("touchmove", (evt) => {
        Array.from(evt.changedTouches).forEach(t => {
            scroll -= t.pageX - touches[t.identifier];
            touches[t.identifier] = t.pageX;
        });
        fix();
    }, listeneroption);
    hscroll.addEventListener("touchend", (evt) => {
        Array.from(evt.changedTouches).forEach(t => delete touches[t.identifier]);
    }, listeneroption);
    hscroll.addEventListener("touchcancel", (evt) => {
        Array.from(evt.changedTouches).forEach(t => delete touches[t.identifier]);
    }, listeneroption);
    new ResizeObserver(fix).observe(document.body);
});
shuffle("random");

// try register service-worker
if (location.origin !== 'file://' && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").then(function (reg) {
        console.log("Service Worker Registration Succeed, Scope: " + reg.scope);
    }).catch(function (error) {
        console.log("Service Worker Registration Failed: " + error);
    })
}