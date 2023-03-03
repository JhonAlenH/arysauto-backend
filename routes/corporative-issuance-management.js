const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');

router.route('/search').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationSearchCorporativeIssuanceCertificates(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchCorporativeIssuanceCertificates' } });
        });
    }
});

const operationSearchCorporativeIssuanceCertificates = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        ccarga: requestBody.ccarga,
        clote: requestBody.clote,
    };
    let searchCorporativeIssuanceCertificates = await bd.searchCorporativeIssuanceCertificates(searchData).then((res) => res);
    if(searchCorporativeIssuanceCertificates.error){ return  { status: false, code: 500, message: searchCorporativeIssuanceCertificates.error }; }
    if(searchCorporativeIssuanceCertificates.result.rowsAffected > 0){
        let jsonList = [];
        for(let i = 0; i < searchCorporativeIssuanceCertificates.result.recordset.length; i++) {
            jsonList.push({
                id: searchCorporativeIssuanceCertificates.result.recordset[i].ID,
                ccarga: searchCorporativeIssuanceCertificates.result.recordset[i].CCARGA,
                clote: searchCorporativeIssuanceCertificates.result.recordset[i].CLOTE,
                xpoliza: searchCorporativeIssuanceCertificates.result.recordset[i].XPOLIZA,
                xcertificado: searchCorporativeIssuanceCertificates.result.recordset[i].XCERTIFICADO,
                xnombre: searchCorporativeIssuanceCertificates.result.recordset[i].XNOMBRE,
                xplaca: searchCorporativeIssuanceCertificates.result.recordset[i].XPLACA,
                xmarca: searchCorporativeIssuanceCertificates.result.recordset[i].XMARCA,
                xmodelo: searchCorporativeIssuanceCertificates.result.recordset[i].XMODELO,
                xversion: searchCorporativeIssuanceCertificates.result.recordset[i].XVERSION
            });
        }
        return { status: true, list: jsonList };
    }
    else{ return { status: false, code: 404, message: 'Fleet Contract Management not found.' }; }
}

router.route('/detail').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationDetailCorporativeIssuanceCertificate(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchCorporativeIssuanceCertificates' } });
        });
    }
});

const operationDetailCorporativeIssuanceCertificate = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        ccarga: requestBody.ccarga,
        clote: requestBody.clote,
    };
    let searchCorporativeIssuanceCertificates = await bd.searchCorporativeIssuanceCertificates(searchData).then((res) => res);
    if(searchCorporativeIssuanceCertificates.error){ return  { status: false, code: 500, message: searchCorporativeIssuanceCertificates.error }; }
    if(searchCorporativeIssuanceCertificates.result.rowsAffected > 0){
        let jsonList = [];
        for(let i = 0; i < searchCorporativeIssuanceCertificates.result.recordset.length; i++) {
            jsonList.push({
                id: searchCorporativeIssuanceCertificates.result.recordset[i].ID,
                ccarga: searchCorporativeIssuanceCertificates.result.recordset[i].CCARGA,
                clote: searchCorporativeIssuanceCertificates.result.recordset[i].CLOTE,
                xpoliza: searchCorporativeIssuanceCertificates.result.recordset[i].XPOLIZA,
                xcertificado: searchCorporativeIssuanceCertificates.result.recordset[i].XCERTIFICADO,
                xnombre: searchCorporativeIssuanceCertificates.result.recordset[i].XNOMBRE,
                xplaca: searchCorporativeIssuanceCertificates.result.recordset[i].XPLACA,
                xmarca: searchCorporativeIssuanceCertificates.result.recordset[i].XMARCA,
                xmodelo: searchCorporativeIssuanceCertificates.result.recordset[i].XMODELO,
                xversion: searchCorporativeIssuanceCertificates.result.recordset[i].XVERSION
            });
        }
        return { status: true, list: jsonList };
    }
    else{ return { status: false, code: 404, message: 'Fleet Contract Management not found.' }; }
}

module.exports = router;