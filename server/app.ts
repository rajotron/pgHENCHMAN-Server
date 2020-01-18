import * as dotenv from 'dotenv';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import routes from './routes';
import Property from './property';
import * as fileUpload from 'express-fileupload';
import * as cors from 'cors';
import sharedFunctions from './shared/sharedFunctions';
const property = new Property();
var log4js = require('log4js');
log4js.configure(property.log4js);
var logger = log4js.getLogger('node_api');
const shared = new sharedFunctions();


const app = express();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});


app.use(cors());
app.use(fileUpload());

let logDirectory = path.join(__dirname, 'log')
dotenv.config({
  path: '.env'
});
app.set('port', (process.env.PORT || 3000)); 
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

let mongodbURI;

app.use(express.static(path.join(process.cwd(), 'server/public')));
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

const options = {

  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true 
};
    routes(app);

  app.listen(app.get('port'), () => {
          logger.info(`pgHENCHMAN server running on port ${app.get('port')}`);
          console.log(`pgHENCHMAN server running on port ${app.get('port')}`);
          
        }).timeout = 1000000;

export {
  app
};
