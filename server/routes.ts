import * as express from 'express';
import ClassificationCtrl from './controllers/classificationController';
import Property from './property';
import sharedFunctions from './shared/sharedFunctions';



export default function setRoutes(app) {

    const router = express.Router();
    const property = new Property();
    const shared = new sharedFunctions();
    const classificationCtrl = new ClassificationCtrl();
    
    router.route('/classification/schema').get(classificationCtrl.table_schema);
    router.route('/classification/schema/:table').get(classificationCtrl.part_table_schema);
    router.route('/classification/tables').get(classificationCtrl.table_names);
    router.route('/classification/newconnection').post(classificationCtrl.createNewConnection);
    router.route('/classification/getdata').post(classificationCtrl.table_data);
    router.route('/classification/getqueryresult').post(classificationCtrl.getqueryresult);
    router.route('/classification/filtertabledata').post(classificationCtrl.filtertabledata);
    router.route('/classification/backupfiles').get(classificationCtrl.getBackUpFiles);
    router.route('/classification/insertcsv').post(classificationCtrl.insertcsv);
    router.route('/classification/save').post(classificationCtrl.savecsv);
    router.route('/classification/remove').post(classificationCtrl.removecsv);
    router.route('/classification/history').get(classificationCtrl.gethistory);
    router.route('/classification/createcrossconnection').get(classificationCtrl.createDBLink);

    // Apply the routes to our application with the prefix /api
    app.use('/api', router);

}