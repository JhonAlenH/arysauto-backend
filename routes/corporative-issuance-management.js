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

router.route('/search-receipt').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationSearchReceipt(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message);
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchReceipt' } });
        });
    }
});

const operationSearchReceipt = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        ccarga: requestBody.ccarga
    };
    let planList = [];
    let searchPlan= await bd.searchPlanFromCorporativeQuery(searchData).then((res) => res);
    if(searchPlan.error){ return  { status: false, code: 500, message: searchPlan.error }; }
    if(searchPlan.result.rowsAffected > 0){
        for(let i = 0; i < searchPlan.result.recordset.length; i++){
            planList.push({
                cplan: searchPlan.result.recordset[i].CPLAN,
                xplan: searchPlan.result.recordset[i].XPLAN,
            })
        }
    }
    let searchReceipt= await bd.searchReceiptQuery(searchData).then((res) => res);
    if(searchReceipt.error){ return  { status: false, code: 500, message: searchReceipt.error }; }
    if(searchReceipt.result.rowsAffected < 1){ return { status: false, code: 404, message: 'Corporative Issuance not found.' }; }
    return {
        status: true,
        ccarga: searchReceipt.result.recordset[0].CCARGA,
        ccliente: searchReceipt.result.recordset[0].CCLIENTE,
        fdesde_pol: searchReceipt.result.recordset[0].FDESDE_POL,
        fhasta_pol: searchReceipt.result.recordset[0].FHASTA_POL,
        plan: planList
    }
}

router.route('/create-inclusion-contract').post((req, res) => {
    operationCreateInclusionContract(req.header('Authorization'), req.body).then((result) => {
        if(!result.status){
            res.status(result.code).json({ data: result });
            return;
        }
        res.json({ data: result });
    }).catch((err) => {
        console.log(err.message)
        res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCreateInclusionContract' } });
    });
});

const operationCreateInclusionContract = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    
    let userData = {
        xnombre: requestBody.xnombre.toUpperCase(),
        cano: requestBody.cano ? requestBody.cano : undefined,
        xcolor: requestBody.xcolor ? requestBody.xcolor : undefined,
        cmarca: requestBody.cmarca ? requestBody.cmarca : undefined,
        cmodelo: requestBody.cmodelo ? requestBody.cmodelo : undefined,
        cversion: requestBody.cversion ? requestBody.cversion : undefined,
        xrif_cliente: requestBody.xrif_cliente ? requestBody.xrif_cliente : undefined,
        email: requestBody.email ? requestBody.email : undefined,
        xtelefono_prop: requestBody.xtelefono_prop ? requestBody.xtelefono_prop : undefined,
        xdireccionfiscal: requestBody.xdireccionfiscal.toUpperCase(),
        xserialmotor: requestBody.xserialmotor.toUpperCase(),
        xserialcarroceria: requestBody.xserialcarroceria.toUpperCase(),
        xplaca: requestBody.xplaca.toUpperCase(),
        xtelefono_emp: requestBody.xtelefono_emp,
        cplan: requestBody.cplan,
        xcedula:requestBody.xcedula,
        ncapacidad_p: requestBody.ncapacidad_p,
        // cestado: requestBody.cestado ? requestBody.cestado : undefined,
        // cciudad: requestBody.cciudad ? requestBody.cciudad : undefined,
        // cpais: requestBody.cpais ? requestBody.cpais : undefined,
        icedula: requestBody.icedula ? requestBody.icedula : undefined,
        femision: requestBody.femision ,
        cusuariocreacion: requestBody.cusuario ? requestBody.cusuario : undefined,
        fdesde_pol: requestBody.fdesde_pol,
        fhasta_pol: requestBody.fhasta_pol,
        ccarga: requestBody.ccarga,
        clote: requestBody.clote,
        msuma_a_casco: requestBody.msuma_a_casco,
        mdeducible: requestBody.mdeducible,
        xpoliza: requestBody.xpoliza,
        xcertificado: requestBody.xcertificado,
    };
    console.log(userData)
    if(userData){
        let createInclusionContract = await bd.createInclusionContractQuery(userData).then((res) => res);
        if(createInclusionContract.error){ return { status: false, code: 500, message: createInclusionContract.error }; }
    }
    // let lastQuote = await bd.getLastQuoteQuery();
    // if(lastQuote.error){ return { status: false, code: 500, message: lastQuote.error }; }
    return { 
        status: true, 
        code: 200, 
        // xnombre: lastQuote.result.recordset[0].XNOMBRE, 
        // xapellido: lastQuote.result.recordset[0].XAPELLIDO, 
        // icedula: lastQuote.result.recordset[0].ICEDULA, 
        // xcedula: lastQuote.result.recordset[0].XCEDULA, 
        // xserialcarroceria: lastQuote.result.recordset[0].XSERIALCARROCERIA, 
        // xserialmotor: lastQuote.result.recordset[0].XSERIALMOTOR, 
        // xplaca: lastQuote.result.recordset[0].XPLACA, 
        // xmarca: lastQuote.result.recordset[0].XMARCA, 
        // xmodelo: lastQuote.result.recordset[0].XMODELO, 
        // xversion: lastQuote.result.recordset[0].XVERISON, 
        // cano: lastQuote.result.recordset[0].CANO, 
        // xestatusgeneral: lastQuote.result.recordset[0].XESTATUSGENERAL, 
        // xtipovehiculo: lastQuote.result.recordset[0].XTIPOVEHICULO, 
        // xuso: lastQuote.result.recordset[0].XUSO, 
        // xclase: lastQuote.result.recordset[0].XCLASE, 
        // xtomador: lastQuote.result.recordset[0].XTOMADOR, 
        // xprofesion: lastQuote.result.recordset[0].XPROFESION, 
        // xrif: lastQuote.result.recordset[0].XRIF, 
    };
}

module.exports = router;