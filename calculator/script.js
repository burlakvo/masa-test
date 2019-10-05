class Buttons {
    addBtn (lbl, title, priority, action, operators) {
        if (!blueHeadMan.handbook[lbl]) {
            let position = blueHeadMan.buttons.length;
            blueHeadMan.buttons [position]= {
                "lbl": lbl,
                "title": title,
                "priority": priority, // 0 is bigger
                "action": action // { number | bracket | math expression | s - sum (calculate) | c - clear whole line | d - delete last character in line }
            }
            if (operators) blueHeadMan.buttons [position]["operators"] = operators; // operators { lr - left require | lo - left only | rr - right require | ro - right only | br - both require }
            if (!/^(s|c|d)$/.test(action)) blueHeadMan.handbook[lbl] = position;
            blueHeadMan.minPriority = (blueHeadMan.minPriority > priority) ? blueHeadMan.minPriority : priority;
        }
        else {
            console.log("already exist");
        }
    }
}

class Megamind { // think about everything
    constructor () {
        this.buttons = []; // full list of buttons with their attributes
        this.handbook = {}; // label and priority
        this.minPriority = 0; // bigger is lower o_0
    }

    btnClick (btn) {
        let action = this.buttons[btn].action;
        if (action == "s") {
            let expression = showRoom.expression.innerText;
            let result = this.calculate(expression);
            showRoom.putToLine(result);
        }
        else if (action == "c") {
            showRoom.delFromLine("all");
        }
        else if (action == "d") {
            showRoom.delFromLine(1);
        }
        else {
            showRoom.addToLine(this.buttons[btn].lbl);
        }
    }

    calculate (expression) {
        if (/^[0-9.]+$/.test(expression)) { // if only numbers and plus(es)
            return expression;
        }
        else if (/\(+.*\)+/.test(expression)) { // if expression has brackets
            // from last open bracket to first close bracket after last open bracket o_0
            let line = expression.match(/^(.*)\(([^()]+)\)(.*)$/);
            // count expression inside last closed brackets
            line[2] = this.calculate(line[2]);
            // start again
            return this.calculate(line[1] + line [2] + line[3]);
        }
        else { // find operator with the biggest priority from left to right
            let p = 0; // highest priority
            while (p <= this.minPriority) {
                let wanted = []; // array of operators with current priority
                for (let label in this.handbook) { // get all operators with current priority
                    if (this.buttons[this.handbook[label]]["priority"] == p) wanted.push(label);
                }
                if (wanted.length != 0) { // if at least one operator with current priority
                    let i = -1; // position of closest operator
                    wanted.forEach(value => { // find first operator from left to right
                        if (expression.indexOf(value) != -1) {
                            i = (expression.indexOf(value) < i || i == -1) ? expression.indexOf(value) : i;
                        }
                    });
                    if (i != -1) { // have find operator
                        let action = this.buttons[this.handbook[expression[i]]]["action"];
                        if (!/^([0-9.]|\(|\))$/.test(action)) {
                            let ecr = (/(\+|\*|\/|\(|\)|\^|\$|\.|\{|\}|\[|\]|\|)/.test(expression[i])) ? "\\" : "";
                            let regx = new RegExp("^([^"+ecr+expression[i]+"]*)"+ecr+expression[i]+"(.*)$");
                            let line = expression.match(regx);

                            let l, r, newExpression;

                            let operators = this.buttons[this.handbook[expression[i]]]["operators"];
                            switch (operators) {
                                case "lo": // left only
                                    l = this.calculatePart(line[1]);
                                    r = line[2];
                                    newExpression = l["expression"] + eval(action.replace("l", l["operand"])) + r;
                                    break;
                                case "lr": // left required
                                    l = this.calculatePart(line[1]);
                                    r = this.calculatePart(line[2], "r");
                                    r["operand"] = (r["operand"]) ? r["operand"] : 2;
                                    newExpression = l["expression"] + eval(action.replace("l", l["operand"]).replace("r", r["operand"])) + r["expression"];
                                    break;
                                case "ro": // right only
                                    l = line[1];
                                    r = this.calculatePart(line[2], "r");
                                    newExpression = l + eval(action.replace("r", r["operand"])) + r["expression"];
                                    break;
                                case "rr": // right required
                                    l = this.calculatePart(line[1]);
                                    r = this.calculatePart(line[2], "r");
                                    l["operand"] = (l["operand"]) ? l["operand"] : 2;
                                    newExpression = l["expression"] + eval(action.replace("l", l["operand"]).replace("r", r["operand"])) + r["expression"];
                                    break;
                                default: // b - both
                                    l = this.calculatePart(line[1]);
                                    r = this.calculatePart(line[2], "r");
                                    newExpression = l["expression"] + eval(action.replace("l", l["operand"]).replace("r", r["operand"])) + r["expression"];
                                    break;
                            }

                            return this.calculate(newExpression);
                        }
                    }
                }
                p++; // go to lower priority
            }
            return expression;
        }
    }

    calculatePart (expression, side = "l") { // side { l - left | r - right }
        let result = [];
        result["expression"] = "";
        if (/^\((.)+\)$/.test(expression)) { // if expression in brackets
            result["operand"] = this.calculate(expression.substring(1, expression.length - 1));
        }
        else if (/^[0-9.]+$/.test(expression)) { // if only operands
            result["operand"] = expression;
        }
        else {
            let ind = (side == "l") ? "lastI" : "i"; // for left part find operator from the end, for right - from the begin
            let wanted = []; // array of operators with current priority
            for (let label in this.handbook) { // get all operators with current priority
                if (this.buttons[this.handbook[label]]["operators"]) wanted.push(label);
            }
            wanted.push("(", ")");
            if (wanted.length != 0) { // if at least one operator with current priority
                let indexO = -1; // position for split expression
                let compare = (side == "l") ? ">" : "<";
                wanted.forEach(value => {
                    if (expression[ind + "ndexOf"](value) != -1) {
                        indexO = (eval(expression[ind + "ndexOf"](value) + compare + indexO) || indexO == -1) ? expression[ind + "ndexOf"](value) : indexO;
                    }
                });
                if (indexO != -1) { // have find operator
                    result["operand"] = (side == "l") ? expression.substring(indexO + 1, expression.length) : expression.substring(0, indexO); // операнд - вторая подстрока для левой стороны или первая - для левой
                    result["expression"] = (side == "l") ? expression.substring(0, indexO + 1) : expression.substring(indexO, expression.length); // выражение - первая подстрока для левой стороны или вторая - для левой
                    return result;
                }
            }
        }
        return result;
    }
}

class Renderman {
    init (id) {
        this.place = document.getElementById(id);

        let expression = document.createElement("div");
        expression.id = "expression";
        this.place.append(expression);
        this.expression = expression;

        let btnKeeper = document.createElement("div");
        btnKeeper.id = "btnKeeper";
        this.place.append(btnKeeper);

        blueHeadMan.buttons.forEach((btnVal, btnInd) => {
            let btn = document.createElement("button");
            btn.classList.add("btn");
            btn.innerText = btnVal.lbl;
            btn.setAttribute("title", btnVal.title);
            btn.addEventListener("click", () => blueHeadMan.btnClick(btnInd));
            btnKeeper.append(btn);
        });

        this.place.append(btnKeeper);
        this.keeper = btnKeeper;
    }

    addToLine (data) {
        this.expression.append(data);
    }

    delFromLine (numSymbols) {
        this.expression.innerText = (numSymbols == "all") ? "" : this.expression.innerText.substring(0, this.expression.innerText.length - numSymbols);
    }

    putToLine (data) {
        this.expression.innerText = data;
    }
}

const blueHeadMan = new Megamind();
const showRoom = new Renderman();
const btns = new Buttons();

classicCalculator();

function classicCalculator () {
    btns.addBtn("1", "one", 5, "1");
    btns.addBtn("2", "two", 5, "2");
    btns.addBtn("3", "three", 5, "3");
    btns.addBtn("+", "plus", 4, "l+r", "b");
    btns.addBtn("-", "minus", 4,  "l-r", "b");

    btns.addBtn("4", "four", 5, "4");
    btns.addBtn("5", "fife", 5, "5");
    btns.addBtn("6", "six", 5, "6");
    btns.addBtn("*", "multiply", 3, "l*r", "b");
    btns.addBtn("/", "divide", 3, "l/r", "b");

    btns.addBtn("7", "seven", 5, "7");
    btns.addBtn("8", "eight", 5, "8");
    btns.addBtn("9", "nine", 5, "9");
    btns.addBtn("^", "power", 2, "Math.pow(l, r)", "lr");
    btns.addBtn("v", "root", 2, "Math.pow(r, 1/l)", "rr");

    btns.addBtn("0", "zero", 5, "0");
    btns.addBtn(".", "dot", 5, ".");
    btns.addBtn("(", "left bracket",1, "(");
    btns.addBtn(")", "right bracket",1, ")");
    btns.addBtn("%", "to percent", 3, "l/100", "lo");

    btns.addBtn("=", "count", 0, "s");
    btns.addBtn("c", "clear", 0, "c");
    btns.addBtn("d", "delete", 0, "d");

    showRoom.init("calculator");

    // for test
    // showRoom.putToLine("18/3*(5-4+1)"); // 12
    // showRoom.putToLine("(v10+1)/(6.25-1.8^2)"); // 1.3828165
    // showRoom.putToLine("(v3+2*v2)/(v(v5))"); // 3.0497754
    // showRoom.putToLine("v(v5+v6)"); // 2.16461491
}

// now, number's, dot's and bracket's characters should be as it is ( "1" is "1", "5" is "5" etc.)