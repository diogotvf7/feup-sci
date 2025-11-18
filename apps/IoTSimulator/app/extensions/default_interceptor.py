#!/usr/bin/env python2.7
#################################################################
# @Bevywise.com IOT Initiative. All rights reserved 
# www.bevywise.com Email - support@bevywise.com
#
#    default_interceptor.py
#
# The interceptor can be enabled using the setting dialog on the
# simulator UI. By default this file is called. If you want to change
# the file, make sure the method def intercept(client , topic, data)
# is implemented.  
# 
# The method intercept(MQTTclient<Client Object> , Topic , Data) 
# is called whenever any of the clients receive a message. Using 
# the client object you will be able to do the following. 
#
# Publish a message specifying the topic and data for this particular
# client. QoS and Retain are optional can be specified if needed. 
# default Qos will be 0 and retain will be 1
#
# 	MQTTclient<Object>.publish(Topic , Data , retain, Qos )
#
# Subscribe to a new topic by specifying topic and the Qos. 
# QoS is optional and the defualt is 0. 
#
# 	MQTTclient<Object>.subscribe(Topic ,  Qos )
#
# Unsubscribe to a topic.  
#
# 	MQTTclient<Object>.unsubscribe(Topic) 
##################################################################

#importing class MQTTclient 

from py_mqtt_client import MQTTclient  

#intercept function name should not be changed
def intercept(client,topic_name,data):
	print ("\n Interceptor running\n client id: {0} Received Msg: {1} from Topic: {2}\n".format(client.get_clientid(),data,topic_name))
	return True #<----Return true if request responce file need to executed


#def on_before_send()
def on_before_send(client,topic_name,data):

	print("#########################   Intercept   #################")
	print(client,topic_name,data)

	encoded_data = "Bevywise_data" #you can encrypt the data here

	return client,topic_name,encoded_data #return clientid,topic,encoded_data 