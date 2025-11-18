#!/bin/sh
# This shell script installs mysql-connector-python
os="$(uname -s)"

if [ "$os" = "Linux" ]; then
	
	echo --------------------------------------------------
	echo     Searching for wget
	echo --------------------------------------------------

	if command -v wget > /dev/null 2>&1; then

		echo --------------------------------------------------
		echo     wget found    
		echo --------------------------------------------------
		
	else

		echo --------------------------------------------------
		echo     wget not found. Installing wget ..............   
		echo --------------------------------------------------
		echo --------------------------------------------------
		echo     sudo password is required to install wget        
		echo --------------------------------------------------	
	
        sudo apt install wget
    fi
	
	wget "https://dev.mysql.com/get/Downloads/Connector-Python/mysql-connector-python-8.0.31.zip"
	
	unzip mysql-connector-python-8.0.31.zip
	mv mysql-connector-python-8.0.31/* ../lib
	rm -rf mysql-connector-python-8.0.31*
	
	echo --------------------------------------------------	
	echo     mysql-connector-python installed successfully   
	echo --------------------------------------------------	

	echo --------------------------------------------------
    echo  Set mySQL configurations in Bevywise/MQTTRoute/conf/data_store.conf 
    echo --------------------------------------------------
	

elif [ "$os" = "Darwin" ]; then

	echo --------------------------------------------------
	echo     Searching for brew...   
	echo --------------------------------------------------

	a=`which brew ; echo $?`

	b=`echo $a | awk '{print $2}'`

	if [ "$b" = "0" ]; then

		echo --------------------------------------------------
		echo    brew found   
		echo --------------------------------------------------

	else
		echo --------------------------------------------------
		echo      Brew not found. Installing brew...    
		echo --------------------------------------------------

		/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
	fi

	echo --------------------------------------------------
	echo     Searching for wget
	echo --------------------------------------------------

	if command -v wget > /dev/null 2>&1; then

		echo --------------------------------------------------
		echo     wget Found    
		echo --------------------------------------------------
		
	else

		echo --------------------------------------------------
		echo     wget not found. Installing wget ..............   
		echo --------------------------------------------------
		echo --------------------------------------------------
		echo     sudo password is required to install wget        
		echo --------------------------------------------------	
	
        sudo brew install wget
    fi
	
	wget "https://dev.mysql.com/get/Downloads/Connector-Python/mysql-connector-python-8.0.31.zip"
	
	unzip mysql-connector-python-8.0.31.zip
	mv mysql-connector-python-8.0.31/* ../lib
	rm -rf mysql-connector-python-8.0.31*
	
	echo --------------------------------------------------
	echo     Installation Successful    
	echo --------------------------------------------------

	echo --------------------------------------------------
    echo  Set mySQL configurations in Bevywise/IoTSimulator/conf/db.conf 
    echo --------------------------------------------------

fi
