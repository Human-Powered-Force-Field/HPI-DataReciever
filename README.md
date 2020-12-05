# HPI-DataReciever

## Set up
If you are sending data to firebase:
1. Get api-key from firestore/project settings/service accounts by clicking "generate new pivate key"
2. Add the downloaded key to the project as dbkey.json
3. Run "npm install"

Otherwise:
1. Remove any code in main.js refering to firebase/firestore
2. Run "npm install"


## To Run
1. Change the id of the controllers/sensors to match your sensors
2. Plug in Enocean USB300
3. run "npm test"


Based on the works of Futomi: https://github.com/futomi/node-enocean-utils
