#!/bin/bash

# @Bevywise.com IOT Initiative. All rights reserved 
# www.bevywise.com Email - support@bevywise.com
#
# Shell script to start the simulator. The simulator will start based on the port 
# specified in the <Product_home>/conf/db.conf file.  

# Moving to the PRODUCT_HOME

cd ..

# Setting up the path required 

export PATH=.:lib:bin:python:$PATH

# Starting the Simulator

lib/Simulator "$@"
