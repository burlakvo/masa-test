class Buttons {
    addBtn (lbl, title, priority, action, operators) {
        if (!blueHeadMan.labelBook[lbl]) {
            let position = blueHeadMan.buttons.length;
            blueHeadMan.buttons [position]= {
                "lbl": lbl,
                "title": title,
                "priority": priority, // 0 is bigger
                "action": action // { number | bracket | math expression | s - sum (calculate) | c - clear whole line | d - delete last character in line }
            }
            if (operators) blueHeadMan.buttons [position]["operators"] = operators; // operators { lr - left require | lo - left only | rr - right require | ro - right only | br - both require }
            if (!/^(s|c|d)$/.test(action)) {
                blueHeadMan.labelBook[lbl] = position;
                blueHeadMan.actionBook[action] = position;
            }
            if (/^([0-9.]|\(|\))$/.test(action)) blueHeadMan.operators[action] = lbl; // if it's label of bracket, number or dot
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
        this.labelBook = {}; // label and priority of operands
        this.actionBook = {}; // action and priority of operands
        this.operators = {}; // label of brackets and operators
        this.minPriority = 0; // bigger is lower o_0
    }

    init () {
        this.literalNumbers = "";
        for (let [operator, label] of Object.entries(this.operators)) {
            let literal = (this.shouldLiteral(label)) ? "\\" + label : label
            if (/^[0-9.]$/.test(operator)) this.literalNumbers += literal + "|";
            else if (operator == "(") this.literalLeftBracket = literal;
            else if (operator == ")") this.literalRightBracket = literal;
        }
        this.literalNumbers = this.literalNumbers.substring(0, this.literalNumbers.length - 1);
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
        const regxOnlyNumbers = new RegExp("^(" + this.literalNumbers + ")+$");
        const regxHasBrackets = new RegExp(this.literalLeftBracket + "+.*" + this.literalRightBracket + "+");
        if (regxOnlyNumbers.test(expression)) { // if only numbers
            return expression;
        }
        else if (regxHasBrackets.test(expression)) { // if expression has brackets
            const regxLastBrackets = new RegExp("^(.*)" + this.literalLeftBracket + "([^"+ this.operators["("] + this.operators[")"] + "]+)" + this.literalRightBracket + "(.*)$");
            let line = expression.match(regxLastBrackets); // from last open bracket to first close bracket after last open bracket o_0
            line[2] = this.calculate(line[2]); // count expression inside last closed brackets
            return this.calculate(line[1] + line [2] + line[3]); // start again
        }
        else { // find operator with the biggest priority from left to right
            let p = 0; // highest priority
            while (p <= this.minPriority) {
                let wanted = []; // array of operators with current priority
                for (let label in this.labelBook) { // get all operators with current priority
                    if (this.buttons[this.labelBook[label]]["priority"] == p) wanted.push(label);
                }
                if (wanted.length != 0) { // if at least one operator with current priority
                    let i = -1; // position of closest operator
                    wanted.forEach(value => { // find first operator from left to right
                        if (expression.indexOf(value) != -1) {
                            i = (expression.indexOf(value) < i || i == -1) ? expression.indexOf(value) : i;
                        }
                    });
                    if (i != -1) { // have find operator
                        let action = this.buttons[this.labelBook[expression[i]]]["action"];
                        const regxNumberssAndBrackets = new RegExp("^(" + this.literalNumbers + "|" + this.literalLeftBracket + "|" + this.literalRightBracket + ")$");
                        if (!regxNumberssAndBrackets.test(action)) {
                            let literal = (this.shouldLiteral(expression[i])) ? "\\" : "";
                            let regx = new RegExp("^([^" + literal + expression[i] + "]*)" + literal + expression[i] + "(.*)$");
                            let line = expression.match(regx);

                            let l, r, newExpression;

                            let operators = this.buttons[this.labelBook[expression[i]]]["operators"];
                            switch (operators) {
                                case "lo": // left only
                                    l = this.calculatePart(line[1]);
                                    r = line[2];
                                    newExpression = l["expression"] + this.doEval(action, l["operand"], "") + r;
                                    break;
                                case "lr": // left required
                                    l = this.calculatePart(line[1]);
                                    r = this.calculatePart(line[2], "r");
                                    r["operand"] = (r["operand"]) ? r["operand"] : this.buttons[this.actionBook["2"]].lbl;
                                    newExpression = l["expression"] + this.doEval(action, l["operand"], r["operand"]) + r["expression"];
                                    break;
                                case "ro": // right only
                                    l = line[1];
                                    r = this.calculatePart(line[2], "r");
                                    newExpression = l + this.doEval(action, "", r["operand"]) + r["expression"];
                                    break;
                                case "rr": // right required
                                    l = this.calculatePart(line[1]);
                                    r = this.calculatePart(line[2], "r");
                                    l["operand"] = (l["operand"]) ? l["operand"] : this.buttons[this.actionBook["2"]].lbl;
                                    newExpression = l["expression"] + this.doEval(action, l["operand"], r["operand"]) + r["expression"];
                                    break;
                                default: // b - both
                                    l = this.calculatePart(line[1]);
                                    r = this.calculatePart(line[2], "r");
                                    newExpression = l["expression"] + this.doEval(action, l["operand"], r["operand"]) + r["expression"];
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
        const regxInBrackets = new RegExp("^" + this.literalLeftBracket + "(.)+" + this.literalRightBracket + "$");
        const regxOnlyNumbers = new RegExp("^(" + this.literalNumbers + ")+$");
        if (regxInBrackets.test(expression)) { // if expression in brackets
            result["operand"] = this.calculate(expression.substring(1, expression.length - 1));
        }
        else if (regxOnlyNumbers.test(expression)) { // if only operands
            result["operand"] = expression;
        }
        else {
            let ind = (side == "l") ? "lastI" : "i"; // for left part find operator from the end, for right - from the begin
            let wanted = []; // array of operators with current priority
            for (let label in this.labelBook) { // get all operators with current priority
                if (this.buttons[this.labelBook[label]]["operators"]) wanted.push(label);
            }
            wanted.push(this.operators["("], this.operators[")"]);
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

    shouldLiteral (character) {
        return (/(\+|\*|\/|\(|\)|\^|\$|\.|\{|\}|\[|\]|\|)/.test(character)) ? true : false;
    }

    doEval (action, leftOperand, rightOperand) {
        leftOperand = this.convertExpression(leftOperand, "chr");
        rightOperand = this.convertExpression(rightOperand, "chr");
        let expression = action.replace("l", leftOperand).replace("r", rightOperand);
        expression = eval(expression).toString();
        expression = this.convertExpression(expression, "lbl");
        return expression;
    }

    convertExpression (expression, get) {
        // if get == chr convert numbers and dot labels to numbers and dot characters
        // if get == lbl convert numbers and dot characters to numbers and dot labels
        let converted = "";
        if (get == "chr") {
            for (let i = 0; i < expression.length; i++) {
                // get button's data by [ position from labelBook ] . get action of button
                converted += this.buttons[this.labelBook[expression[i]]].action;
            }
        }
        else {
            for (let i = 0; i < expression.length; i++) {
                // find label by action
                converted += this.buttons[this.actionBook[expression[i]]].lbl;
            }
        }
        return converted;
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

        blueHeadMan.init();
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
// letterCalculator();

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
    showRoom.putToLine("18/3*(5-4+1)"); // 12
    // showRoom.putToLine("(v10+1)/(6.25-1.8^2)"); // 1.3828165
    // showRoom.putToLine("(v3+2*v2)/(v(v5))"); // 3.0497754
    // showRoom.putToLine("v(v5+v6)"); // 2.16461491
}

function letterCalculator () {
    btns.addBtn("a", "one", 5, "1");
    btns.addBtn("b", "two", 5, "2");
    btns.addBtn("c", "three", 5, "3");
    btns.addBtn("p", "plus", 4, "l+r", "b");
    btns.addBtn("q", "minus", 4,  "l-r", "b");

    btns.addBtn("d", "four", 5, "4");
    btns.addBtn("e", "fife", 5, "5");
    btns.addBtn("f", "six", 5, "6");
    btns.addBtn("o", "multiply", 3, "l*r", "b");
    btns.addBtn("t", "divide", 3, "l/r", "b");

    btns.addBtn("g", "seven", 5, "7");
    btns.addBtn("h", "eight", 5, "8");
    btns.addBtn("i", "nine", 5, "9");
    btns.addBtn("w", "power", 2, "Math.pow(l, r)", "lr");
    btns.addBtn("v", "root", 2, "Math.pow(r, 1/l)", "rr");

    btns.addBtn("j", "zero", 5, "0");
    btns.addBtn("k", "dot", 5, ".");
    btns.addBtn("n", "left bracket",1, "(");
    btns.addBtn("m", "right bracket",1, ")");
    btns.addBtn("u", "to percent", 3, "l/100", "lo");

    btns.addBtn("s", "count", 0, "s");
    btns.addBtn("l", "clear", 0, "c");
    btns.addBtn("r", "delete", 0, "d");

    showRoom.init("calculator");

    // for test
    showRoom.putToLine("ahtconeqdpam"); // ab // 18/3*(5-4+1) = 12
    // showRoom.putToLine("nvajpamtnfkbeqakhwbm"); // akchbhafe // (v10+1)/(6.25-1.8^2) = 1.3828165
    // showRoom.putToLine("nvcpbovbmtnvnvemm"); // ckjdigged // (v3+2*v2)/(v(v5)) = 3.0497754
    // showRoom.putToLine("vnvepvfm"); // bkafdfadia // v(v5+v6) = 2.16461491
}

// brackets have higher priority
// numbers and dot has lower priority