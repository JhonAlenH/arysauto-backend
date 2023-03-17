const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');

function changeDateFormat (date) {
    let dateArray = date.toISOString().substring(0,10).split("-");
    return dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0];
  }

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

router.route('/search-corporative-charge').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationSearchCorporativeCharges(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchCorporativeCharges' } });
        });
    }
});

const operationSearchCorporativeCharges = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        ccarga: requestBody.ccarga
    };
    let searchCorporativeCharges = await bd.searchCorporativeCharges(searchData).then((res) => res);
    if(searchCorporativeCharges.error){ return  { status: false, code: 500, message: searchCorporativeCharges.error }; }
    if(searchCorporativeCharges.result.rowsAffected > 0){
        let jsonList = [];
        for(let i = 0; i < searchCorporativeCharges.result.recordset.length; i++) {
            jsonList.push({
                ccarga: searchCorporativeCharges.result.recordset[i].CCARGA,
                xcorredor: searchCorporativeCharges.result.recordset[i].XCORREDOR,
                xdescripcion: searchCorporativeCharges.result.recordset[i].XDESCRIPCION_L,
                xpoliza: searchCorporativeCharges.result.recordset[i].XPOLIZA,
                fcreacion: new Date(searchCorporativeCharges.result.recordset[i].FCREACION).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
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
            console.log(err.message);
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchCorporativeIssuanceCertificates' } });
        });
    }
});

const operationDetailCorporativeIssuanceCertificate = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        id: requestBody.id
    };
    let searchCorporativeIssuanceDetail = await bd.searchCorporativeIssuanceDetail(searchData).then((res) => res);
    if(searchCorporativeIssuanceDetail.error){ return  { status: false, code: 500, message: searchCorporativeIssuanceDetail.error }; }
    if(searchCorporativeIssuanceDetail.result.rowsAffected < 1){ return { status: false, code: 404, message: 'Corporative Issuance not found.' }; }
    return {
        status: true,
        id: searchCorporativeIssuanceDetail.result.recordset[0].ID,
        ccarga: searchCorporativeIssuanceDetail.result.recordset[0].CCARGA,
        clote: searchCorporativeIssuanceDetail.result.recordset[0].CLOTE,
        xpoliza: searchCorporativeIssuanceDetail.result.recordset[0].XPOLIZA,
        xcertificado: searchCorporativeIssuanceDetail.result.recordset[0].XCERTIFICADO,
        fcarga: changeDateFormat(searchCorporativeIssuanceDetail.result.recordset[0].FCARGA),
        xcliente: searchCorporativeIssuanceDetail.result.recordset[0].XCLIENTE,
        xdocidentidadcliente: searchCorporativeIssuanceDetail.result.recordset[0].XDOCIDENTIDADCLIENTE,
        xemailcliente: searchCorporativeIssuanceDetail.result.recordset[0].XEMAILCLIENTE,
        xpropietario: searchCorporativeIssuanceDetail.result.recordset[0].XPROPIETARIO,
        xdocidentidadpropietario: searchCorporativeIssuanceDetail.result.recordset[0].XDOCIDENTIDADPROPIETARIO,
        xemailpropietario: searchCorporativeIssuanceDetail.result.recordset[0].XEMAILPROPIETARIO,
        xmarca: searchCorporativeIssuanceDetail.result.recordset[0].XMARCA,
        xmodelo: searchCorporativeIssuanceDetail.result.recordset[0].XMODELO,
        xversion: searchCorporativeIssuanceDetail.result.recordset[0].XVERSION,
        cano: searchCorporativeIssuanceDetail.result.recordset[0].CANO,
        xtipo: searchCorporativeIssuanceDetail.result.recordset[0].XTIPO,
        xclase: searchCorporativeIssuanceDetail.result.recordset[0].XCLASE,
        xserialcarroceria: searchCorporativeIssuanceDetail.result.recordset[0].XSERIALCARROCERIA,
        xserialmotor: searchCorporativeIssuanceDetail.result.recordset[0].XSERIALMOTOR,
        xcolor: searchCorporativeIssuanceDetail.result.recordset[0].XCOLOR,
        ncapacidadpasajeros: searchCorporativeIssuanceDetail.result.recordset[0].NCAPACIDADPASAJEROS,
        xplaca: searchCorporativeIssuanceDetail.result.recordset[0].XPLACA,
        msuma_a_casco: searchCorporativeIssuanceDetail.result.recordset[0].MSUMA_A_CASCO,
        msuma_otros: searchCorporativeIssuanceDetail.result.recordset[0].MSUMA_OTROS,
        ptasa_aseguradora: searchCorporativeIssuanceDetail.result.recordset[0].PTASA_ASEGURADORA,
        mprima_casco: searchCorporativeIssuanceDetail.result.recordset[0].MPRIMA_CASCO,
        mprima_otros: searchCorporativeIssuanceDetail.result.recordset[0].XPLACA,
        mprima_catastrofico: searchCorporativeIssuanceDetail.result.recordset[0].MPRIMA_CATASTROFICO,
        mgastos_recuperacion: searchCorporativeIssuanceDetail.result.recordset[0].MGASTOS_RECUPERACION,
        mbasica_rcv: searchCorporativeIssuanceDetail.result.recordset[0].MBASICA_RCV,
        mexceso_limite: searchCorporativeIssuanceDetail.result.recordset[0].MEXCESO_LIMITE,
        mdefensa_penal: searchCorporativeIssuanceDetail.result.recordset[0].MDEFENSA_PENAL,
        mmuerte: searchCorporativeIssuanceDetail.result.recordset[0].MMUERTE,
        minvalidez: searchCorporativeIssuanceDetail.result.recordset[0].MINVALIDEZ,
        mgastos_medicos: searchCorporativeIssuanceDetail.result.recordset[0].MGASTOS_MEDICOS,
        mgastos_funerarios: searchCorporativeIssuanceDetail.result.recordset[0].MGASTOS_FUNERARIOS,
        mtotal_prima_aseg: searchCorporativeIssuanceDetail.result.recordset[0].MTOTAL_PRIMA_ASEG,
        mdeducible: searchCorporativeIssuanceDetail.result.recordset[0].MDEDUCIBLE,
        xtipo_deducible: searchCorporativeIssuanceDetail.result.recordset[0].XTIPO_DEDUCIBLE,
        ptasa_fondo_anual: searchCorporativeIssuanceDetail.result.recordset[0].PTASA_FONDO_ANUAL,
        mfondo_arys: searchCorporativeIssuanceDetail.result.recordset[0].MFONDO_ARYS,
        mmembresia: searchCorporativeIssuanceDetail.result.recordset[0].MMEMBRESIA,
        fdesde_pol: changeDateFormat(searchCorporativeIssuanceDetail.result.recordset[0].FDESDE_POL),
        fhasta_pol: changeDateFormat(searchCorporativeIssuanceDetail.result.recordset[0].FHASTA_POL)
    }
}

module.exports = router;