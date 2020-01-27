import * as db from '../db/database'
import * as request from 'request';
import Shared from '../shared/sharedFunctions';
import property from '../property';
var log4js = require('log4js');
var prop = new property()
log4js.configure(prop.log4js);
var logger = log4js.getLogger('node_api');
import * as jp from 'jsonpath';
import * as shell from 'shelljs';
import * as propertiesReader from 'properties-reader';
import * as fsExtra from 'fs-extra';
import * as fs from 'fs';
import {
    format
} from 'date-fns';
import * as fileSize from 'file-size';
var copyFrom = require('pg-copy-streams').from;


var configVar = propertiesReader('server/pg_backup/pg_backup.config')



export default class ClassificationCtrl {
    getTablesFlag = false;
    dbName: any;
    shared = new Shared()

    table_names = async (req, res) => {
        try {
            if (this.getTablesFlag) {
                var createCountFunc: any = await db.query(`create or replace function 
                                                            count_rows(schema text, tablename text) returns integer
                                                            as
                                                            $body$
                                                            declare
                                                              result integer;
                                                              query varchar;
                                                            begin
                                                              query := 'SELECT count(1) FROM ' || schema || '.' || tablename;
                                                              execute query into result;
                                                              return result;
                                                            end;
                                                            $body$
                                                            language plpgsql;`, []);

                var queryResp: any = await db.query(`select table_name,table_schema, 
                                                      count_rows(table_schema, table_name) as count
                                                     from information_schema.tables
                                                    where 
                                                      table_schema not in ('pg_catalog', 'information_schema') 
                                                      and table_type='BASE TABLE'
                                                    order by 3 desc;`, []);
                logger.info("Tesing result -- ", queryResp);
                var countObj = {}
                var schema = {}
                queryResp.forEach((item) => {
                    countObj[item.table_name] = item.count
                    schema[item.table_name] = item.table_schema
                })
                var table_names = jp.query(queryResp, '$..table_name');
                logger.info("Table names : ", table_names, " Count --- ", countObj)
                var resultObj = {
                    tableNames: table_names,
                    count: countObj,
                    schema: schema
                }
            } else {
                return res.status(200).send(this.shared.successJson(prop.S009, []));
            }
            return res.status(200).send(this.shared.successJson(prop.S009, resultObj));

        } catch (err) {
            logger.error("Error --- ", err)
            return res.status(200).send(this.shared.errorJson(prop.E011, null));
            return err.detail
        }
    }
    table_schema = async (req, res) => {
        try {
            var queryResp = await db.query(`select table_schema,table_name,ordinal_position as position,column_name,data_type,case when character_maximum_length is not null then character_maximum_length else numeric_precision end as max_length,is_nullable,column_default as default_value from information_schema.columns where table_schema not in ('information_schema', 'pg_catalog') order by table_schema, table_name,  ordinal_position;`, []);
            logger.info("Tesing result -- ", queryResp);
            return res.status(200).send(this.shared.successJson(prop.S008, queryResp));

        } catch (err) {
            logger.error("Error --- ", err)
            return res.status(200).send(this.shared.errorJson(prop.E010, null));
            return err.detail
        }
    }

    table_data = async (req, res) => {
        try {
            var tableName = req.body.tableName;
            var offset = req.body.paginationVar.offset;
            var limit = req.body.paginationVar.limit;
            var sortField = req.body.sort.field;
            var sortDirection = req.body.sort.direction;

            var queryResp = await db.query(`select * from ${tableName} offset ${offset} limit ${limit} ;`, []);
            logger.info("Tesing result -- ", queryResp);
            return res.status(200).send(this.shared.successJson(prop.S002, queryResp));

        } catch (err) {
            logger.error("Error --- ", err)
            return res.status(200).send(this.shared.errorJson(prop.E003, null));
            return err.detail
        }
    }

    getqueryresult = async (req, res) => {
        try {
            var query = req.body.query;
            var tableName = req.body.tableName;
            var insertionLogResult: any;


            if (this.dbName != 'postgres') {
                insertionLogResult = await this.insertLog(query, tableName);
            } else {
                insertionLogResult = await this.insertLog(query, tableName);
            }
            logger.info("Insertion log result -- ", insertionLogResult)
            var queryResp = await db.query(query, []);
            logger.info("Tesing result -- ", queryResp);
            return res.status(200).send(this.shared.successJson(prop.S007, queryResp));

        } catch (err) {
            logger.error("Error --- ", err)
            return res.status(200).send(this.shared.errorJson(prop.E009, null));
            return err.detail
        }
    }

    async insertLog(cmd, tableName) {
        return new Promise(async (resolve, reject) => {
            var result = await this.createdblinkLocal();
            logger.info("Result of creation of db link local ---- ", result);
            try {
                var insertlog = await db.query(`SELECT *  FROM dblink('postgres_server', 'CREATE TABLE IF NOT EXISTS history (
        id serial,
        cmd text,
        database text,
        crat timestamp,
        tablename text,
        PRIMARY KEY(id)
       );insert into history (cmd,database,crat,tablename) values (''${cmd}'',''${this.dbName}'',CURRENT_TIMESTAMP,''${tableName}'');') as data(record text);`, []);
                logger.info("Insert log --- ", insertlog);
                resolve(insertlog);
            } catch (err) {
                logger.error("Error while inserting log - ", err)
                reject(err)
            }
        });

    }


    gethistory = async (req, res) => {
        try {
            var result = await this.createdblinkLocal();
            logger.info("Result of creation of db link local ---- ", result);

            var queryInfo = await db.query(`SELECT *  FROM dblink('postgres_server', 'SELECT id,cmd,database,crat,tablename from history;') AS data(id numeric,cmd text,database text,crat timestamp,tablename text);`, []);
            return res.status(200).send(this.shared.successJson(prop.S006, queryInfo));
        } catch (err) {
            return res.status(200).send(this.shared.errorJson(prop.E008, null));
        }

    }

    createNewConnection = async (req, res) => {
        try {
            logger.info("Request body : ", req.body)
            var dbName = req.body.database;
            this.dbName = dbName;
            var port = req.body.port;
            var serverName = req.body.server;
            var password = req.body.password;
            var username = req.body.username;
            var queryResp = await db.createNewPool(username, dbName, serverName, port, password);
            logger.info("New connection  -- ", queryResp);
            var checkDbexistsquery = `select exists(SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${this.dbName}'));`
            var checkDB = await db.query(checkDbexistsquery, []);
            logger.info("Database connection info ----------- ", checkDB);
            if (checkDB[0].exists == false) {
                return res.status(200).send(this.shared.errorJson(prop.E012, null));
            }

            this.getTablesFlag = true;

            this.updateBackupConfig(username, dbName, port, serverName, password);
            return res.status(200).send(this.shared.successJson(prop.S001, null));

        } catch (err) {
            logger.error("Error --- ", err)
            return res.status(200).send(this.shared.errorJson(prop.E004, null));
            return err.detail
        }
    }

    createDBLink = async (req, res) => {


        var checkExtension = await db.query(`CREATE EXTENSION IF NOT EXISTS dblink;`, []);
        var checkConnections: any = await db.query(`SELECT dblink_get_connections();`, [])
        logger.info("ALl connections dblink ----- ", checkConnections[0].dblink_get_connections);
        if (checkConnections[0].dblink_get_connections == null) {
            var createDblink = await db.query("SELECT dblink_connect('postgres_server','host=localhost user=postgres password=postgres dbname=postgres');", [])
            return res.status(200).send(this.shared.successJson("Cross connection created successfully", null));
        } else {
            return res.status(200).send(this.shared.successJson("Cross connection already exist", null));
        }


    }

    createdblinkLocal = async () => {

        return new Promise(async (resolve, reject) => {
            try {
                var checkExtension = await db.query(`CREATE EXTENSION IF NOT EXISTS dblink;`, []);
                logger.info("Check extension -- ", checkExtension);
                var checkConnections: any = await db.query(`SELECT dblink_get_connections();`, [])
                logger.info("ALl connections dblink ----- ", checkConnections[0].dblink_get_connections);


                if (checkConnections[0].dblink_get_connections == null) {
                    var createDblink = await db.query("SELECT dblink_connect('postgres_server','host=localhost user=postgres password=postgres dbname=postgres');", [])
                }
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });


    }

    updateBackupConfig(username, dbName, port, serverName, password) {
        logger.info('Update the backup config');
        var backupDir = __dirname.split('dist/server/controllers')[0] + 'server/public/backups/'
        logger.info("New backup directory ---------- ", backupDir)

        configVar.set('HOSTNAME', serverName);
        configVar.set('USERNAME', username);
        configVar.set('PORT', port);
        configVar.set('DATABASES', dbName);
        configVar.set('PASSWORD', password);
        configVar.set('BACKUP_DIR', backupDir)
        configVar.set('SCHEMA_ONLY_LIST', dbName)

        configVar.save('server/pg_backup/pg_backup.config');
    }

    getBackUpFiles = async (req, res) => {
        var self = this
        fsExtra.emptyDir('server/public/backups', err => {
            if (err) return res.status(200).send(this.shared.errorJson(prop.E005, null));

            shell.exec('server/pg_backup/pg_backup.sh', function(code, stdout, stderr) {
                logger.info('Exit code:', code);
                logger.info('Program output:', stdout);
                logger.info('Program stderr:', stderr);
                var backupDir = 'server/public/backups/' + self.shared.getDate();
                logger.info('Folder name where backup exists ----- ', backupDir)
                var files = fs.readdirSync(backupDir);
                var filesInfo = []
                files.forEach((file) => {

                    var stats = fs.statSync(backupDir + '/' + file)
                    var filesize = fileSize(stats["size"]).human('jedec');
                    filesInfo.push({
                        name: file,
                        size: filesize
                    })
                })
                return res.status(200).send(self.shared.successJson(prop.S003, {
                    files: filesInfo,
                    folder: self.shared.getDate()
                }));
            });



        })

    }


    part_table_schema = async (req, res) => {
        var table_name = req.params.table;
        try {
            var queryResp = await db.query(`select table_schema,table_name,ordinal_position as position,column_name,data_type,case when character_maximum_length is not null then character_maximum_length else numeric_precision end as max_length,is_nullable,column_default as default_value from information_schema.columns where table_name='${table_name}'  and table_schema not in ('information_schema', 'pg_catalog') order by table_schema, table_name,  ordinal_position;`, []);
            logger.info("Tesing result -- ", queryResp);
            return res.status(200).send(this.shared.successJson("Success", queryResp));

        } catch (err) {
            logger.error("Error --- ", err)
            return res.status(200).send(this.shared.errorJson("Failure", null));
            return err.detail
        }
    }

    filtertabledata = async (req, res) => {
        var table_name = req.body.tableName;
        var columns = req.body.tableColumns;
        var sortField = req.body.sort.field;
        var sortDirection = req.body.sort.direction;
        var skip = req.body.paginator.skip;
        var limit = req.body.paginator.limit;

        var skipSortLmitString = ''
        if(sortDirection == null){
          skipSortLmitString=`offset ${skip} limit ${limit}`
        }
        else{
          skipSortLmitString=`order by "${sortField}" ${sortDirection} offset ${skip} limit ${limit}`
        }
        logger.info("skipSortLmitString ----- ",skipSortLmitString);
        columns = '"' + columns.join('", "') + '"';
        var formData = req.body.formData;
        var filterString = []
        req.body.tableColumns.forEach((item) => {
            logger.info("------------------------------------ >>   item : ", formData[item])
            if (formData[item] != null) {
                if (formData[item].trim().length > 0) {
                    filterString.push(`LOWER(CAST("${item}" as TEXT))` + ` LIKE '%${formData[item].toString().toLowerCase()}%'`)
                }
            }
        })

        var whereString = filterString.join(' and ');
        logger.info("Filter string ------   ", whereString)
        var totalCount:any;

        try {
            var queryResp;
            if (whereString.length > 0) {
                queryResp = await db.query(`select ${columns} from ${table_name} where ${whereString} ${skipSortLmitString};`, []);
                totalCount = await db.query(`select count(*) from ${table_name} where ${whereString};`, []);
            } else {
                queryResp = await db.query(`select ${columns} from ${table_name} ${skipSortLmitString};`, []);
                totalCount = await db.query(`select count(*) from ${table_name};`, []);
            }
            logger.info("Tesing result -- ", queryResp);
            return res.status(200).send(this.shared.successJson(prop.S004, {queryResp:queryResp,count:totalCount[0].count}));

        } catch (err) {
            logger.error("Error --- ", err)
            return res.status(200).send(this.shared.errorJson(prop.E006, err.detail));
            return err.detail
        }
    }

    insertcsv = async (fileName, tableName) => {
        var tableName = tableName;
        logger.info("Table name - ", tableName)
        var fileName = fileName
        return new Promise(async (resolve, reject) => {
            try {

                var fileStream = fs.createReadStream(fileName);
                var csvHeaders: any = await this.shared.getCSVHeaders(fileStream);
                logger.info("Headers ---------- ", csvHeaders);
                var headers = csvHeaders[0];
                var columnString = '"' + headers.join(`" VARCHAR (10485759) ,"`) + '" VARCHAR (10485759)';
                logger.info("Column string - ", columnString);
                var queryString = `CREATE TABLE ${tableName}(${columnString});`
                logger.info("Query string -- ", queryString)
                var newTable = await db.query(queryString, []);
                logger.info("CREATE TABLE RESULT - ", newTable)
                var columnString2 = '"' + csvHeaders[0].join('" ,"') + '"'
                var insertCsvData = await db.query(`COPY ${tableName}(${columnString2}) FROM '${fileName}' DELIMITER ',' CSV HEADER;`, [])
                logger.info("Insert data in TABLE RESULT - ", insertCsvData)

                resolve(insertCsvData);

            } catch (err) {
                reject(err)
            }
        })
    }
    savecsv = async (req, res) => {
        try {
            logger.info("Body --- ", req.files.UploadFiles)
            var uploadedFile = req.files.UploadFiles
            logger.info("Request complete ---------------------------------------------", req.body);
            var fileName = req.files.UploadFiles.name
            var tableName = req.body.tableName
            var self = this

            var filePath = decodeURI(prop.fileUploadDir + req.files.UploadFiles.name.split(".csv")[0] + "_" + Date.now() + ".csv");

            uploadedFile.mv(filePath, async function(err) {
                if (err) {
                    logger.error(err);
                    return res.status(200).send(self.shared.errorJson("File save Failure", err));
                } else {
                    logger.info("FIle uploaded")
                    var pgResp = await self.insertcsv(filePath, tableName)
                    logger.info("Postgres response for creating table from csv - ", pgResp);
                    return res.status(200).send(self.shared.successJson(prop.S005, pgResp));

                }
            });


            return res.status(200).send(this.shared.successJson(prop.S005, null));

        } catch (err) {
            logger.error("Error --- ", err)
            return res.status(200).send(this.shared.errorJson(prop.E007, null));
        }
    }
    removecsv = async (req, res) => {
        try {
            logger.info("Body --- ", req.body)
            logger.info("Request complete ---------------------------------------------", req);
            return res.status(200).send(this.shared.successJson("Success", req.body));

        } catch (err) {
            logger.error("Error --- ", err)
            return res.status(200).send(this.shared.errorJson("Failure", err.detail));
        }
    }




}