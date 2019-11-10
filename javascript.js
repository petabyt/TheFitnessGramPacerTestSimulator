var canvas = document.getElementById('canvas');
var c = canvas.getContext("2d");
var interacted = false; // If user has interacted with DOM
var audio; // Global audio

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
	time: 4, // In seconds
	round: 0,
	over: false,
	start: false,
	began: false,
	buttonDelay: false // Button is done after ding
}

window.onload = function() {
	var a = setInterval(function() {
		if (interacted) {
			if (!test.began) {
				play("introduction.mp3");
			}
			clearInterval(a);
		}
	}, 1)
}

// Main game loop
setInterval(function() {
	c.clearRect(0, 0, canvas.width, canvas.height);

	var ground = canvas.height / 2 + 100; // Ground level

	// Draw gym or whatever
	c.fillStyle = "brown";
	c.fillRect(0, ground, canvas.width, canvas.height)

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
		c.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 300);

		// Draw border
		c.lineWidth = "5"
		c.strokeRect(canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 300);

		c.font = "30px Arial";
		c.fillStyle = "black";
		c.fillText("You lost!", canvas.width / 2 - 50, canvas.height / 2 - 100);
		c.font = "20px Arial";
		c.fillText("You got to round " + test.round + "!", canvas.width / 2 - 80, canvas.height / 2 - 50);
	}

	// Make black start screen
	if (!test.began) {
		c.fillStyle = "black";
		c.fillRect(0, 0, canvas.width, canvas.height);

		c.drawImage(img("start"), 0, 0)
	}
}, 1);

// Make moving harder by not letting the player hold the key down
function key(event) {
	interacted = true;
	if (!move.alreadyPressed && test.began) {
		move.alreadyPressed = true;

		if (event.key == "d") {
			glidePlayer("forward");
			player.direction = "right";
		} else if (event.key == "a") {
			player.direction = "left";
			glidePlayer("back");
		}
	}

	// Allow the user to start
	if (event.key == " ") {
		test.began = true;
		
		// Stop intro
		if (typeof audio !== "undefined") {
			audio.pause();
		}

		play("start.mp3")
		// 1 Second before start
		setTimeout(function() {
			startTest();

			// Progressively gets harder every 5 seconds
			setInterval(function() {
				test.time -= .1;
				play("speedup.mp3");
			}, 5000);
		}, 3396)
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
			}, 50);
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
	}, 10);

	// Sometimes the movements aren't exact, but we can kill them after half a second
	setTimeout(function() {
		clearInterval(int);
		player.frame = 0;
	}, 500);
}

// Test mechanics
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
			clearTimeout(time)
		} else {
			test.round++
			play("lap.mp3");
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
function play(src) {
	audio = undefined;
	audio = new Audio("assets/" + src);
	audio.currentTime = 0;
	audio.play();
}