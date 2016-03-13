/**
 * Sample for the stepper-wiringpi.js.
 * 
 * Here we are testing a Stepper motor that has 200 steps per revolution
 * which equates to 360/200 = 1.8 degrees per step.
 */

console.log("Starting stepper-wiringpi - test1");
var wpi = require("wiring-pi");
wpi.setup("gpio");
wpi.pcf8574Setup(100, 0x20);

var stepperWiringPi = require("../src/stepper-wiringpi");
var pinIN1 = 100;  // Stepper Red
var pinIN2 = 101;  // Stepper Blue
var pinIN3 = 102 ;// Stepper Green
var pinIN4 = 103; // Stepper Black
var motor1 = stepperWiringPi.setup(200, pinIN1, pinIN2, pinIN3, pinIN4);

motor1.setSpeed(90);
motor1.step(800, function() {
  console.log("Stepping complete!");
});

console.log("Step requested submitted.");
