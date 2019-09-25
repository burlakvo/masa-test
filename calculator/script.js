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

        let le, lo;

        // если в скобках
        if (/^\((.)+\)$/.test(line[1])) {
            // выражение - le = "0+";
            le = "0+";

            // левый операнд - lo = рекурсия line[1]
            lo = calculate(line[1]);
        }

        // иначе, если есть оператор
        else if (/(\+|-|\*|\/|\()/.test(line[1])) {
            // разбить по нему строку
            let indexO = 0;

            if (line[1].lastIndexOf("+") != -1) {
                indexO = line[1].lastIndexOf("+");
            }
            if (line[1].lastIndexOf("-") != -1) {
                indexO = (line[1].lastIndexOf("-") > indexO) ? line[1].lastIndexOf("-") : indexO;
            }
            if (line[1].lastIndexOf("*") != -1) {
                indexO = (line[1].lastIndexOf("*") > indexO) ? line[1].lastIndexOf("*") : indexO;
            }
            if (line[1].lastIndexOf("/") != -1) {
                indexO = (line[1].lastIndexOf("/") > indexO) ? line[1].lastIndexOf("/") : indexO;
            }
            if (line[1].lastIndexOf("(") != -1) {
                indexO = (line[1].lastIndexOf("(") > indexO) ? line[1].lastIndexOf("(") : indexO;
            }


            // выражение - le = line[1].substring(0, indexO + 1);
            le = line[1].substring(0, indexO + 1);

            // левый операнд - lo = line[1].substring(indexO + 1, line[1].length);
            lo = line[1].substring(indexO + 1, line[1].length);

        }

        // иначе, если нет оператора
        else {
            // выражение - le = "0+";
            le = "0+";

            // левый операнд - lo = line[1]
            lo = line[1];
        }

        // правую часть, line[2], проверить с начала строки на наличие операторов

        let ro, re;

        // если в скобках
        if (/^\((.)+\)$/.test(line[2])) {
            // правый операнд - ro = рекурсия line[2]
            ro = calculate(line[2]);

            // выражение - re = "+0"
            re = "+0";
        }

        // иначе, если есть оператор
        else if (/(\+|-|\*|\/|v|\^|\)|%)/.test(line[2])) {
            // разбить по нему строку
            let indexO = line[2].length;

            if (line[2].indexOf("+") != -1) {
                indexO = line[2].indexOf("+");
            }
            if (line[2].indexOf("-") != -1) {
                indexO = (line[2].indexOf("-") < indexO) ? line[2].indexOf("-") : indexO;
            }
            if (line[2].indexOf("*") != -1) {
                indexO = (line[2].indexOf("*") < indexO) ? line[2].indexOf("*") : indexO;
            }
            if (line[2].indexOf("/") != -1) {
                indexO = (line[2].indexOf("/") < indexO) ? line[2].indexOf("/") : indexO;
            }
            if (line[2].indexOf(")") != -1) {
                indexO = (line[2].indexOf(")") < indexO) ? line[2].indexOf(")") : indexO;
            }
            if (line[2].indexOf("^") != -1) {
                indexO = (line[2].indexOf("^") < indexO) ? line[2].indexOf("^") : indexO;
            }
            if (line[2].indexOf("v") != -1) {
                indexO = (line[2].indexOf("v") < indexO) ? line[2].indexOf("v") : indexO;
            }
            if (line[2].indexOf("%") != -1) {
                indexO = (line[2].indexOf("%") < indexO) ? line[2].indexOf("%") : indexO;
            }

            // правый операнд - ro = line[2].substring(0, indexO);
            ro = line[2].substring(0, indexO);

            // выражение - re = line[2].substring(indexO, line[1].length);
            re = line[2].substring(indexO, line[2].length);
        }

        // иначе, если нет оператора
        else {
            // правый операнд - ro = line[2]
            ro = line[2];
            // выражение - re = "+0"
            re = "+0";
        }

        /*
        собрать строку s = le + Math.pow(lo, ro) + re
        вернуть рекурсию s
        */

        let newExpression = le + Math.pow(lo, ro) + re;
        return calculate(newExpression);
    }

    // иначе, если корень раньше или степени/процента нет
    else if ((expression.indexOf("v") < expression.indexOf("^") || expression.indexOf("^") == -1) && (expression.indexOf("v") < expression.indexOf("%") || expression.indexOf("%") == -1) && expression.indexOf("v") != -1) {
        // разбить строку по первому вхождению корня
        let line = expression.match(/^([^v]*)v(.+)$/);

        // левую часть, line[1], проверить с конца строки на наличие операторов

        let le, lo;

        // если выражение в скобках
        if (/^\((.)+\)$/.test(line[1])) {
            // выражение - le = "0+";
            le = "0+";

            // операнд - lo = рекурсия line[1]
            lo = calculate(line[1]);
        }

        // иначе, если сразу оператор
        else if (/(\+|-|\*|\/|\()$/.test(line[1]) || line[1] == "") {
            // выражение - le = line[1]
            le = line[1];

            // операнд - lo = 2
            lo = 2;
        }

        // иначе, если есть оператор
        else if (/(\+|-|\*|\/|\()/.test(line[1])) {
            // разбить по нему строку
            let indexO;

            if (line[1].lastIndexOf("+") != -1) {
                indexO = line[1].lastIndexOf("+");
            }
            if (line[1].lastIndexOf("-") != -1) {
                indexO = (line[1].lastIndexOf("-") > indexO) ? line[1].lastIndexOf("-") : indexO;
            }
            if (line[1].lastIndexOf("*") != -1) {
                indexO = (line[1].lastIndexOf("*") > indexO) ? line[1].lastIndexOf("*") : indexO;
            }
            if (line[1].lastIndexOf("/") != -1) {
                indexO = (line[1].lastIndexOf("/") > indexO) ? line[1].lastIndexOf("/") : indexO;
            }
            if (line[1].lastIndexOf("(") != -1) {
                indexO = (line[1].lastIndexOf("(") > indexO) ? line[1].lastIndexOf("(") : indexO;
            }

            // выражение - le = line[1].substring(0, indexO + 1);
            le = line[1].substring(0, indexO + 1);

            // левый операнд - lo = line[1].substring(indexO + 1, line[1].length);
            lo = line[1].substring(indexO + 1, line[1].length);
        }

        // иначе, если оператора нет
        else {
            // выражение - le = "0+";
            le = "0+";

            // операнд - lo = line[1]
            lo = line[1];
        }

        // правую часть, line[2], проверить с начала строки на наличие операторов

        let ro, re;

        // если в скобках
        if (/^\((.)+\)$/.test(line[2])) {
            // правый операнд - ro = рекурсия line[2]
            ro = calculate(line[2]);

            // выражение - re = "+0"
            re = "+0";
        }

        // иначе, если есть оператор
        else if (/(\+|-|\*|\/|v|\^|\)|%)/.test(line[2])) {
            // разбить по нему строку
            let indexO = line[2].length;

            if (line[2].indexOf("+") != -1) {
                indexO = line[2].indexOf("+");
            }
            if (line[2].indexOf("-") != -1) {
                indexO = (line[2].indexOf("-") < indexO) ? line[2].indexOf("-") : indexO;
            }
            if (line[2].indexOf("*") != -1) {
                indexO = (line[2].indexOf("*") < indexO) ? line[2].indexOf("*") : indexO;
            }
            if (line[2].indexOf("/") != -1) {
                indexO = (line[2].indexOf("/") < indexO) ? line[2].indexOf("/") : indexO;
            }
            if (line[2].indexOf(")") != -1) {
                indexO = (line[2].indexOf(")") < indexO) ? line[2].indexOf(")") : indexO;
            }
            if (line[2].indexOf("^") != -1) {
                indexO = (line[2].indexOf("^") < indexO) ? line[2].indexOf("^") : indexO;
            }
            if (line[2].indexOf("v") != -1) {
                indexO = (line[2].indexOf("v") < indexO) ? line[2].indexOf("v") : indexO;
            }
            if (line[2].indexOf("%") != -1) {
                indexO = (line[2].indexOf("%") < indexO) ? line[2].indexOf("%") : indexO;
            }

            // правый операнд - ro = line[2].substring(0, indexO);
            ro = line[2].substring(0, indexO);

            // выражение - re = line[2].substring(indexO, line[1].length);
            re = line[2].substring(indexO, line[2].length);
        }

        // иначе, если нет оператора
        else {
            // правый операнд - ro = line[2]
            ro = line[2];

            // выражение - re = "+0"
            re = "+0";
        }

        // собрать строку s = le + Math.pow(ro, 1/lo) + re
        // вернуть рекурсию s

        let newExpression = le + Math.pow(ro, 1/lo) + re;
        return calculate(newExpression);
    }

    // иначе, если процент раньше или степени/корня нет
    else if ((expression.indexOf("%") > expression.indexOf("^") || expression.indexOf("^") == -1) && (expression.indexOf("%") < expression.indexOf("v") || expression.indexOf("v") == -1) && expression.indexOf("%") != -1) {
        // разбить строку по первому вхождению процента
        let line = expression.match(/^([^%]+)%(.*)$/);

        // левую часть, line[1], проверить с конца строки на наличие операторов

        let le, lo;

        // если выражение в скобках
        if (/^\((.)+\)$/.test(line[1])) {
            // выражение - le = "0+";
            le = "0+";

            // операнд - lo = рекурсия line[1]
            lo = calculate(line[1]);
        }

        // иначе, если есть оператор
        else if (/(\+|-|\*|\/|\()/.test(line[1])) {
            // разбить по нему строку
            let indexO = 0;

            if (line[1].lastIndexOf("+") != -1) {
                indexO = line[1].lastIndexOf("+");
            }
            if (line[1].lastIndexOf("-") != -1) {
                indexO = (line[1].lastIndexOf("-") > indexO) ? line[1].lastIndexOf("-") : indexO;
            }
            if (line[1].lastIndexOf("*") != -1) {
                indexO = (line[1].lastIndexOf("*") > indexO) ? line[1].lastIndexOf("*") : indexO;
            }
            if (line[1].lastIndexOf("/") != -1) {
                indexO = (line[1].lastIndexOf("/") > indexO) ? line[1].lastIndexOf("/") : indexO;
            }
            if (line[1].lastIndexOf("(") != -1) {
                indexO = (line[1].lastIndexOf("(") > indexO) ? line[1].lastIndexOf("(") : indexO;
            }

            // выражение - le = line[1].substring(0, indexO + 1);
            le = line[1].substring(0, indexO + 1);

            // левый операнд - lo = line[1].substring(indexO + 1, line[1].length);
            lo = line[1].substring(indexO + 1, line[1].length);
        }

        // иначе, если оператора нет
        else {
            // выражение - le = "0+";
            le = "0+";

            // операнд - lo = line[1]
            lo = line[1];
        }

        // правая часть, line[2]

        let re = line[2];

        // собрать строку s = le + Math.pow(ro, 1/lo) + re
        // вернуть рекурсию s

        let newExpression = le + lo / 100 + re;
        return calculate(newExpression);
    }
}

// "(v3+2*v2)/vv5".match(/^([^v]*)v(.+)$/)

// ^ is Math.pow(base, exponent)
// v is Math.pow(base, 1/exponent)
// % is base/100