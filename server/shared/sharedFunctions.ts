import * as papa from 'papaparse';
import { format } from 'date-fns';
import prop from '../property';
var log4js = require('log4js');
var property = new prop()
log4js.configure(property.log4js);
var logger = log4js.getLogger('node_api');
export default class commonFunctions {

    successJson(message, data) {
        let obj = {}
        obj["code"] = "Success";
        obj["message"] = message
        obj["status"] = "200"
        if (data != null) {
            obj["data"] = data
        }
        return obj;
    }

    errorJson(message, data) {
        let obj = {}
        obj["code"] = "Failure"
        obj["message"] = message
        obj["status"] = "400"
        if (data != null) {
            obj["data"] = data
        }

        return obj;
    }
    getCSVHeaders(file) {

        return new Promise((resolve, reject) => {
            var papa_config = {
                delimiter: ""
            }
            papa.parse(file, {
                config: papa_config,
                complete: function(results) {
                    var len = results.data.length - 1
                    var res = [results.data[0], len]
                    resolve(res)

                },
                error: function(err) {
                  logger.error(err);
                    reject(property.E001)
                }
            });
        });
    }

    isAlphaNumeric(input){
        var letters = /^[0-9a-zA-Z]+$/;
        if(input.match(letters))
        {
        return true;
        }
        else{
            return false;
        }
    }


    getCsvData(file) {
        return new Promise((resolve, reject) => {
            /*var papa_config = {
                delimiter: ","
            }*/
            papa.parse(file, {
                complete: function(results) {
                    resolve(results)


                },
                error: function(err) {
                  logger.error(err);
                    reject(err)
                }
            });
        });
    }

    getDate() {

        const now = format(new Date().toDateString(),"YYYY-MM-DD");
        return now
    }

    JsonToUpperCase(inputJson){
        var result = JSON.parse(JSON.stringify(inputJson, function(a, b) {
  return typeof b === "string" ? b.toUpperCase() : b
}));
        return result
    }

     JsonToLowerCase(inputJson){
        var result = JSON.parse(JSON.stringify(inputJson, function(a, b) {
  return typeof b === "string" ? b.toLowerCase() : b
}));
        return result
    }

  arr_diff (a1, a2) {

    var a = [], diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
}


}
