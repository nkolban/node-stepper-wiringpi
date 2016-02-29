/**
 * Sample for the stepper-wiringpi.js.
 * 
 * Here we are testing a Stepper motor that has 200 steps per revolution
 * which equates to 360/200 = 1.8 degrees per step.
 */

console.log("Starting stepper-wiringpi - test1");

var stepperWiringPi = require("../src/stepper-wiringpi");
var pinIN1 = 5;  // Stepper Red
var pinIN2 = 6;  // Stepper Blue
var pinIN3 = 13 ;// Stepper Green
var pinIN4 = 19; // Stepper Black
var motor1 = stepperWiringPi.setup(200, pinIN1, pinIN2, pinIN3, pinIN4);

motor1.setSpeed(60);
motor1.step(-200, function() {
  console.log("Stepping complete!");
});

console.log("Step requested submitted.");
