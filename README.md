Copyright (C) 2013-2014 Computer Sciences Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

#EzBake Security - User Interface
This project is meant to allow administrators and developers direct and easy access to thrift services by taking files specified within the configuration, generating the appropriate thrift code, generating connecting RESTful code and generating a UI that connects to the RESTful web service.

##Requirements
This project requires ```node.js 0.10.x``` or higher to run. To build ```bower 1.3.x``` or higher, ```grunt 0.4.x``` or higher, ```thrift 0.9.1``` installed and on PATH and a unix based machine due to many commands running as part of the build process uses bash.

##Getting started
To get started simply run the following 3 commands which will get you up and running provided you have the dependencies listed above.

1. ```npm install```
2. ```bower install```
3. ```grunt init```

That's it! To start the project run ```npm start``` and to run unit tests run ```npm test```.

##Deploying
For deploying this project run the following grunt command:
```grunt build:openshift``` This builds for the openshift environment (uses the config/environments/openshift.js configuration file).
```grunt build:development``` This builds for a development environment (uses the config/environments/development.js configuration file).

This will fetch the latest thrift files, generate the source and build a tar.gz and drop it into the build/release/ folder.

##Usage
Code generation of thrift files does not happen in real-time (there wasn't a need to add this type of complexity to the application) therefore when additional thrift services are added the application should be rebuilt then redeployed.

###Add a new thrift service
First modify either the ```config/default.js``` configuration or update your environment's configuration and in the thrift it should look like this:

```
thrifts: [
    { fileName: "EzGroups.thrift", label: "EzGroups" },
    { fileName: "ezprofile.thrift", label: "EzProfile" }
]
```

Simply add a new JavaScript object with a fileName property (fileName is relative to the ```./thrifts/``` directory) and a label property (label is displayed as the title on the user interface for each thrift service).

Once added run ```grunt init``` and you're done (assuming all thrift dependencies were in the ```./thrifts/``` directory).

FIN
