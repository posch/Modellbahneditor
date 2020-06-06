#!/usr/bin/python3

def usage():
    print("usage: arc x y d ar aa ac")
    print("")
    print("x y - current position")
    print("d   - current direction (degrees)")
    print("ar  - arc radius")
    print("aa  - arc angle")
    print("ad  - arc direction: clockwise (-1) or counter-clockwise (+1)")
    print("")
    exit(1)

import sys
import math
from math import cos,pi,sin

def pos(x, y):
    return [x,y]

def transa(a, l, v):
    return [ l*cos(a) + v[0],
             l*sin(a) + v[1] ]

def transd(dx, dy, v):
    return [ v[0] + dx,
             v[1] + dy ]

def roto(a, v):
    return [ cos(a)*v[0] - sin(a)*v[1],
             sin(a)*v[0] + cos(a)*v[1] ]

def rot(c, a, v):
    return transd(c[0], c[1], roto(a, transd(-c[0], -c[1], v)))

def deg2rad(deg):
    return pi*deg/180


if len(sys.argv) != 7:
    usage()

# starting point
v = pos(float(sys.argv[1]), float(sys.argv[2]))
print("v", v)

# starting direction
d = deg2rad(float(sys.argv[3]))
print("d", d)

# arc radius
ar = float(sys.argv[4])
print("ar", ar)

# arc angle
aa = deg2rad(float(sys.argv[5]))
print("aa", aa)

# arc direction
ad = 1 if float(sys.argv[6]) >= 0 else -1
print("ad", ad)

# ac - arc center
ac = transa(d + ad*pi/2, ar, v)
print("ac", ac)

# rotate around arc center
w = rot(ac, ad*aa, v)
print("w", w)



