import * as moment from 'moment';
import * as path from 'path';

export default class property {


    env = ['development', 'production']
    dirname = ""
    fileUploadDir: any
    imgUploadDir: any
    imagePath: any
    weabAppIp  = '';

    //**********************************************************************************************
    constructor() {
        switch (this.env[0]) {
            case ('development'):
                this.dirname = __dirname.split('/dist/server')[0];
                this.weabAppIp = 'http://localhost:4200/#/';

                break;
            case ('production'):
                this.dirname = "";
                this.weabAppIp = 'http://localhost:4200/#/';
                break;
        }

        this.fileUploadDir = this.dirname + "/server/public/uploads/csv/";
        this.imgUploadDir = this.dirname + "/server/public/uploads/images/";
        this.imagePath = this.dirname + '/server/public/'

    }
    //**********************************************************************************************
   

    //-------------------------------- Log4j2 config ------------------------------------------------
    log4js = {
                "appenders": 
                { "node_api":{ 
                    "type": "dateFile", 
                    "filename": "./logs/nodeBackend_Logs",  
                    "reloadSecs": 3,
                    "pattern":"-dd-MM.log",
                    "alwaysIncludePattern":true
                    }
                },
                "categories": { 
                    "default": { "appenders": ["node_api"], "level": "all" }
                }
                
            }
    //-------------------------------- Log4j2 config ------------------------------------------------




     //********************** Success and Error Messages***********************************************
    S001 = 'New connection is established';
    S002 = "Table data is fetched successfully"
    S003 = "Backup files fetched successfully"
    S004 = "Filter result fetched successfully"
    S005 = "Database created successfully"
    S006 = "History fetched successfully"
    S007 = "Query result fetched successfully"
    S008 = "Table schema fetched successfully"
    S009 = "Table names fetched successfully"



    E001 = 'Server is not responding'
    E002 = 'Not found'
    E003 = "Error while fetched data from this table"
    E004 = "Error while connecting to database";
    E005 = "Error while creating backup files"
    E006 = "Error while filtering data"
    E007 = "Error while creating database from csv"
    E008 = "Error while getting history of queries";
    E009 = "Unable to execute your query"
    E010 = "Error while fetching table schema"
    E011 = "Error while fetching table names"
    E012 = 'Connection to this database failed';

     //********************** Success and Error Messages***********************************************


}
