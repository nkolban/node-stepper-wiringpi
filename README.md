# stepper-wiringpi

Control a stepper motor from the Raspberry Pi.

## Install
The package can be installed using `npm`.

```
$ npm install stepper-wiringpi
```

## Usage
The class controls a stepper motor.  It has a number of core capabilities that are motor related.  First we have the
notion of the rotation speed.  This is measured in rotations per minute (RPM) and is adjusted with the call to:

```
motor.setSpeed(60);
```

which would set the RPM of the motor to one rotation a second.  Setting the speed doesn't actually cause the motor to
turn.  We would then call one of the direction functions which are:

```
motor.forward();
```

and

```
motor.backward();
```

Calling either of these starts the motor turning at the currently set speed.  If we change the speed while the motor is
rotating, it will change the rate of rotation.

If we wish to stop a motor from turning, we can call:

```
motor.stop();
```

We do not have to stop a motor before changing direction.  We can choose to call:
```
motor.forward();
motor.backward();
```

There is a second mode of operation where we can specify an exact number of steps to turn and the motor will rotate
those steps at the current speed.

```
motor.step(10);
```

will rotate the motor forwards 10 steps while

```
motor.step(-10);
```

the `step` function has an additional optional parameter which is a callback function that is invoked when the steps have been made.

will rotate the motor backwards 10 steps.

To mechanically use the package, first we include the package with a call to `require` naming the package we wish to include.

```
var StepperWiringPi = require("stepper-wiringpi");
```

From here, we can create instances of a stepper motor driver using:

```
var motor = StepperWiringPi.setup(stepsInRevolution, pin1, pin2, pin3, pin4);
```

The object returned is an instance of a motor that can be driven.

To support multiple stepper motor physical types, the package supports 2, 4 and 5 wire interfaces.  The choice of which type is used
is specified by the number of pins supplied in the `setup` call.

In summary, the methods are:

| Method                                                       | Description                |
|--------------------------------------------------------------|----------------------------|
| `setup(stepsInRevolution, pin1, pin2, [pin3, pin4, [pin5]])` | Setup the motor            |
| `setSpeed(rpm)`                                              | Set the speed of rotation  |
| `forward()`                                                  | Start rotating forwards    |
| `backward()`                                                 | Start rotating backwards   |
| `stop()`                                                     | Stop rotating              |
| `step(steps, [callback])`                                    | Step the motor             |
| `halt()`                                                     | Halt the motor (free turn) |

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

