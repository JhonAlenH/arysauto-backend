const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');

function changeDateFormat (date) {
    let dateArray = date.toISOString().substring(0,10).split("-");
    return dateArray[2] + '-' + dateArray[1] + '-' + dateArray[0];
  }

router.route('/service-type-plan').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationServiceTypePlan(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationServiceTypePlan' } });
        });
    }
});

const operationServiceTypePlan = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    //if(!helper.validateRequestObj(requestBody, ['cpais', 'ccompania', 'ctiposervicio'])){ return { status: false, code: 400, message: 'Required params not found.' }; }
    let cplan = requestBody.cplan

    let getServiceTypePlan = await bd.getServiceTypePlanQuery(cplan).then((res) => res);
    if(getServiceTypePlan.error){ return { status: false, code: 500, message: getServiceTypePlan.error }; }
    let jsonArray = [];
    for(let i = 0; i < getServiceTypePlan.result.recordset.length; i++){
        jsonArray.push({ ctiposervicio: getServiceTypePlan.result.recordset[i].CTIPOSERVICIO, 
                         xtiposervicio: getServiceTypePlan.result.recordset[i].XTIPOSERVICIO, 
                       });
    }
    return { status: true, list: jsonArray }
}

router.route('/create').post((req, res) => {
    operationCreate(req.header('Authorization'), req.body).then((result) => {
        if(!result.status){
            res.status(result.code).json({ data: result });
            return;
        }
        res.json({ data: result });
    }).catch((err) => {
        console.log(err.message)
        res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCreate' } });
    });
});

const operationCreate = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    
    let userData = {
        xnombre: requestBody.xnombre.toUpperCase(),
        xapellido: requestBody.xapellido.toUpperCase(),
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
        cestado: requestBody.cestado ? requestBody.cestado : undefined,
        cciudad: requestBody.cciudad ? requestBody.cciudad : undefined,
        cpais: requestBody.cpais ? requestBody.cpais : undefined,
        icedula: requestBody.icedula ? requestBody.icedula : undefined,
        femision: requestBody.femision ,
        cusuario: requestBody.cusuario ? requestBody.cusuario : undefined,
        xzona_postal: requestBody.xzona_postal ? requestBody.xzona_postal : undefined,
        cestatusgeneral: 13
    };
    if(userData){
        let createContractServiceArys = await bd.createContractServiceArysQuery(userData).then((res) => res);
        if(createContractServiceArys.error){ return { status: false, code: 500, message: createContractServiceArys.error }; }
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

router.route('/detail').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationDetailContractArys(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message);
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationDetailContractArys' } });
        });
    }
});

const operationDetailContractArys = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        id: requestBody.id
    };
    let searchontractArysDetail = await bd.searchCorporativeIssuanceDetail(searchData).then((res) => res);
    if(searchontractArysDetail.error){ return  { status: false, code: 500, message: searchontractArysDetail.error }; }
    if(searchontractArysDetail.result.rowsAffected < 1){ return { status: false, code: 404, message: 'Corporative Issuance not found.' }; }
    if(searchontractArysDetail.result.rowsAffected != 0){
        planList = []
        for(let i = 0; i < searchontractArysDetail.result.recordset.length; i++){
            planList.push({
                xtiposervicio: searchontractArysDetail.result.recordset[i].XTIPOSERVICIO
            })
        }
    }
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
        fdesde_pol: changeDateFormat(searchCorporativeIssuanceDetail.result.recordset[0].FDESDE_POL),
        fhasta_pol: changeDateFormat(searchCorporativeIssuanceDetail.result.recordset[0].FHASTA_POL)
    }
}

module.exports = router;