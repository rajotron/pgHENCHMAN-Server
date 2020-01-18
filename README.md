[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
&nbsp;&nbsp;
[![Node: 8.11.1](https://img.shields.io/badge/Node-%20v8.11.1-brightgreen.svg)](https://nodejs.org/ja/blog/release/v8.11.1/)
&nbsp;
[![NPM: 6.4.0](https://img.shields.io/badge/NPM-%20v6.4.0-orange.svg)](https://www.npmjs.com/package/npm/v/6.4.0)
&nbsp;&nbsp;&nbsp;
[![pgHENCHMAN: 1.0](https://img.shields.io/badge/pgHENCHMAN-%20v1.0-0298c3.svg)](https://pghenchman.herokuapp.com/#/)

# pgHENCHMAN-Server 
[pgHENCHMAN](https://pghenchman.herokuapp.com/#/) is an Open Source Client for POSTGRESQL for administration and development which includes intuitive GUI for easy usage and ad-hoc analysis on the postgres database.

If you want to know more about it you can visit this [link](https://pghenchman.herokuapp.com/#/)

To build connection between your pgHENCHMAN [GUI](https://pghenchman.herokuapp.com/#/) and your postgres database you need pgHENCHMAN-server.

## INSTALLATION

### Step 1
``` 
git clone https://github.com/rajotron/pgHENCHMAN-Server
```

### Step 2
Get into the project directory and install all packages listed in package.json file at root. 
``` 
cd pgHENCHMAN-Server 
```
``` 
npm install 
```
### Step 3
Run the shell script to run backend server.

You need to run the below given command first time only as to create the dist folder by compiling the typescript code to javascript.
``` 
npm run predev
```
Then you have to make the script executable for which you have to give suitable permission to the run.sh shell script.
``` 
chmod +x run.sh
```

Run the server 
``` 
./run.sh
```
