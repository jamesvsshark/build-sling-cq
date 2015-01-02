build-sling-cq
==============

build CQ packages from SVN source with maven mvn and sling to CRX

Instructions

- clone this repository into the root of your src directory as a subfolder (git clone should do this automatically if you are cloning)
- configure settings.json to point to the directorys containing the source you want maven to build
- configure settings.json to point to a folder to copy jar files to 

NOTE: Maven tries to connect to author instance if the pom file wants it to -- start publisher and author before running this. 

POST-BUILD - copy jar files from your mvnJar folder into cq quickstart install folder
