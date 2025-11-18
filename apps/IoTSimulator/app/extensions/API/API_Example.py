import IOTSimulatorAPI as api
import time

# DISPLAYS NETWORK LIST
print api.getNetworkList()

# CHOOSES A NEW NETWORK - NETWORK NAME SHOULD BE WITHIN THE NETWORK LIST
print api.chooseNetwork("BEVY_HEALTH_CARE")
print api.getSubscriptionDetails("CO2_Sensor")
print api.getNetworkStatus()

print api.startDevice("AC118")


print api.chooseNetwork("BEVY_HEALTH_CARE")

print api.getNetworkStatus()

print api.startNetwork()

print api.getNetworkStatus()

print api.stopNetwork()

print api.getNetworkStatus()

print api.chooseNetwork("BEVY_HEALTH_CARE")

print api.startDevice("dummy")
print api.startDevice("AC118")

print api.getDeviceDetails("dummy")
print api.getDeviceDetails("AC118")

msg1="{\"data\":{\"Speed\":{\"type\":\"range\",\"value\":\"60-100\"}},\"Temperature\":{\"temp\":{\"type\":\"range\",\"value\":\"30-60\"}}}"
msg2="hello"
msg3="data corruption test" 
print api.publish("AC118","pytopic1",msg1,0,0)
print api.publish("AC118","pytopic2",msg2,0,0)
print api.publish_with_error("AC118","pytopic2",msg3,0,0)

#print api.getDeviceDetails("AC118")
print api.stopDevice("AC118")
print "Suspending"

#Event_id can be retrieved from getDeviceDetails() API 
#Events with publish_on: At Specific Interval, Whole Day can be stopped and resumed.
		
event_id=1
print api.stopEvent(event_id)
print api.startDevice("AC118")
print api.stopEvent(event_id)
time.sleep(5);
print "Resuming"
print api.resumeEvent(event_id)

print api.addDevice('Client1','APIClient1','','')
print api.addNewSubscribe('Client1','Topic')
print api.addNewSubscribe('Client1','Topic1')
print api.addDevice('Client2','APIClient2','','')
print api.addNewSubscribe('Client2','Topic')
print api.addNewSubscribe('Client2','Topic2')
print api.addDevice('Client3','APIClient3','','')
print api.addNewSubscribe('Client3','Topic')
print api.addNewSubscribe('Client3','Topic3')
print api.addResponseforRequest('Client1','Topic','Hello','Topic1','ReqRes1')
print api.addResponseforRequest('Client2','Topic','Hello','Topic2','ReqRes2')
print api.addResponseforRequest('Client3','Topic','Hello','Topic3','ReqRes3')
print api.startDevice('Client1')
print api.startDevice('Client2')
print api.startDevice('Client3')
time.sleep(5)
print api.publish('Client1','Topic','Hello')
time.sleep(3)
print api.publish('Client2','Topic','Hello')
time.sleep(5)
print api.publish('Client3','Topic','Hello')


print 'Unsubscribing Topic1'
print api.unsubscribe('Client1','Topic1')
