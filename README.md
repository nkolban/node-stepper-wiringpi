# stepper-wiringpi

Control a stepper motor from the Raspberry Pi.

## Install
The package can be installed using `npm`.

```
$ npm install stepper-wiringpi
```

## Usage
First we include the package with a call to `require` naming the package we wish to include.

```
var StepperWiringPi = require("stepper-wiringpi");
```

From here, we can create instances of a stepper motor driver using:

```
var motor = StepperWiringPi.setup(numberOfSteps, pin1, pin2, pin3, pin4);
```

The object returned is an instance of a motor that can be driven.  To have the motor execute a turn of some steps
we can call the `step` function which takes as a parameter the number of steps to rotate.  A positive value rotates
in one direction while a negative value rotates in the opposite direction.  An additional optional parameter can be
supplied which is a callback function that will be invoked when the movement of the steps has been completed.

The speed of rotation can be specified in revolutions per minute (RPM) by calling the function `setSpeed`.  This should be
set prior to asking for steps to be moved.

For example:

```
motor.setSpeed(5);
motor.step(5);
```

To adhere to the asynchronous nature of JavaScript, a call to `step` does not block waiting for the steps to complete. 

To support multiple stepper motor physical types, the package supports 2, 4 and 5 wire interfaces.  The choice of which type is used
is specified by the number of pins supplied in the `setup` call.

## Dependencies
This package depends upon:

* [Wiring-Pi](https://github.com/eugeneware/wiring-pi) - Node.js binding to wiringPi


## Design Notes
This package is a port of the Arduino Stepper library to Node.js and the Node.js WiringPi package.  Re-designs were
made to include support for JavaScript oriented usage such as non-blocking.  The original Arduino stepper
library can be found here:

[https://github.com/arduino/Arduino/tree/master/libraries/Stepper](https://github.com/arduino/Arduino/tree/master/libraries/Stepper)

It is anticipated that one use of this package will be to control wheeled robots.  Because of this, it will likely be necessary to support
multiple instances of the class, one per motor. 

Given that each motor requires 2, 4 or 5 discrete GPIO pins, we can see that we will quickly run out of available pins on todays current
devices.  For example, for a 2 wheeled robot using 4 pin stepper motors, we will immediately consume 8 GPIOs.  This leads us to believe that
we may very well need to include support for popular GPIO expanders.  An idea/issue has been raised with the Wiring-Pi project for
Node.js to investigate the addition of that support into the base Wiring-Pi package which is where we believe it should be implemented.

