import { Pool } from 'pg';
import property from '../property';
var log4js = require('log4js');
var prop = new property()
log4js.configure(prop.log4js);
var logger = log4js.getLogger('node_api');

var pool;
const connectionString = 'postgresql://postgres:postgres@localhost:5432/whatsloan'
if(pool != null){
logger.info("---------------  Existing pool is closed ------------- ")
pool.end();
}
pool = new Pool({
  connectionString: connectionString,
})

export const createNewPool = (username,dbname,server,port,password)=>{
  pool.end();
  var newConnectionString = `postgresql://${username}:${password}@${server}:${port}/${dbname}`;
  try{
    pool=new Pool({
    connectionString: newConnectionString,
  })
}
catch(err){
  return err;
}
  return pool
}



  export const query= async(text, params) => {
    const start = Date.now()
    return new Promise((resolve, reject) => {
    pool.query(text, params, (err, res) => {
    	if(err){
    		reject(err);
    	}
      else{
            if(res){
                  const duration = Date.now() - start
                  resolve(res.rows)
            }
            else{
             resolve([])
            }
          }
    })
});
  }

  export const queryResponse= async(text) => {
    const start = Date.now()
    return new Promise((resolve, reject) => {
    pool.query(text, (err, res) => {
      if(err){
        reject(err);
      }
      else{
            if(res){
                  const duration = Date.now() - start
                  resolve(res)
            }
            else{
             resolve([])
            }
          }
    })
});
  }

  
