#!/usr/bin/env python3
import sys
import time

from py_mqtt_client import MQTTclient  #importing class MQTTclient 

qos=0
retain=1
print ("Enter the portno for publisher")
portno_value=input(">")

port=int(portno_value)

mypublisher_client1=MQTTclient("clientid",portno=1883,timeout=40,hostname="localhost")
if not mypublisher_client1.connect():
	print ("Error while connecting")
	sys.exit(0)



mypublisher_client1.subscribe("mytopic",qos)


i = 0
while 1:
    i+=1
    message = '{"Sensor_value":{"Explosive_gas":"5-10-RANGE","GasLeakage_percent":"10-20-RANGE","GasLeakage_Kitchen":"Yes|No-RANDOM","Harmful_gas":"1-5-RANGE"},"Sensor_details":{"Current_Time":"$Current_time-SYSTEMVARIABLE","Client_Name":"Gas_Sensor-CONSTANT","Sensor_Status":"On|Off-RANDOM","Client_ID":"$Client_ID-SYSTEMVARIABLE","Client_UpTime":"$Client_uptime-SYSTEMVARIABLE"}}'*i
    mypublisher_client1.publish("mytopic",message,retain,qos)
    time.sleep(1)
	
time.sleep(2)

mypublisher_client1.disconnect()
