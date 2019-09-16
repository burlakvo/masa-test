var target = {}; // where fireman have to go: position and number
var howOftenPlay = 5; // max time to make fire in next building
var fireman = document.getElementById("fireman");


window.onload = function(){

	var street = document.getElementById("street");
	
	for (let i = 0, buildingNum = 10; i < buildingNum; i++) { // create & add buildings to street
		let building = document.createElement("div"); // create new element
		building.classList.add("building"); // add class to new element
		building.setAttribute("buildingNumber", i); // set number of building on the street
		street.appendChild(building); // add new element to DOM
	}

	playWithFire(); // bring flame to random building
	// fireman check most closer fired building to him and go there
	// when fireman stop near the building it loose "fire" status
	window.setInterval(checkStreet, 50);

}

function playWithFire () { // bring fire to a random building
	let buildings = document.querySelectorAll(".building:not(.fire)"); // buildings that not in flame
	let buildingNum = buildings.length;
	let whosNext = Math.ceil(Math.random() * buildingNum - 1); // -1 for include zero element in array of buildings
	makeFire(buildings[whosNext]);
	let whenNext = Math.ceil(Math.random() * howOftenPlay);
	setTimeout(playWithFire, whenNext * 1000);
}

function makeFire (building) {
	building.classList.add("fire");
}

function checkStreet () {
	let fireman = document.getElementById("fireman");
	let firemanPos = (fireman.getBoundingClientRect().left + fireman.getBoundingClientRect().right) / 2; // center of fire man
	
	let buildings = document.querySelectorAll(".building.fire");
	let closer = {}; // object for keep closer building in fire to fireman
	// find target
	buildings.forEach(function (item, index) {
		let buildingPos = item.getBoundingClientRect();
		buildingPos = (buildingPos.left + buildingPos.right) / 2; // center of building
		if (closer.pos === undefined || Math.abs(buildingPos - firemanPos) < Math.abs(closer.pos - firemanPos)) {
			closer.pos = buildingPos;
			closer.val = item.getAttribute("buildingNumber");
		}
	});
	// set target
	if (target.pos === undefined || Math.abs(closer.pos - firemanPos) < Math.abs(target.pos - firemanPos)) { // if we don't have target or new target closer than current
		target.pos = closer.pos;
		target.val = closer.val;
	}
	// move fireman
	if (target.pos == undefined) {
		// relax
	}
	else if (firemanPos >= (target.pos - 10) && firemanPos <= (target.pos + 10)) { // if fireman touch target
		building = document.querySelector(".building[buildingNumber='" + target.val + "']");
		justDoIt(building);
	}
	else if (firemanPos > target.pos) { // if target to the left of fireman
		fireman.style.left = parseInt(fireman.style.left) - 5 + "px";
	}
	else if (firemanPos < target.pos) { // if fireman to the left of target
		fireman.style.left = parseInt(fireman.style.left) + 5 + "px";
	}
}

function justDoIt (building) {
	building.classList.remove("fire");
	target = {};
}