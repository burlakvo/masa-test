class Street {
	constructor () {
		this.geo = document.getElementById("street");
	}

	build (n) { // create new building with number n, push it to array onStreet and add it to DOM
		let building = new Building (n);
		this.geo.appendChild(building);
	}
}

class Building {
	constructor (i) {
		let element = document.createElement("div");
		element.classList.add("building");
		element.setAttribute("buildingNumber", i);
		return element
	}
}

class Fire {
	constructor (time = 5) {
		this.time = time; // max time to make fire in next building
	}

	prometheus () { // bring fire to a random building
		let buildings = document.querySelectorAll(".building:not(.fire)"); // buildings that not in flame
		let buildingNum = buildings.length;
		if (buildingNum != 0) { // if exist buildings without fire
			let whosNext = Math.ceil(Math.random() * buildingNum - 1); // -1 for include zero element in array of buildings
			buildings[whosNext].classList.add("fire");
		}
		let whenNext = Math.ceil(Math.random() * this.time) * 1000; // time is max time to make fire in next building
		let t = this;
		setTimeout(function() {t.prometheus()}, whenNext);
	}
}

class Fireman {
	constructor () {
		this.man = document.getElementById("fireman"); // get element
		this.targetPos = 0; // position where fireman have to go
		this.currentPos = (this.man.getBoundingClientRect().left + this.man.getBoundingClientRect().right) / 2; // center of fire man
	}

	move (direction) { // too logical for describe
		let x = (direction == "left") ? -5 : 5;
		this.man.style.left = parseInt(this.man.style.left) + x + "px";
		this.currentPos += x;
	}

	startWork () {
		let t = this;
		setInterval(function() {t.streetWatch()}, 50);
	}

	streetWatch () {
		let t = this;
		let buildingsInFire = document.querySelectorAll(".building.fire");
		if (buildingsInFire.length == 0) {
			return;
		}
		let closer = {}; // object for keep closer building in fire to fireman
		// find target
		buildingsInFire.forEach(function (item, index) {
			let buildingInFirePos = item.getBoundingClientRect();
			buildingInFirePos = (buildingInFirePos.left + buildingInFirePos.right) / 2; // center of building
			if (closer.pos === undefined || Math.abs(buildingInFirePos - t.currentPos) < Math.abs(closer.pos - t.currentPos)) {
				closer.pos = buildingInFirePos;
				closer.val = item.getAttribute("buildingNumber");
			}
		});
		// set target
		if (this.targetPos === 0 || Math.abs(closer.pos - this.currentPos) < Math.abs(this.targetPos - this.currentPos)) { // if we don't have target or new target closer than current
			this.targetPos = closer.pos;
			this.targetVal = closer.val;
		}
		// move fireman
		if (this.currentPos >= (this.targetPos - 10) && this.currentPos <= (this.targetPos + 10)) { // if fireman touch target
			let building = document.querySelector(".building[buildingNumber='" + this.targetVal + "']");
			this.justDoIt(building);
		}
		else if (this.currentPos > this.targetPos) { // if target to the left of fireman
			this.move("left");
		}
		else if (this.currentPos < this.targetPos) { // if fireman to the left of target
			this.move("right");
		}
	}

	justDoIt (building) { // fight with fire!
		building.classList.remove("fire");
		this.targetPos = 0;
	}

}

// var fireman; // for make him global
var fire;

window.onload = function(){

	var fireman = new Fireman;
	fire = new Fire(5);

	var street = new Street;
	
	for (let n = 0, buildingNum = 10; n < buildingNum; n++) { // create & add buildings to street
		street.build(n);
	}

	fireman.startWork();
	fire.prometheus();

}