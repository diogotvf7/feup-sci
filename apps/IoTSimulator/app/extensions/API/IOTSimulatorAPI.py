import sys
import requests
import json
import os
import ConfigParser

dbconfParser = ConfigParser.RawConfigParser()  
global server
server='127.0.0.1'
global port
port='9000'
global network_chosen
network_chosen=''

def check_special(s):
    string=""  
    for e in s:
	if (e.isalnum()):
		string=string+e
	elif ((e=="/") or (e=="_") or (e==" ") or (e=="")) :
		string=string+e
	else:
		string="reject@wronginput"
		break
    return string



try:

	dbconfPath = r'api.conf'
	dbconfParser.read(dbconfPath)
	port = dbconfParser.get('CONFIG','API_PORT')
	server = dbconfParser.get('CONFIG','SERVER_IP')
except Exception as e:
	print 'Check whether api.conf is available in API folder'




def addDevice(deviceID , devicename, username='', password='', clean_session=0,will_flag=0,willtopic="",willmessage="",willqos=1,willretain=0):

	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'

		if (check_special(deviceID)=="reject@wronginput"):
			return '{"Status":"Invalid DeviceID"}'
		if (check_special(devicename)=="reject@wronginput"):
			return '{"Status":"Invalid Device name"}'
		if deviceID=="" or devicename=="":
			return '{"Status":"Device ID / Name cannot be empty"}'
		if (will_flag==1):
			if (willtopic=="" or willmessage==""):
				return '{"Status":"Will Topic/Message cannot be empty"}'
			elif (check_special(willtopic)=="reject@wronginput") or (check_special(willmessage)=="reject@wronginput"):
				return '{"Status":"Invalid Will Topic/Message"}'
		url="http://"+server+":"+port+"/api/addclient"  
		headers = {'content-type': 'application/json'}
		data={'device_id' : deviceID , 'description':devicename, 'clean_session':clean_session,'will_flag':will_flag,'willtopic':willtopic,'willmessage':willmessage,'willqos':willqos,'willretain':willretain,'username':username, 'password':password,'network_chosen':network_chosen }		 
		params="{}"
		response = requests.post(url,params=data,headers=headers)
		return response.text

	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'

	except Exception as e:
		pass



def removeDevice(deviceID):
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'

		if (check_special(deviceID)=="reject@wronginput"):
			return '{"Status":"Invalid DeviceID"}'
		if deviceID=="":
			return '{"Status":"DeviceID cannot be empty"}'

		url="http://"+server+":"+port+"/api/get/removeclient?device_id="+deviceID+"&network_chosen="+network_chosen
		response = requests.get(url)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the simulator"}'


	except Exception as e:
		return '{"Status":"Device cannot be removed"}'



def getNetworkList():
	try:
		url="http://"+server+":"+port+"/api/get/networklist"  
		response = requests.get(url)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the simulator"}'
	except Exception as e:
		pass

def startNetwork():
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'
		url="http://"+server+":"+port+"/api/get/startalldevices?network_chosen="+network_chosen
		response = requests.get(url)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the simulator"}'
	except Exception as e:
		pass


def getNetworkStatus():
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'
		url="http://"+server+":"+port+"/api/get/networkstatus?network_chosen="+network_chosen
		response = requests.get(url)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the simulator"}'
	except Exception as e:
		pass



def stopNetwork():
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'
		url="http://"+server+":"+port+"/api/get/stopalldevices?network_chosen="+network_chosen
		response = requests.get(url)
		network_chosen=''
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the simulator"}'

	except Exception as e:
		pass


def chooseNetwork(networkname):
	try:
		if (check_special(networkname)=="reject@wronginput"):
			return '{"Status":"Invalid network name"}'
		if networkname=="":
			return '{"Status":"Network name cannot be empty"}'
		global network_chosen
		if network_chosen==networkname:
			return '{"Network_name":"'+network_chosen+'","Status":"Network is already chosen"}'
		if network_chosen!='':
			return '{"Status":"Network '+network_chosen+' has to be stopped before choosing another network"}'
		url="http://"+server+":"+port+"/api/get/setnetwork?network_chosen="+networkname  
		response = requests.get(url)
		m=response.text.find('not chosen')
		if m==-1:
			network_chosen=networkname
		return response.text
	except requests.exceptions.ConnectionError as e:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the simulator"}'

	except Exception as e:
		return '{"Status":"Network cannot be chosen"}'

def getDevicesList():
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'
		url="http://"+server+":"+port+"/api/get/deviceslist?network_chosen="+network_chosen  
		response = requests.get(url)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the simulator"}'

	except Exception as e:
		return '{"Status":"Parameter Error"}'



def getDeviceDetails(deviceID):
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'

		if (check_special(deviceID)=="reject@wronginput"):
			return '{"Status":"Invalid DeviceID"}'
		if deviceID=="":
			return '{"Status":"DeviceID cannot be empty"}'

		url="http://"+server+":"+port+"/api/get/devicedetails?device_id="+deviceID+"&network_chosen="+network_chosen
		response = requests.get(url)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the simulator"}'

	except Exception as e:
		pass


def stopEvent(event_id):
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'
		if event_id<=0:
			return '{"Status":"Invalid Event ID"}'

		url="http://"+server+":"+port+"/api/get/stopevent?network_chosen="+network_chosen+"&event_id="+str(event_id)
		response = requests.get(url)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'

	except Exception as e:
		pass


def resumeEvent(event_id):
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'
		if event_id<=0:
			return '{"Status":"Invalid Event ID"}'

		url="http://"+server+":"+port+"/api/get/resumeevent?network_chosen="+network_chosen+"&event_id="+str(event_id)
		response = requests.get(url)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'

	except Exception as e:
		pass

def startDevice(deviceID):
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'
		if deviceID=='':
			return '{"Status":"DeviceID could not be empty"}'

		url="http://"+server+":"+port+"/api/get/startdevice?network_chosen="+network_chosen+"&device_id="+deviceID
		response = requests.get(url)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'


	except Exception as e:
		pass


def stopDevice(deviceID):
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'
		if deviceID=='':
			return '{"Status":"DeviceID could not be empty"}'

		url="http://"+server+":"+port+"/api/get/stopdevice?network_chosen="+network_chosen+"&device_id="+deviceID
		response = requests.get(url)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'

	except Exception as e:
		pass


def getSubscriptionDetails(deviceID):
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'
		if deviceID=='':
			return '{"Status":"DeviceID could not be empty"}'

		if (check_special(deviceID)=="reject@wronginput"):
			return '{"Status":"Invalid DeviceID"}'


		url="http://"+server+":"+port+"/api/get/subscribedetails?device_id="+deviceID+"&network_chosen="+network_chosen  
		response = requests.get(url)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'


	except Exception as e:
		pass


def addResponseforRequest(deviceID,request_topic,request_message,response_topic,response_message,qos=0,retain=0):

	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'

		if (check_special(deviceID)=="reject@wronginput"):
			return '{"Status":"Invalid DeviceID"}'
		if (check_special(request_topic)=="reject@wronginput"):
			return '{"Status":"Invalid Command Topic"}'
		if (check_special(response_topic)=="reject@wronginput"):
			return '{"Status":"Invalid Event Topic"}'

		try:
			qos=int(qos)
			if (qos<0 or qos>2):
				return '{"Status":"Invalid QoS"}'
		except:
			return '{"Status":"Invalid QoS"}'
		try:
			retain=int(retain)
			if (retain<0 or qos>1):
				return '{"Status":"Invalid Retain"}'
		except:
			return '{"Status":"Invalid Retain"}'

		if deviceID=="" or request_topic=="" or request_message=="" or response_topic=="" or response_message=="":
			return '{"Status":"Parameter cannot be empty"}'


		url="http://"+server+":"+port+"/api/addresponse"  
		headers = {'content-type': 'application/json'}
		data={ 'device_id' : deviceID , 'event_topic' : request_topic, 'event_data' : request_message, 'command_topic' : response_topic, 'command_data' : response_message, 'qos' : qos, 'retain':retain, 'network_chosen':network_chosen}
		params="{}"
		response = requests.post(url, params=data, headers=headers)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'

	except Exception as e:
		return '{"Status":"Parameter mismatch"}'




def addNewSubscribe(deviceID, topic,qos=0):

	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'

		if (check_special(deviceID)=="reject@wronginput"):
			return '{"Status":"Invalid DeviceID"}'

		if (check_special(topic)=="reject@wronginput"):
			return '{"Status":"Invalid Topic"}'
		try:
			qos=int(qos)
			if (qos<0 or qos>2):
				return '{"Status":"Invalid QoS"}'
		except:
			return '{"Status":"Invalid QoS"}'
		if deviceID=="" or topic=="":
			return '{"Status":"DeviceID / Topic cannot be empty"}'


		url="http://"+server+":"+port+"/api/addsubscribe"  
		headers = {'content-type': 'application/json'}
		data={'device_id' : deviceID ,'topic' : topic,  'qos' : qos, 'network_chosen': network_chosen }
		params="{}"
		response = requests.post(url, params=data, headers=headers)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the simulator"}'

	except Exception as e:
		return '{"Status":"Invalid Parameter list"}'



def removePublishMessage(deviceID, topic=""):
	
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'

		if (check_special(deviceID)=="reject@wronginput"):
			return '{"Status":"Invalid DeviceID"}'

		if deviceID=="":
			return '{"Status":"DeviceID cannot be empty"}'


		if (topic==""):
			url="http://"+server+":"+port+"/api/removeallpublish"
		else:
			url="http://"+server+":"+port+"/api/removepublish"
		headers = {'content-type': 'application/json'}
		data={'device_id' : deviceID , 'topic' : topic, 'network_chosen' : network_chosen }
		params="{}"
		response = requests.post(url, params=data, headers=headers)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'

	except Exception as e:
		return '{"Status":"Parameter mismatch"}'


def removeSubscribe(deviceID, topic=""):

	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'

		if (check_special(deviceID)=="reject@wronginput"):
			return '{"Status":"Invalid DeviceID"}'

		if deviceID=="":
			return '{"Status":"DeviceID cannot be empty"}'


		if (topic==""):
			url="http://"+server+":"+port+"/api/removeallsubscribe"
		else:
			url="http://"+server+":"+port+"/api/removesubscribe"
		headers = {'content-type': 'application/json'}
		data={'device_id' : deviceID , 'topic' : topic , 'network_chosen' : network_chosen}
		params="{}"
		response = requests.post(url, params=data, headers=headers)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'

	except Exception as e:
		return '{"Status":"Parameter mismatch"}'


def removeResponseforRequest(deviceID,req_topic=""):
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'

		if (check_special(deviceID)=="reject@wronginput"):
			return '{"Status":"Invalid DeviceID"}'

		if deviceID=="":
			return '{"Status":"DeviceID cannot be empty"}'


		if (req_topic==""):
			url="http://"+server+":"+port+"/api/removeallresponse"
		else:
			url="http://"+server+":"+port+"/api/removeresponse"
		headers = {'content-type': 'application/json'}
		data={'device_id' : deviceID , 'event_topic' : req_topic , 'network_chosen' : network_chosen}
		params="{}"
		response = requests.post(url, params=data, headers=headers)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'

	except Exception as e:
		return '{"Status":"Parameter mismatch"}'



def unsubscribe(deviceID, topic):
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'

		if (check_special(deviceID)=="reject@wronginput"):
			return '{"Status":"Invalid DeviceID"}'

		if deviceID=="" or topic=="":
			return '{"Status":"DeviceID / Topic cannot be empty"}'

		url="http://"+server+":"+port+"/api/unsubscribe"
		headers = {'content-type': 'application/json'}
		data={'device_id' : deviceID , 'topic' : topic , 'network_chosen' : network_chosen}
		params="{}"
		response = requests.post(url, params=data, headers=headers)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'
	except Exception as e:
		return '{"Status":"Parameter mismatch"}'


def unsubscribeAll():
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'

		url="http://"+server+":"+port+"/api/unsubscribeall"
		headers = {'content-type': 'application/json'}
		data={'network_chosen' : network_chosen}		 
		params="{}"
		response = requests.post(url, params=data, headers=headers)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'
	except Exception as e:
		return '{"Status":"Parameter mismatch"}'




def subscribe(deviceID="",topic="",qos=0,addtodb="false"):
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'

		if (deviceID=="" and topic=="" and qos==0 and addtodb=="false"):
			url="http://"+server+":"+port+"/api/subscribe"	
			headers = {'content-type': 'application/json'}	
			data={'network_chosen' : network_chosen }
			response = requests.post(url,params=data,headers=headers)
		else:
			deviceID = deviceID.strip()
			if len(deviceID) > 0:
				if len(topic.strip()) == 0:
					return '{"Status":"Topic cannot be empty"}'

			if (check_special(deviceID)=="reject@wronginput"):
				return '{"Status":"Invalid DeviceID"}'

			try:
				qos=int(qos)
				if (qos<0 or qos>2):
					return '{"Status":"Invalid QoS"}'
			except:
				return '{"Status":"Invalid QoS"}'


			url="http://"+server+":"+port+"/api/subscribeclient"
			headers = {'content-type': 'application/json'}	
			data={'device_id' : deviceID , 'topic' : topic ,'qos':qos,'addtodb':addtodb, 'network_chosen' : network_chosen}
			params="{}"
			response = requests.post(url, params=data, headers=headers)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'

	except Exception as e:
		pass


def publish(deviceID, topic, message,qos=0,retain=1):
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'
		if deviceID=='' or topic=='' or message=='':
			return '{"Status":"DeviceID / Topic / Message could not be empty"}'
		if (check_special(deviceID)=="reject@wronginput"):
			return '{"Status":"Invalid DeviceID"}'

		if (check_special(topic)=="reject@wronginput"):
			return '{"Status":"Invalid topic"}'
		try:
			qos=int(qos)
			if (qos<0 or qos>2):
				return '{"Status":"Invalid QoS"}'
		except Exception as e:
			return '{"Status":"Invalid QoS"}'
		try:
			retain=int(retain)
			if (retain<0 or retain>1):
				return '{"Status":"Invalid Retain"}'
		except Exception as e:
			return '{"Status":"Invalid Retain"}'
		
		url="http://"+server+":"+port+"/api/publishclient"
		headers = {'content-type': 'application/json'}
		data={'device_id' : deviceID , 'topic' : topic,'message':message,'qos': qos,'retain':retain,'network_chosen':network_chosen}
		params="{}"
		response = requests.post(url, params=data, headers=headers)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'
	except Exception as e:
		pass

def publish_with_error(deviceID, topic, message,qos=0,retain=1):
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'
		if deviceID=='' or topic=='' or message=='':
			return '{"Status":"DeviceID / Topic / Message could not be empty"}'
		if (check_special(deviceID)=="reject@wronginput"):
			return '{"Status":"Invalid DeviceID"}'

		if (check_special(topic)=="reject@wronginput"):
			return '{"Status":"Invalid topic"}'
		try:
			qos=int(qos)
			if (qos<0 or qos>2):
				return '{"Status":"Invalid QoS"}'
		except Exception as e:
			return '{"Status":"Invalid QoS"}'
		try:
			retain=int(retain)
			if (retain<0 or retain>1):
				return '{"Status":"Invalid Retain"}'
		except Exception as e:
			return '{"Status":"Invalid Retain"}'
		
		url="http://"+server+":"+port+"/api/publishclient_with_corruption"
		headers = {'content-type': 'application/json'}
		data={'device_id' : deviceID , 'topic' : topic,'message':message,'qos': qos,'retain':retain,'network_chosen':network_chosen}
		params="{}"
		response = requests.post(url, params=data, headers=headers)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'
	except Exception as e:
		pass

def stopBehaviorSimulation(deviceID,request_topic):
	try:
		global network_chosen
		if network_chosen=='':
			return '{"Status":"Network is not chosen"}'

		if (check_special(deviceID)=="reject@wronginput"):
			return '{"Status":"Invalid DeviceID"}'

		if deviceID=="" or request_topic=="":
			return '{"Status":"DeviceID / Topic could not be empty"}'


		url="http://"+server+":"+port+"/api/stopres"
		headers = {'content-type': 'application/json'}
		data={'device_id':deviceID,'event_topic' : request_topic, 'network_chosen':network_chosen}
		params="{}"
		response = requests.post(url, params=data, headers=headers)
		return response.text
	except requests.exceptions.ConnectionError:
		return '{"Status":"Unable to connect with Port '+port+'. Please restart the Simulator"}'
	except Exception as e:
		return '{"Status":"Unable to stop the behaviour pattern"}'


