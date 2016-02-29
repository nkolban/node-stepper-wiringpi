/**
 * stepper-wiringpi
 * A module that moves a stepper motor for the Raspberry Pi based on the Wiring-Pi
 * module for GPIO access.
 * 
 * Based on the design and implementation of the Arduino Stepper class found here:
 * 
 * https://github.com/arduino/Arduino/tree/master/libraries/Stepper
 * 
 * Neil Kolban <kolban1@kolban.com>
 * 2016-02-27
 */


const wpi = require('wiring-pi');

wpi.setup('gpio');
var thisModule = {};

function setup2Wire(numberOfSteps, motorPin1, motorPin2)
{
  // Pi pins for the motor control connection:
  thisModule.motorPin1 = motorPin1;
  thisModule.motorPin2 = motorPin2;

  // setup the pins on the Pi:
  wpi.pinMode(thisModule.motorPin1, wpi.OUTPUT);
  wpi.pinMode(thisModule.motorPin2, wpi.OUTPUT);

  // When there are only 2 pins, set the others to 0:
  thisModule.motorPin3 = 0;
  thisModule.motorPin4 = 0;
  thisModule.motorPin5 = 0;

  // pin_count is used by the stepMotor() method:
  thisModule.pinCount = 2;
} // End of setup2Wire


function setup4Wire(numberOfSteps, motorPin1, motorPin2, motorPin3, motorPin4)
{ 
  // Pi pins for the motor control connection:
  thisModule.motorPin1 = motorPin1;
  thisModule.motorPin2 = motorPin2;
  thisModule.motorPin3 = motorPin3;
  thisModule.motorPin4 = motorPin4;
  
  // setup the pins on the pi:
  wpi.pinMode(thisModule.motorPin1, wpi.OUTPUT);
  wpi.pinMode(thisModule.motorPin2, wpi.OUTPUT);
  wpi.pinMode(thisModule.motorPin3, wpi.OUTPUT);
  wpi.pinMode(thisModule.motorPin4, wpi.OUTPUT);
  
  // When there are 4 pins, set the others to 0:
  thisModule.motorPin5 = 0;
  
  // pin_count is used by the stepMotor() method:
  thisModule.pinCount = 4;
} // End of setup4Wire


function setup5Wire(numberOfSteps, motorPin1, motorPin2, motorPin3, motorPin4, motorPin5)
{ 
  // Pi pins for the motor control connection:
  thisModule.motorPin1 = motorPin1;
  thisModule.motorPin2 = motorPin2;
  thisModule.motorPin3 = motorPin3;
  thisModule.motorPin4 = motorPin4;
  thisModule.motorPin5 = motorPin5;
  
  // setup the pins on the Pi:
  wpi.pinMode(thisModule.motorPin1, wpi.OUTPUT);
  wpi.pinMode(thisModule.motorPin2, wpi.OUTPUT);
  wpi.pinMode(thisModule.motorPin3, wpi.OUTPUT);
  wpi.pinMode(thisModule.motorPin4, wpi.OUTPUT);
  wpi.pinMode(thisModule.motorPin5, wpi.OUTPUT);
  
  // pin_count is used by the stepMotor() method:
  thisModule.pinCount = 5;
} // End of setup5Wire

/**
 * Setup the object for usage.
 */
exports.setup = function(numberOfSteps, motorPin1, motorPin2, motorPin3, motorPin4, motorPin5) {
  thisModule.stepDelay     = 60*1000/numberOfSteps; // Set the default step delay to 1 rpm.
  thisModule.stepNumber    = 0; // Which step the motor is on.
  thisModule.direction     = 0; // Motor direction.
  thisModule.timerId       = null;
  thisModule.numberOfSteps = numberOfSteps; // Total number of steps for this motor.
  // Determine whether we are being called with 2,4 or 5 pins and setup accordingly.
  if (motorPin3 == undefined) {
    setup2Wire(numberOfSteps, motorPin1, motorPin2);
  } else if (motorPin5 == undefined) {
    setup4Wire(numberOfSteps, motorPin1, motorPin2, motorPin3, motorPin4);
  } else {
    setup5Wire(numberOfSteps, motorPin1, motorPin2, motorPin3, motorPin4, motorPin5);
  }
} // End of setup


/**
 * Sets the speed in revs per minute
 */
exports.setSpeed = function(desiredRPM)
{
  // Some examples.
  //
  // When the number of steps in a revolution is 200
  // Desired RPM - stepDelay
  // 1           - 300ms
  // 60          - 5ms
  // 300         - 1ms
  //
  
  // The maxRPM is the number of revolutions per minute that would result in a
  // stepDelay of 1msec which is the smallest repeat time.  To figure this out,
  // consider the number of milliseconds in a second ... this is 60*1000.  Now
  // contemplate the number of steps in a revolution.  This is stored in the
  // 'numberOfSteps' property.  This tells us that to achieve 1 RPM, we would need
  // to move a step each interval.  As we increase the RPM, we will delay LESS
  // per step. 
  var maxRPM = 60 * 1000 / thisModule.numberOfSteps;
  if (desiredRPM > maxRPM) {
    desiredRPM = maxRPM;
  }
  thisModule.stepDelay = maxRPM / desiredRPM;
} // End of setSpeed


/**
 * Moves the motor stepsToMove steps.  If the number is negative,
 * the motor moves in the reverse direction.  The optional callback
 * function will be invoked when the number of steps being asked to
 * be moved have been moved.
 */
exports.step = function(stepsToMove, callback)
{
  var stepsLeft = Math.abs(stepsToMove);  // how many steps to take

  // determine direction based on whether stepsToMove is + or -:
  if (stepsToMove > 0) { thisModule.direction = 1; }
  if (stepsToMove < 0) { thisModule.direction = 0; }
  
  // If we should already be in the middle of a movement, cancel it.
  if (thisModule.timerId != null) {
    clearInterval(thisModule.timerId);
  }
  
  // Note: A question comes up on scheduling the first move immediately
  // as opposed to a stepDelay later.  We should always pause at least
  // one stepDelay even for the first step.  Consider what would happen
  // if we didn't.  Imagine we issued a step(1) and then a step(-1)
  // immediately on "completion" of the step(1).  We would imagine that
  // we should end up exactly where we started (which is correct).  However
  // if we don't wait at least one stepDelay then the call to step(-1) could
  // happen before the completion of a stepDelay period and we would now be
  // executing a -1 step even though the +1 step hadn't completed which
  // would not allow us to end up at the same position as that at which
  // we started.
  thisModule.timerId = setInterval(function()
  {
    // increment or decrement the step number,
    // depending on direction:
    if (thisModule.direction == 1)
    {
      thisModule.stepNumber++;
      if (thisModule.stepNumber == thisModule.numberOfSteps) {
        thisModule.stepNumber = 0;
      }
    }
    else
    {
      if (thisModule.stepNumber == 0) {
        thisModule.stepNumber = thisModule.numberOfSteps;
      }
      thisModule.stepNumber--;
    }

    // step the motor to step number 0, 1, ..., {3 or 10}
    stepMotor(thisModule.stepNumber);
    
    // Decrement the steps left to move.  If we have moved the correct number
    // of steps, cancel the timer as there is no need to move anymore.
    stepsLeft--;
    if (stepsLeft == 0) {
      clearInterval(thisModule.timerId);
      thisModule.timerId = null;
      if (callback != null) {
        callback();
      }
    } // End of stepsLeft == 0
  }, thisModule.stepDelay); // End of setInterval
} // End of step


/*
 * Moves the motor forward or backwards.
 */
exports.stepMotor = stepMotor;
function stepMotor(thisStep)
{
  if (thisModule.pinCount == 2) {
    switch (thisStep % 4) {
      case 0:  // 01
        wpi.digitalWrite(thisModule.motorPin1, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin2, wpi.HIGH);
      break;
      case 1:  // 11
        wpi.digitalWrite(thisModule.motorPin1, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin2, wpi.HIGH);
      break;
      case 2:  // 10
        wpi.digitalWrite(thisModule.motorPin1, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin2, wpi.LOW);
      break;
      case 3:  // 00
        wpi.digitalWrite(thisModule.motorPin1, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin2, wpi.LOW);
      break;
    }
  }
  else if (thisModule.pinCount == 4) {
    switch (thisStep % 4) {
      case 0:  // 1010
        wpi.digitalWrite(thisModule.motorPin1, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin2, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin3, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin4, wpi.LOW);
      break;
      case 1:  // 0110
        wpi.digitalWrite(thisModule.motorPin1, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin2, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin3, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin4, wpi.LOW);
      break;
      case 2:  //0101
        wpi.digitalWrite(thisModule.motorPin1, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin2, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin3, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin4, wpi.HIGH);
      break;
      case 3:  //1001
        wpi.digitalWrite(thisModule.motorPin1, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin2, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin3, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin4, wpi.HIGH);
      break;
    }
  }
  else if (thisModule.pinCount == 5) {
    switch (thisStep % 10) {
      case 0:  // 01101
        wpi.digitalWrite(thisModule.motorPin1, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin2, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin3, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin4, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin5, wpi.HIGH);
        break;
      case 1:  // 01001
        wpi.digitalWrite(thisModule.motorPin1, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin2, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin3, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin4, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin5, wpi.HIGH);
        break;
      case 2:  // 01011
        wpi.digitalWrite(thisModule.motorPin1, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin2, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin3, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin4, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin5, wpi.HIGH);
        break;
      case 3:  // 01010
        wpi.digitalWrite(thisModule.motorPin1, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin2, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin3, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin4, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin5, wpi.LOW);
        break;
      case 4:  // 11010
        wpi.digitalWrite(thisModule.motorPin1, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin2, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin3, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin4, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin5, wpi.LOW);
        break;
      case 5:  // 10010
        wpi.digitalWrite(thisModule.motorPin1, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin2, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin3, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin4, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin5, wpi.LOW);
        break;
      case 6:  // 10110
        wpi.digitalWrite(thisModule.motorPin1, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin2, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin3, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin4, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin5, wpi.LOW);
        break;
      case 7:  // 10100
        wpi.digitalWrite(thisModule.motorPin1, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin2, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin3, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin4, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin5, wpi.LOW);
        break;
      case 8:  // 10101
        wpi.digitalWrite(thisModule.motorPin1, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin2, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin3, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin4, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin5, wpi.HIGH);
        break;
      case 9:  // 00101
        wpi.digitalWrite(thisModule.motorPin1, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin2, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin3, wpi.HIGH);
        wpi.digitalWrite(thisModule.motorPin4, wpi.LOW);
        wpi.digitalWrite(thisModule.motorPin5, wpi.HIGH);
        break;
    }
  }
} // End of stepMotor
// End of file