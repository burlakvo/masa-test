const buttons = document.querySelectorAll(".btn");
const line = document.getElementById("line");
const log = document.getElementById("log");

buttons.forEach(e => e.addEventListener("click", calcAction.bind(e)));

function calcAction () {
	let btnVal = this.value;

	switch (btnVal) {
        case "c":
            line.innerText = "";
            break;

        case "d":
            line.innerText = line.innerText.substring(0, line.innerText.length - 1);
            break;

        case "=":
            let lineVal = line.innerText;
            let resultVal = calculate(lineVal);
            // добавить в лог ответ
            let dd = document.createElement("dd");
            dd.innerHTML = "= " + resultVal;
            log.prepend(dd);
            // добавить в лог пример
            let dt = document.createElement("dt");
            dt.innerHTML = lineVal;
            log.prepend(dt);
            // вставить результат в строку калькулятора
            line.innerText = resultVal;
            break;

        default:
            line.append(btnVal);
    }
}

function calculate (expression) {
	// если нет спец операторов
	if (expression.indexOf("^") == -1 && expression.indexOf("v") == -1 && expression.indexOf("%") == -1) {
	    // вернуть вичисление
		return eval(expression);
	}

    // иначе, если степень раньше или корня/процента нет
    else if ((expression.indexOf("^") < expression.indexOf("v") || expression.indexOf("v") == -1) && (expression.indexOf("^") < expression.indexOf("%") || expression.indexOf("%") == -1) && expression.indexOf("^") != -1) {
        // разбить строку по первому вхождению степени
        let line = expression.match(/^([^\^]*)\^(.+)$/);

        // левую часть, line[1], проверить с конца строки на наличие операторов
        let l = calculatePart(line[1], "l");

        // правую часть, line[2], проверить с начала строки на наличие операторов
        let r = calculatePart(line[2], "r");

        let newExpression = l["expression"] + Math.pow(l["operand"], r["operand"]) + r["expression"];
        return calculate(newExpression);
    }

    // иначе, если корень раньше или степени/процента нет
    else if ((expression.indexOf("v") < expression.indexOf("^") || expression.indexOf("^") == -1) && (expression.indexOf("v") < expression.indexOf("%") || expression.indexOf("%") == -1) && expression.indexOf("v") != -1) {
        // разбить строку по первому вхождению корня
        let line = expression.match(/^([^v]*)v(.+)$/);

        // левая часть, line[1]
        let l = calculatePart(line[1], "l", "v");

        // правую часть, line[2], проверить с начала строки на наличие операторов
        let r = calculatePart(line[2], "r");

        let newExpression = l["expression"] + Math.pow(r["operand"], 1/l["operand"]) + r["expression"];
        return calculate(newExpression);
    }

    // иначе, если процент раньше или степени/корня нет
    else if ((expression.indexOf("%") > expression.indexOf("^") || expression.indexOf("^") == -1) && (expression.indexOf("%") < expression.indexOf("v") || expression.indexOf("v") == -1) && expression.indexOf("%") != -1) {
        // разбить строку по первому вхождению процента
        let line = expression.match(/^([^%]+)%(.*)$/);

        // левая часть, line[1]
        let l = calculatePart(line[1], "l")

        // правая часть, line[2]
        let re = line[2];

        let newExpression = l["expression"] + l["operand"] / 100 + re;
        return calculate(newExpression);
    }
}

/*
    * expression
    * side (l|r)
      char (^|v|%)
*/
function calculatePart (expression, side, char = "") {
    let result = [];
    let regex = new RegExp((side == "l") ? "(\\+|-|\\*|\\/|\\()" : "(\\+|-|\\*|\\/|v|\\^|\\)|%)");
    let compare = (side == "l") ? ">" : "<";

    // если выражение в скобках
    if (/^\((.)+\)$/.test(expression)) {
        // операнд
        result["operand"] = calculate(expression);

        // выражение
        result["expression"] = (side == "l") ? "0+" : "+0";
    }

    // иначе, если сразу оператор | только для корня в левой части
    else if ((/(\+|-|\*|\/|\()$/.test(expression) || expression == "") && side == "l" && char == "v") {
        // выражение
        result["expression"] = expression;

        // операнд
        result["operand"] = 2;
    }

    // иначе, если есть оператор разбить по нему строку
    else if (regex.test(expression)) {
        let indexO = 0; // позиция для разбивки строки
        let ind = (side == "l") ? "lastI" : "i"; // для левой части необходимо искать оператор с конца, а для правой - с начала

        if (expression[ind + "ndexOf"]("+") != -1) {
            indexO = expression[ind + "ndexOf"]("+");
        }
        if (expression[ind + "ndexOf"]("-") != -1) {
            indexO = (eval(expression[ind + "ndexOf"]("-") + compare + indexO)) ? expression[ind + "ndexOf"]("-") : indexO;
        }
        if (expression[ind + "ndexOf"]("*") != -1) {
            indexO = (eval(expression[ind + "ndexOf"]("*") + compare + indexO)) ? expression[ind + "ndexOf"]("*") : indexO;
        }
        if (expression[ind + "ndexOf"]("/") != -1) {
            indexO = (eval(expression[ind + "ndexOf"]("/") + compare + indexO)) ? expression[ind + "ndexOf"]("/") : indexO;
        }
        if (expression[ind + "ndexOf"]("(") != -1) {
            indexO = (eval(expression[ind + "ndexOf"]("(") + compare + indexO)) ? expression[ind + "ndexOf"]("(") : indexO;
        }
        if (expression[ind + "ndexOf"](")") != -1) {
            indexO = (eval(expression[ind + "ndexOf"](")") + compare + indexO)) ? expression[ind + "ndexOf"](")") : indexO;
        }
        if (expression[ind + "ndexOf"]("^") != -1 && side == "r") {
            indexO = (eval(expression[ind + "ndexOf"]("^") + compare + indexO)) ? expression[ind + "ndexOf"]("^") : indexO;
        }
        if (expression[ind + "ndexOf"]("v") != -1 && side == "r") {
            indexO = (eval(expression[ind + "ndexOf"]("v") + compare + indexO)) ? expression[ind + "ndexOf"]("v") : indexO;
        }
        if (expression[ind + "ndexOf"]("%") != -1 && side == "r") {
            indexO = (eval(expression[ind + "ndexOf"]("%") + compare + indexO)) ? expression[ind + "ndexOf"]("%") : indexO;
        }

        // операнд - вторая подстрока для левой стороны или первая - для левой
        result["operand"] = (side == "l") ? expression.substring(indexO + 1, expression.length) : expression.substring(0, indexO);
        // выражение - первая подстрока для левой стороны или вторая - для левой
        result["expression"] = (side == "l") ? expression.substring(0, indexO + 1) : expression.substring(indexO, expression.length);
    }

    // иначе, если нет оператора
    else {
        // операнд
        result["operand"] = expression;

        // выражение
        result["expression"] = (side == "l") ? "0+" : "+0";
    }

    return result;
}