/**
 * Sample for the stepper-wiringpi.js.
 * 
 * Here we are testing a Stepper motor that has 200 steps per revolution
 * which equates to 360/200 = 1.8 degrees per step.
 */

console.log("Starting stepper-wiringpi - test2");

var stepperWiringPi = require("../src/stepper-wiringpi");
var pinIN1 = 5;  // Stepper Red
var pinIN2 = 6;  // Stepper Blue
var pinIN3 = 13 ;// Stepper Green
var pinIN4 = 19; // Stepper Black
var motor1 = stepperWiringPi.setup(200, pinIN1, pinIN2, pinIN3, pinIN4);
var direction = 1;
console.log("Globals: FORWARD=%d, BACKWARD=%d", stepperWiringPi.FORWARD, stepperWiringPi.BACKWARD);

function changeDirection() {
  console.log("Changing direction from %d", direction);
  if (direction == stepperWiringPi.FORWARD) {
    direction = stepperWiringPi.BACKWARD;
    motor1.backward();
  } else {
    direction = stepperWiringPi.FORWARD;
    motor1.forward();
  }
  setTimeout(changeDirection.bind(this), 5000);
}

motor1.setSpeed(60);

changeDirection();

console.log("Step requested submitted.");
