/**
 * Sample for the stepper-wiringpi.js.
 * 
 * Here we are testing a Stepper motor that has 200 steps per revolution
 * which equates to 360/200 = 1.8 degrees per step.
 * 
 * In this test we continuously run forwards for 5 seconds and then continuously run
 * backwards for 5 seconds and then keep repeating.
 */

var speed        = 150; // RPM
var directionPin = 20; // Pin used for direction
var stepPin      = 12; // Pin used for stepping

console.log("Starting stepper-wiringpi - digital_ForwardBackward");

var stepperWiringPi = require("../src/stepper-wiringpi");
var motor1 = stepperWiringPi.setupDigital(200, stepPin, directionPin, true);
var direction = stepperWiringPi.FORWARD;

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
} // End of changeDirection

debugger;
motor1.setSpeed(speed);

changeDirection();

console.log("Starting to move ...");
// End of file