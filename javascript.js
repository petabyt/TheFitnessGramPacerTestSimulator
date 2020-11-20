var canvas = document.getElementById('canvas');
var c = canvas.getContext("2d");
var interacted = false; // If user has interacted with DOM

var move = {
	alreadyPressed: false
}

var player = {
	x: 0,
	speed: 100, // You may have to adjust velocity for this
	frame: 0,
	direction: "right"
}

var test = {
	// Calculate time from screen width so
	// it is the same for big and small windows
	time: Math.floor(window.innerWidth / 300),

	round: 0,
	over: false,
	start: false,
	began: false,
	difficulty: null, // This is the difficulty loop, as a function
	buttonDelay: false // Button is done after ding
}


var audio;
window.onload = function() {
	// Load audio
	audio = {
		"intro": new Audio("assets/introduction.mp3"),
		"sun": new Audio("assets/Sunrise_Drive.mp3"),
		"speedup": new Audio("assets/speedup.mp3"),
		"lap": new Audio("assets/lap.mp3"),
		"start": new Audio("assets/start.mp3")
	}

	// Resize canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Draw intro message
	c.fillStyle = "black";
	c.fillRect(0, 0, canvas.width, canvas.height);
	c.drawImage(
		img("start"),
		(canvas.width - img("start").width) / 2,
		(canvas.height - img("start").height) / 2,
		img("start").width,
		img("start").height
	);

	var a = setInterval(function() {
		if (interacted) {
			if (!test.began) {
				play("intro");
			}
			clearInterval(a);
		}
	}, 1);
}

function beginRender() {
	// Main game loop
	setInterval(function() {
		c.clearRect(0, 0, canvas.width, canvas.height);

		// Ground level of room
		var ground = canvas.height / 2 + 100; // Ground level

		// Draw gym floor
		c.fillStyle = "chocolate";
		c.fillRect(0, ground, canvas.width, canvas.height);
		c.fillStyle = "sienna";
		c.fillRect(0, ground, canvas.width, 25);
		c.fillStyle = "LightSkyBlue";
		c.fillRect(0, 0, canvas.width, ground);

		// Draw player
		c.fillStyle = "red";
		if (player.frame == 1) {
			player.frame = 2;
			c.drawImage(person("person1"), player.x, ground - 84, 66, 84);
		} else if (player.frame == 2) {
			c.drawImage(person("person2"), player.x, ground - 84, 66, 84);
			player.frame = 1;
		} else {
			c.drawImage(person("person"), player.x, ground - 84, 66, 84);
		}


		// Draw Markers
		c.fillStyle = "blue";
		c.fillRect(100, ground, 10, 50);
		c.fillRect(canvas.width - 100, ground, 10, 50);

		// If go, then light up thing
		if (test.start) {
			c.fillStyle = "green";

			if (!test.buttonDelay) {
				setTimeout(function() {
					test.buttonDelay = true;
					test.start = false;
				}, 100);
			}
		} else {
			test.buttonDelay = false;
			c.fillStyle = "lightgreen";
		}

		// Draw button things
		c.fillRect(10, canvas.height - 70, 130, 60);
		c.fillStyle = "black";
		c.font = "30px Arial";
		c.fillText("Go!", 52, canvas.height - 30);

		// Draw Game over screen
		if (test.over) {
			// Draw main box
			c.fillStyle = "white";
			c.fillRect(canvas.width / 2 - 250, canvas.height / 2 - 250, 500, 500);

			// Draw border
			c.lineWidth = "5"
			c.strokeRect(canvas.width / 2 - 250, canvas.height / 2 - 250, 500, 500);

			c.font = "30px Arial";
			c.fillStyle = "black";
			c.fillText("You lost!", canvas.width / 2 - 50, canvas.height / 2 - 100);
			c.font = "20px Arial";

			var grade = (60 + test.round);
			c.fillText("You got to round " + test.round + "! (" + grade + "%)", canvas.width / 2 - 100, canvas.height / 2 - 50);
			c.font = "20px Arial";

			var ending = "";
			if (grade > 110) {
				ending = "- You are legend -";
			} else if (grade > 100) {
				ending = "Not bad..";
			} else if (grade > 90) {
				ending = "Is that really the best you can do?";
			} else if (grade > 80) {
				ending = "Did you even try?";
			} else if (grade > 70) {
				ending = "I've seen rocks go faster than that.";
			} else {
				ending = "You didn't even try. How pathetic.";
			}

			// Draw ending in center
			c.fillText(ending, (canvas.width / 2 - c.measureText(ending).width / 2), canvas.height / 2);
		}
	}, 1);
}

// Make moving harder by not letting the player hold the key down
function key(event) {
	interacted = true;
	if (!move.alreadyPressed && test.began) {
		move.alreadyPressed = true;

		if (event.key == "d" || event.key == "ArrowRight") {
			glidePlayer("forward");
			player.direction = "right";
		} else if (event.key == "a" || event.key == "ArrowLeft") {
			player.direction = "left";
			glidePlayer("back");
		}
	}

	// Allow the user to start
	if (event.key == " ") {
		test.began = true;

		// Stop intro
		stop("intro");

		// Start the render background loop
		beginRender();

		play("start");

		// 1 Second before start (length of start.mp3)
		setTimeout(function() {
			startTest();

			play("sun"); // Background music

			// Progressively gets harder every 5 seconds
			test.difficulty = setInterval(function() {
				test.time -= .1;
				play("speedup");
			}, 5000);
		}, 3396);
	}
}

// Use velocity to make nice smooth player movements
function glidePlayer(direction) {
	var length = player.x + player.speed;

	player.frame = 1; // Set frame to running, and start animation
	var velocity = 10;
	var int = setInterval(function() {
		if (player.x > length) {
			clearInterval(int);

			// Set frame to standing, with a delay to make it look more natural
			setTimeout(function() {
				player.frame = 0;
			}, 100);
		} else {
			velocity = velocity * .92;

			if (direction == "forward") {
				if (!(player.x > canvas.width - 50)) {
					player.x += velocity;
				}
			} else {
				player.x -= velocity;
				if (player.x < -30) {
					player.x += velocity;
				}
			}
		}
	}, 1);

	// // Sometimes the movements aren't exact, but we can kill them after half a second
	setTimeout(function() {
		clearInterval(int);
		player.frame = 0;
	}, 200);
}

// Test mechanics (called every lap)
function startTest() {
	test.start = true; // If button should light up (false again in 100ms)
	test.began = true; // If the test has begun yet

	var time = setTimeout(function() {
		var roundEven = test.round % 2 == 0;
		var right = player.x > canvas.width - 100;
		var left = player.x < 100;

		// Didn't make it to the opposite side
		if (roundEven && !right) {
			test.over = true;
		} else if (!roundEven && !left) {
			test.over = true;
		}

		if (test.over) {
			clearTimeout(time); // Stop round counter
			clearTimeout(test.difficulty); // Stop difficulty progressor
		} else {
			test.round++
			play("lap");
			startTest(); // Really just restarting the loop
		}
	}, test.time * 1000);
}

// Return player facing right or left
function person(name) {
	return document.getElementById(name + "-" + player.direction);
}

// Simple function to get document id
function img(name) {
	return document.getElementById(name);
}

// Function to play an audio file
function play(name) {
	audio[name].currentTime = 0;
	audio[name].play();
}

function stop(name) {
	audio[name].pause();
}
