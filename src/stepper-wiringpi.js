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
var FORWARD = 1;
var BACKWARD = -1;
exports.FORWARD = FORWARD;
exports.BACKWARD = BACKWARD;

function setup2Wire(motorPin1, motorPin2)
{
  // Pi pins for the motor control connection:
  this._motorPin1 = motorPin1;
  this._motorPin2 = motorPin2;

  // setup the pins on the Pi:
  wpi.pinMode(this._motorPin1, wpi.OUTPUT);
  wpi.pinMode(this._motorPin2, wpi.OUTPUT);

  // When there are only 2 pins, set the others to 0:
  this._motorPin3 = 0;
  this._motorPin4 = 0;
  this._motorPin5 = 0;

  // pin_count is used by the stepMotor() method:
  this._pinCount = 2;
} // End of setup2Wire


function setup4Wire(motorPin1, motorPin2, motorPin3, motorPin4)
{ 
  // Pi pins for the motor control connection:
  this._motorPin1 = motorPin1;
  this._motorPin2 = motorPin2;
  this._motorPin3 = motorPin3;
  this._motorPin4 = motorPin4;
  
  // setup the pins on the pi:
  wpi.pinMode(this._motorPin1, wpi.OUTPUT);
  wpi.pinMode(this._motorPin2, wpi.OUTPUT);
  wpi.pinMode(this._motorPin3, wpi.OUTPUT);
  wpi.pinMode(this._motorPin4, wpi.OUTPUT);
  
  // When there are 4 pins, set the others to 0:
  this._motorPin5 = 0;
  
  // pin_count is used by the stepMotor() method:
  this._pinCount = 4;
} // End of setup4Wire


function setup5Wire(motorPin1, motorPin2, motorPin3, motorPin4, motorPin5)
{ 
  // Pi pins for the motor control connection:
  this._motorPin1 = motorPin1;
  this._motorPin2 = motorPin2;
  this._motorPin3 = motorPin3;
  this._motorPin4 = motorPin4;
  this._motorPin5 = motorPin5;
  
  // setup the pins on the Pi:
  wpi.pinMode(this._motorPin1, wpi.OUTPUT);
  wpi.pinMode(this._motorPin2, wpi.OUTPUT);
  wpi.pinMode(this._motorPin3, wpi.OUTPUT);
  wpi.pinMode(this._motorPin4, wpi.OUTPUT);
  wpi.pinMode(this._motorPin5, wpi.OUTPUT);
  
  // pin_count is used by the stepMotor() method:
  this._pinCount = 5;
} // End of setup5Wire

/**
 * Setup the object for usage.
 */
exports.setup = function(stepsPerRevolution, motorPin1, motorPin2, motorPin3, motorPin4, motorPin5) {
  var context = {
    // Export the functions
    step: step, // Function
    setSpeed: setSpeed, // Function
    forward: forward, // Function
    backward: backward, // Function
    stop: stop, // Function
    
    _stepDelay: 60*1000/stepsPerRevolution, // Set the default step delay to 1 rpm.
    _stepNumber: 0, // Which step the motor is on.
    _direction: 0, // Motor direction.
    _timerId: null,
    _moveTimeoutId: null,
    _stepsPerRevolution: stepsPerRevolution // Total number of steps for this motor.
  }
  // Determine whether we are being called with 2,4 or 5 pins and setup accordingly.
  if (motorPin3 == undefined) {
    setup2Wire.call(context, motorPin1, motorPin2);
  } else if (motorPin5 == undefined) {
    setup4Wire.call(context, motorPin1, motorPin2, motorPin3, motorPin4);
  } else {
    setup5Wire.call(context, motorPin1, motorPin2, motorPin3, motorPin4, motorPin5);
  }
  return context;
} // End of setup


/**
 * Sets the speed in revs per minute
 */
function setSpeed(desiredRPM)
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
  var maxRPM = 60 * 1000 / this._stepsPerRevolution;
  if (desiredRPM > maxRPM) {
    desiredRPM = maxRPM;
  }
  this._stepDelay = maxRPM / desiredRPM;
} // End of setSpeed

//PUBLIC: Set the motor to rotate forwards at the current set speed.
function forward() {
  stop.call(this);
  move.call(this, FORWARD);
}

// PUBLIC: Set the motor to rotate backwards at the current set speed.
function backward() {
  stop.call(this);
  move.call(this, BACKWARD);
}

// PRIVATE: Setup for continuous rotation at given speed.
function move(direction) {
  //console.log("move: %j", this);
  if (direction == FORWARD) {
    this._stepNumber++;
  } else {
    this._stepNumber--;
  }
  //console.log("Step number: %d", this._stepNumber);
  stepMotor.call(this, this._stepNumber);
  this._moveTimeoutId = setTimeout(move.bind(this), this._stepDelay, direction);
}

// PUBLIC: Stop any continuous movement.
function stop() {
  if (this._moveTimeout != null) {
    clearTimeout(this._moveTimeout);
    this._moveTimeout=null;
  }
}

/**
 * Moves the motor stepsToMove steps.  If the number is negative,
 * the motor moves in the reverse direction.  The optional callback
 * function will be invoked when the number of steps being asked to
 * be moved have been moved.
 */
function step(stepsToMove, callback)
{
  // Handle the case where the user asks to move 0 steps.
  if (stepsToMove == 0) {
    if (callback != null) {
      callback();
    }
    return;
  }
  var stepsLeft = Math.abs(stepsToMove);  // how many steps to take

  // determine direction based on whether stepsToMove is + or -:
  if (stepsToMove > 0) { this._direction = 1; }
  if (stepsToMove < 0) { this._direction = 0; }
  
  // If we should already be in the middle of a movement, cancel it.
  if (this._timerId != null) {
    clearInterval(this._timerId);
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
  this._timerId = setInterval(function()
  {
    // increment or decrement the step number, depending on direction:
    if (this._direction == 1)
    {
      this._stepNumber++;
      if (this._stepNumber == this._stepsPerRevolution) {
        this._stepNumber = 0;
      }
    }
    else
    {
      if (this._stepNumber == 0) {
        this._stepNumber = this._stepsPerRevolution;
      }
      this._stepNumber--;
    }

    // step the motor to step number 0, 1, ..., {3 or 10}
    stepMotor.call(this, this._stepNumber);
    
    // Decrement the steps left to move.  If we have moved the correct number
    // of steps, cancel the timer as there is no need to move anymore.
    stepsLeft--;
    if (stepsLeft <= 0) {
      clearInterval(this._timerId);
      this._timerId = null;
      if (callback != null) {
        callback();
      }
    } // End of stepsLeft == 0
  }.bind(this), this._stepDelay); // End of setInterval
} // End of step


/*
 * Moves the motor forward or backwards.
 */
function stepMotor(thisStep)
{
  thisStep = Math.abs(thisStep);
  //console.log("Step: %d, mod4=%d, pinCount=%d", thisStep, thisStep%4, this._pinCount);

  if (this._pinCount == 2) {
    switch (thisStep % 4) {
      case 0:  // 01
        wpi.digitalWrite(this._motorPin1, wpi.LOW);
        wpi.digitalWrite(this._motorPin2, wpi.HIGH);
      break;
      case 1:  // 11
        wpi.digitalWrite(this._motorPin1, wpi.HIGH);
        wpi.digitalWrite(this._motorPin2, wpi.HIGH);
      break;
      case 2:  // 10
        wpi.digitalWrite(this._motorPin1, wpi.HIGH);
        wpi.digitalWrite(this._motorPin2, wpi.LOW);
      break;
      case 3:  // 00
        wpi.digitalWrite(this._motorPin1, wpi.LOW);
        wpi.digitalWrite(this._motorPin2, wpi.LOW);
      break;
    }
  }
  else if (this._pinCount == 4) {
    switch (thisStep % 4) {
      case 0:  // 1010
        wpi.digitalWrite(this._motorPin1, wpi.HIGH);
        wpi.digitalWrite(this._motorPin2, wpi.LOW);
        wpi.digitalWrite(this._motorPin3, wpi.HIGH);
        wpi.digitalWrite(this._motorPin4, wpi.LOW);
      break;
      case 1:  // 0110
        wpi.digitalWrite(this._motorPin1, wpi.LOW);
        wpi.digitalWrite(this._motorPin2, wpi.HIGH);
        wpi.digitalWrite(this._motorPin3, wpi.HIGH);
        wpi.digitalWrite(this._motorPin4, wpi.LOW);
      break;
      case 2:  //0101
        wpi.digitalWrite(this._motorPin1, wpi.LOW);
        wpi.digitalWrite(this._motorPin2, wpi.HIGH);
        wpi.digitalWrite(this._motorPin3, wpi.LOW);
        wpi.digitalWrite(this._motorPin4, wpi.HIGH);
      break;
      case 3:  //1001
        wpi.digitalWrite(this._motorPin1, wpi.HIGH);
        wpi.digitalWrite(this._motorPin2, wpi.LOW);
        wpi.digitalWrite(this._motorPin3, wpi.LOW);
        wpi.digitalWrite(this._motorPin4, wpi.HIGH);
      break;
    }
  }
  else if (this._pinCount == 5) {
    switch (thisStep % 10) {
      case 0:  // 01101
        wpi.digitalWrite(this._motorPin1, wpi.LOW);
        wpi.digitalWrite(this._motorPin2, wpi.HIGH);
        wpi.digitalWrite(this._motorPin3, wpi.HIGH);
        wpi.digitalWrite(this._motorPin4, wpi.LOW);
        wpi.digitalWrite(this._motorPin5, wpi.HIGH);
        break;
      case 1:  // 01001
        wpi.digitalWrite(this._motorPin1, wpi.LOW);
        wpi.digitalWrite(this._motorPin2, wpi.HIGH);
        wpi.digitalWrite(this._motorPin3, wpi.LOW);
        wpi.digitalWrite(this._motorPin4, wpi.LOW);
        wpi.digitalWrite(this._motorPin5, wpi.HIGH);
        break;
      case 2:  // 01011
        wpi.digitalWrite(this._motorPin1, wpi.LOW);
        wpi.digitalWrite(this._motorPin2, wpi.HIGH);
        wpi.digitalWrite(this._motorPin3, wpi.LOW);
        wpi.digitalWrite(this._motorPin4, wpi.HIGH);
        wpi.digitalWrite(this._motorPin5, wpi.HIGH);
        break;
      case 3:  // 01010
        wpi.digitalWrite(this._motorPin1, wpi.LOW);
        wpi.digitalWrite(this._motorPin2, wpi.HIGH);
        wpi.digitalWrite(this._motorPin3, wpi.LOW);
        wpi.digitalWrite(this._motorPin4, wpi.HIGH);
        wpi.digitalWrite(this._motorPin5, wpi.LOW);
        break;
      case 4:  // 11010
        wpi.digitalWrite(this._motorPin1, wpi.HIGH);
        wpi.digitalWrite(this._motorPin2, wpi.HIGH);
        wpi.digitalWrite(this._motorPin3, wpi.LOW);
        wpi.digitalWrite(this._motorPin4, wpi.HIGH);
        wpi.digitalWrite(this._motorPin5, wpi.LOW);
        break;
      case 5:  // 10010
        wpi.digitalWrite(this._motorPin1, wpi.HIGH);
        wpi.digitalWrite(this._motorPin2, wpi.LOW);
        wpi.digitalWrite(this._motorPin3, wpi.LOW);
        wpi.digitalWrite(this._motorPin4, wpi.HIGH);
        wpi.digitalWrite(this._motorPin5, wpi.LOW);
        break;
      case 6:  // 10110
        wpi.digitalWrite(this._motorPin1, wpi.HIGH);
        wpi.digitalWrite(this._motorPin2, wpi.LOW);
        wpi.digitalWrite(this._motorPin3, wpi.HIGH);
        wpi.digitalWrite(this._motorPin4, wpi.HIGH);
        wpi.digitalWrite(this._motorPin5, wpi.LOW);
        break;
      case 7:  // 10100
        wpi.digitalWrite(this._motorPin1, wpi.HIGH);
        wpi.digitalWrite(this._motorPin2, wpi.LOW);
        wpi.digitalWrite(this._motorPin3, wpi.HIGH);
        wpi.digitalWrite(this._motorPin4, wpi.LOW);
        wpi.digitalWrite(this._motorPin5, wpi.LOW);
        break;
      case 8:  // 10101
        wpi.digitalWrite(this._motorPin1, wpi.HIGH);
        wpi.digitalWrite(this._motorPin2, wpi.LOW);
        wpi.digitalWrite(this._motorPin3, wpi.HIGH);
        wpi.digitalWrite(this._motorPin4, wpi.LOW);
        wpi.digitalWrite(this._motorPin5, wpi.HIGH);
        break;
      case 9:  // 00101
        wpi.digitalWrite(this._motorPin1, wpi.LOW);
        wpi.digitalWrite(this._motorPin2, wpi.LOW);
        wpi.digitalWrite(this._motorPin3, wpi.HIGH);
        wpi.digitalWrite(this._motorPin4, wpi.LOW);
        wpi.digitalWrite(this._motorPin5, wpi.HIGH);
        break;
    }
  }
} // End of stepMotor
// End of file