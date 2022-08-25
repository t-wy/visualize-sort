var randomSeed = null;
var random = null;
function randomReset() {
    if (randomSeed !== null) {
        // glibc-like RNG
        var internal = Array(31).fill();
        internal[0] = randomSeed;
        for (var i = 1; i < 31; ++i) {
            internal[i] = (internal[i - 1] * 16807) % 2147483647;
        }
        random = function () {
            internal[3] = (internal[3] + internal[0]) & 0xffffffff;
            internal.push(internal.shift());
            return (internal[2] >>> 0) / 0x100000000;
        }
        for (var i = 0; i < 31 * 10; ++i) {
            random();
        }
    } else {
        random = function () {
            return Math.random();
        }
    }
}
function changeSeed(setting) {
    if (setting) {
        var k = parseInt(prompt(`Enter the random seed (1 to 10000): \n(Shuffle / Sort Result will be fixed with the same seed)` + (algoLoad ? `\n(Changing the seed terminates the currently running sort!)`: ""), randomSeed===null?1:randomSeed));
        if (Number.isNaN(k) || k < 1 || k > 10000) {
            alert("Invalid seed!");
            return;
        } else {
            randomSeed = k;
            settingSeed.innerText = k;
            algoLoad = false;
            highlightCode(0, -1); // remove highlight
        }
    } else {
        if (!algoLoad || confirm("Unsetting the seed terminates the currently running sort!\nContinue?")) {
            randomSeed = null;
            settingSeed.innerText = "N/A";
            algoLoad = false;
            highlightCode(0, -1); // remove highlight
        }
    }
}