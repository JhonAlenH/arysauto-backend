const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');

router.route('/contract').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationContract(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationContract' } });
        });
    }
});

const operationContract = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let data = {
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania
    }
    let dataPendingContract = await bd.dataPendingContractQuery(data).then((res) => res);
    if(dataPendingContract.error){ return { status: false, code: 500, message: dataPendingContract.error }; }
        let dataContractsCollected = await bd.dataContractsCollectedQuery(data).then((res) => res);
        if(dataContractsCollected.error){ return { status: false, code: 500, message: dataContractsCollected.error }; }

        if(dataPendingContract.result.rowsAffected > 0){
            return { status: true, 
                    npersonas_pendientes: dataPendingContract.result.recordset[0].NPERSONAS_PENDIENTES,
                    npersonas_cobradas: dataContractsCollected.result.recordset[0].NPERSONAS_COBRADAS,
            }
        }else{ 
            return { status: false, code: 404, message: 'Coin not found.' }; 
        }
}

router.route('/notifications').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationNotification(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationNotification' } });
        });
    }
});

const operationNotification = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let data = {
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania
    }
    let dataNotifications = await bd.dataNotificationsQuery(data).then((res) => res);
    if(dataNotifications.error){ return { status: false, code: 500, message: dataNotifications.error }; }

    if(dataNotifications.result.rowsAffected > 0){
        return { status: true, 
                nnotificacion: dataNotifications.result.recordset[0].NNOTIFICACION,
        }
    }else{ 
        return { status: false, code: 404, message: 'Coin not found.' }; 
    }
}


module.exports = router;