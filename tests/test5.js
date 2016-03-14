/**
 * Sample for the stepper-wiringpi.js.
 * 
 * Here we are testing a Stepper motor that has 200 steps per revolution
 * which equates to 360/200 = 1.8 degrees per step.
 */

var wpi = require("wiring-pi");
wpi.setup("gpio");
wpi.pcf8574Setup(100, 0x20);

// In this test we are going to use a PCF8574 for control and control
// two motors
console.log("Starting stepper-wiringpi - test5");

var stepperWiringPi = require("../src/stepper-wiringpi");
var m1pinIN1 = 100; // Stepper Red
var m1pinIN2 = 101; // Stepper Blue
var m1pinIN3 = 102; // Stepper Green
var m1pinIN4 = 103; // Stepper Black

var m2pinIN1 = 104; // Stepper Red
var m2pinIN2 = 105; // Stepper Blue
var m2pinIN3 = 106; // Stepper Green
var m2pinIN4 = 107; // Stepper Black

var motor1 = stepperWiringPi.setup(200, m1pinIN1, m1pinIN2, m1pinIN3, m1pinIN4);
var motor2 = stepperWiringPi.setup(200, m2pinIN1, m2pinIN2, m2pinIN3, m2pinIN4);
var direction = 1;
console.log("Globals: FORWARD=%d, BACKWARD=%d", stepperWiringPi.FORWARD, stepperWiringPi.BACKWARD);

function changeDirection() {
  console.log("Changing direction from %d", direction);
  if (direction == stepperWiringPi.FORWARD) {
    direction = stepperWiringPi.BACKWARD;
    motor1.backward();
    motor2.backward();
  } else {
    direction = stepperWiringPi.FORWARD;
    motor1.forward();
    motor2.forward();
  }
  setTimeout(changeDirection.bind(this), 2000);
}

motor1.setSpeed(20);
motor2.setSpeed(60);

changeDirection();

console.log("Step requested submitted.");
