#!/usr/bin/env python3
import sys
import time

from py_mqtt_client import MQTTclient  #importing class MQTTclient 

qos=0
retain=1
print ("Enter the portno for publisher")
portno_value=input(">")

port=int(portno_value)
clean_session=0
mypublisher_client1=MQTTclient("publisherclient1",port,40,"localhost",clear_session=clean_session,rootcert='root.crt',device_cert='client.crt',device_key='client.key')
mypublisher_client1.set_tls(1)
if not mypublisher_client1.connect():
	print ("Error while connecting")
	sys.exit(0)



mypublisher_client1.subscribe("mytopic",qos)


mypublisher_client1.publish("mytopic","hello I am publisher1",retain,qos)

	
time.sleep(2)

mypublisher_client1.disconnect()
