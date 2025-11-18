#!/usr/bin/env python3

import py_mqtt_client
import sys

print ("Enter the portno for publisher")
portno=input(">")

print ("Enter the IP of mqtt broker (127.0.0.1) ")
ip=input(">")

clientid="BWMQTTClient"
portno_value=int(portno)
timeout=60
ip_value=str(ip)
clean_session=0
username=""
password=""
willflag=True
willqos=0
willretain=True
willtopic="home/room_temp"
willmessage="temp 27"
Client=py_mqtt_client.MQTTclient(clientid,portno_value,timeout,ip_value,clear_session=clean_session,username=username,password=password,willflag=willflag,willqos=willqos,willretain=willretain,willtopic=willtopic,willmessage=willmessage)
Client.connect()
Client.disconnect()

