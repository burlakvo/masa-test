/*let UI_ENGINE = {
    colors: ["red", "rebeccapurple", "green"],
    getColors: function (color) {
        if (this.colors.indexOf(color) >= 0) {
           return color;
        }

        return this.colors;
    }
}*/

let addBtn = document.getElementById("addBtn");
let genBtn = document.getElementById("genBtn");
let gooBtn = document.getElementById("gooBtn");

let inputHEX = document.getElementById("inputHEX");
let inputName = document.getElementById("inputName");

let list = document.getElementById("list");

addBtn.disabled = true;
gooBtn.disabled = true;

addBtn.addEventListener("click", addColor);
genBtn.addEventListener("click", genColor);
gooBtn.addEventListener("click", gooColor);

inputHEX.addEventListener("keyup", inputChange);
inputName.addEventListener("keyup", inputChange);

function inputChange () {
    if (/^(#)[0-9a-f]{6}$/i.test(inputHEX.value) && inputName.value.length > 0) {
        addBtn.disabled = false;
        gooBtn.disabled = false;
    }
    else if (/^(#)[0-9a-f]{6}$/i.test(inputHEX.value)) {
        gooBtn.disabled = false;
    }
    else {
        addBtn.disabled = true;
        gooBtn.disabled = true;
    }
}

function addColor () {
    let hex = inputHEX.value;
    inputHEX.value = "";

    let name = inputName.value;
    inputName.value = "";

    inputChange();

    updateList(hex, name);
}

function genColor () {
    const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    let color = "#";

    for (let i = 0; i < 6; i++) {
        color += numbers[Math.floor(Math.random() * numbers.length)];
    }

    inputHEX.value = color;

    inputChange();
}

function gooColor () {
    let color = inputHEX.value.replace("#", "%23"); // %23 is #
    let link = "https://www.google.com/search?q=" + color;

    window.open(link, "_blank");
}

function updateList(hex, name) {
    let li = document.createElement("li");
    li.style.color = hex;
    li.innerText = hex + ": " + name;
    list.appendChild(li);
}