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

router.route('/arys-service').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationArysService(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationArysService' } });
        });
    }
});

const operationArysService = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }

    let dataCountArysService = await bd.dataCountArysServiceQuery().then((res) => res);
    if(dataCountArysService.error){ return { status: false, code: 500, message: dataCountArysService.error }; }

    if(dataCountArysService.result.rowsAffected > 0){
        return { status: true, 
                 npersonas_arys: dataCountArysService.result.recordset[0].CCODIGO_SERV
        }
    }else{ 
        return { status: false, code: 404, message: 'Coin not found.' }; 
    }
}

router.route('/amounts-paid').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationAmountsPaid(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationAmountsPaid' } });
        });
    }
});

const operationAmountsPaid = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }

    let amountsPaid = await bd.amountsPaidQuery().then((res) => res);
    if(amountsPaid.error){ return  { status: false, code: 500, message: amountsPaid.error }; }
    if(amountsPaid.result.rowsAffected > 0){
        let jsonList = [];
        for(let i = 0; i < amountsPaid.result.recordset.length; i++){
            let mes
            if(amountsPaid.result.recordset[i].MES == 1){
                mes = 'Enero'
            }else if(amountsPaid.result.recordset[i].MES == 2){
                mes = 'Febrero'
            }else if(amountsPaid.result.recordset[i].MES == 3){
                mes = 'Marzo'
            }else if(amountsPaid.result.recordset[i].MES == 4){
                mes = 'Abril'
            }else if(amountsPaid.result.recordset[i].MES == 5){
                mes = 'Mayo'
            }else if(amountsPaid.result.recordset[i].MES == 6){
                mes = 'Junio'
            }else if(amountsPaid.result.recordset[i].MES == 7){
                mes = 'Julio'
            }else if(amountsPaid.result.recordset[i].MES == 8){
                mes = 'Agosto'
            }else if(amountsPaid.result.recordset[i].MES == 9){
                mes = 'Septiembre'
            }else if(amountsPaid.result.recordset[i].MES == 10){
                mes = 'Octubre'
            }else if(amountsPaid.result.recordset[i].MES == 11){
                mes = 'Noviembre'
            }else if(amountsPaid.result.recordset[i].MES == 12){
                mes = 'Diciembre'
            }
            jsonList.push({
                mes: mes,
                mprima_pagada: amountsPaid.result.recordset[i].MPRIMA_PAGADA,
            });
        }
        return { status: true, list: jsonList };
    }else{ return { status: false, code: 404, message: 'Notification not found.' }; }
}

router.route('/amounts-outstanding').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationAmountsOutstanding(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationAmountsOutstanding' } });
        });
    }
});

const operationAmountsOutstanding = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }

    let amountsOutstanding = await bd.amountsOutstandingQuery().then((res) => res);
    if(amountsOutstanding.error){ return  { status: false, code: 500, message: amountsOutstanding.error }; }
    if(amountsOutstanding.result.rowsAffected > 0){
        let jsonList = [];
        for(let i = 0; i < amountsOutstanding.result.recordset.length; i++){
            let mes
            if(amountsOutstanding.result.recordset[i].MES == 1){
                mes = 'Enero'
            }else if(amountsOutstanding.result.recordset[i].MES == 2){
                mes = 'Febrero'
            }else if(amountsOutstanding.result.recordset[i].MES == 3){
                mes = 'Marzo'
            }else if(amountsOutstanding.result.recordset[i].MES == 4){
                mes = 'Abril'
            }else if(amountsOutstanding.result.recordset[i].MES == 5){
                mes = 'Mayo'
            }else if(amountsOutstanding.result.recordset[i].MES == 6){
                mes = 'Junio'
            }else if(amountsOutstanding.result.recordset[i].MES == 7){
                mes = 'Julio'
            }else if(amountsOutstanding.result.recordset[i].MES == 8){
                mes = 'Agosto'
            }else if(amountsOutstanding.result.recordset[i].MES == 9){
                mes = 'Septiembre'
            }else if(amountsOutstanding.result.recordset[i].MES == 10){
                mes = 'Octubre'
            }else if(amountsOutstanding.result.recordset[i].MES == 11){
                mes = 'Noviembre'
            }else if(amountsOutstanding.result.recordset[i].MES == 12){
                mes = 'Diciembre'
            }
            jsonList.push({
                mes: mes,
                mprima_anual: amountsOutstanding.result.recordset[i].MPRIMA_ANUAL,
            });
        }
        return { status: true, list: jsonList };
    }else{ return { status: false, code: 404, message: 'Notification not found.' }; }
}

router.route('/count-notifications').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationCountNotifications(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCountNotifications' } });
        });
    }
});

const operationCountNotifications = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }

    let countNotifications = await bd.countNotificationsQuery().then((res) => res);
    if(countNotifications.error){ return  { status: false, code: 500, message: countNotifications.error }; }
    if(countNotifications.result.rowsAffected > 0){
        let jsonList = [];
        for(let i = 0; i < countNotifications.result.recordset.length; i++){
            let mes
            if(countNotifications.result.recordset[i].MES == 1){
                mes = 'Enero'
            }else if(countNotifications.result.recordset[i].MES == 2){
                mes = 'Febrero'
            }else if(countNotifications.result.recordset[i].MES == 3){
                mes = 'Marzo'
            }else if(countNotifications.result.recordset[i].MES == 4){
                mes = 'Abril'
            }else if(countNotifications.result.recordset[i].MES == 5){
                mes = 'Mayo'
            }else if(countNotifications.result.recordset[i].MES == 6){
                mes = 'Junio'
            }else if(countNotifications.result.recordset[i].MES == 7){
                mes = 'Julio'
            }else if(countNotifications.result.recordset[i].MES == 8){
                mes = 'Agosto'
            }else if(countNotifications.result.recordset[i].MES == 9){
                mes = 'Septiembre'
            }else if(countNotifications.result.recordset[i].MES == 10){
                mes = 'Octubre'
            }else if(countNotifications.result.recordset[i].MES == 11){
                mes = 'Noviembre'
            }else if(countNotifications.result.recordset[i].MES == 12){
                mes = 'Diciembre'
            }
            jsonList.push({
                mes: mes,
                notificaciones: countNotifications.result.recordset[i].NOTIFICACIONES,
            });
        }
        return { status: true, list: jsonList };
    }else{ return { status: false, code: 404, message: 'Notification not found.' }; }
}


module.exports = router;