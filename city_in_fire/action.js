class Street {
	init (id) {
		this.geo = document.getElementById(id);
	}

	build (n) { // create new building with number n, push it to array onStreet and add it to DOM
		let building = new Building;
		this.geo.appendChild(building.init(n));
	}
}

class Building {
	init (i) {
		let element = document.createElement("div");
		element.classList.add("building");
		element.setAttribute("buildingNumber", i);
		return element;
	}
}

class Fire {
	constructor (time = 5) {
		this.time = time; // max time to make fire in next building
	}

	prometheus () { // bring fire to a random building
		let buildings = document.querySelectorAll(".building:not(.fire)"); // buildings that not in flame
		let buildingNum = buildings.length;
		if (buildingNum !== 0) { // if exist buildings without fire
			let whosNext = Math.ceil(Math.random() * buildingNum - 1); // -1 for include zero element in array of buildings
			buildings[whosNext].classList.add("fire");
		}
		let whenNext = Math.ceil(Math.random() * this.time) * 1000; // time is max time to make fire in next building
		setTimeout(() => this.prometheus(), whenNext);
	}
}

class Fireman {
	init (id) {
		this.man = document.getElementById(id); // get element
		this.targetPos = 0; // position where fireman have to go
		this.currentPos = (this.man.getBoundingClientRect().left + this.man.getBoundingClientRect().right) / 2; // center of fire man
		setInterval(() => this.streetWatch(), 25);
	}

	move (direction) { // too logical for describe
		let x = (direction === "left") ? -5 : 5;
		this.man.style.left = parseInt(this.man.style.left) + x + "px";
		this.currentPos += x;
	}

	// streetWatch () {
	// 	let buildingsInFire = document.querySelectorAll(".building.fire");
	// 	if (buildingsInFire.length != 0) {
	// 		let closer = {}; // object for keep closer building in fire to fireman
	// 		// find target
	// 		buildingsInFire.forEach((item) => {
	// 			let buildingInFirePos = item.getBoundingClientRect();
	// 			buildingInFirePos = (buildingInFirePos.left + buildingInFirePos.right) / 2; // center of building
	// 			if (closer.pos === undefined || Math.abs(buildingInFirePos - this.currentPos) < Math.abs(closer.pos - this.currentPos)) {
	// 				closer.pos = buildingInFirePos;
	// 				closer.val = item.getAttribute("buildingNumber");
	// 			}
	// 		});
	// 		// set target
	// 		if (this.targetPos === 0 || Math.abs(closer.pos - this.currentPos) < Math.abs(this.targetPos - this.currentPos)) { // if we don't have target or new target closer than current
	// 			this.targetPos = closer.pos;
	// 			this.targetVal = closer.val;
	// 		}
	// 		// move fireman
	// 		if (this.currentPos >= (this.targetPos - 10) && this.currentPos <= (this.targetPos + 10)) { // if fireman touch target
	// 			let building = document.querySelector(".building[buildingNumber='" + this.targetVal + "']");
	// 			building.classList.remove("fire");
	// 			this.targetPos = 0;
	// 		}
	// 		else if (this.currentPos > this.targetPos) { // if target to the left of fireman
	// 			this.move("left");
	// 		}
	// 		else if (this.currentPos < this.targetPos) { // if fireman to the left of target
	// 		this.move("right");
	// 	}
	// 	}
	// }

	streetWatch () {
		try {
			let buildingsInFire = document.querySelectorAll(".building.fire");
			if (buildingsInFire.length === 0) {
				throw "fireman: no one building in fire. I can rest a little!";
			}
			let closer = {}; // object for keep closer building in fire to fireman
			// find target
			buildingsInFire.forEach((item) => {
				let buildingInFirePos = item.getBoundingClientRect();
				buildingInFirePos = (buildingInFirePos.left + buildingInFirePos.right) / 2; // center of building
				if (closer.pos === undefined || Math.abs(buildingInFirePos - this.currentPos) < Math.abs(closer.pos - this.currentPos)) {
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
				building.classList.remove("fire");
				this.targetPos = 0;
			}
			else if (this.currentPos > this.targetPos) { // if target to the left of fireman
				this.move("left");
			}
			else if (this.currentPos < this.targetPos) { // if fireman to the left of target
				this.move("right");
			}
		}
		catch (e) {
			// console.log(e);
		}
	}

}

window.onload = function(){

	const fireman = new Fireman;
	const fire = new Fire(5);
	const street = new Street;

	fireman.init("fireman");
	street.init("street");
	
	for (let n = 0, buildingNum = 10; n < buildingNum; n++) { // create & add buildings to street
		street.build(n);
	}

	fire.prometheus();

}