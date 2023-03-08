const router = require('express').Router();
const bd = require('../src/bd');
const helper = require('../src/helper');

router.route('/search').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchClient(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchClient' } });
        });
    }
});

const operationSearchClient = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania,
        xcliente: requestBody.xcliente ? requestBody.xcliente.toUpperCase() : undefined,
        xdocidentidad: requestBody.xdocidentidad ? requestBody.xdocidentidad : undefined
    }
    let searchClient = await bd.searchClientQuery(searchData).then((res) => res);
    if(searchClient.error){ return  { status: false, code: 500, message: searchClient.error }; }
    if(searchClient.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Client not found.' }; }
    let jsonList = [];
    for(let i = 0; i < searchClient.result.recordset.length; i++){
        jsonList.push({
            ccliente: searchClient.result.recordset[i].CCLIENTE,
            xcliente: searchClient.result.recordset[i].XCLIENTE,
            xdocidentidad: searchClient.result.recordset[i].XDOCIDENTIDAD,
            bactivo: searchClient.result.recordset[i].BACTIVO
        });
    }
    return { status: true, list: jsonList };
}

router.route('/detail').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationDetailClient(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationDetailClient' } });
        });
    }
});

const operationDetailClient = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let clientData = {
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania,
        ccliente: requestBody.ccliente
    };
    let getClientData = await bd.getClientDataQuery(clientData).then((res) => res);
    if(getClientData.error){ return { status: false, code: 500, message: getClientData.error }; }
    if(getClientData.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Client not found.' }; }
    let representante;
    if(getClientData.result.recordset[0].XREPRESENTANTE){
        representante = getClientData.result.recordset[0].XREPRESENTANTE
    }else{
        representante = getClientData.result.recordset[0].XCLIENTE
    }
    let banks = [];
    let getClientBanksData = await bd.getClientBanksDataQuery(clientData.ccliente).then((res) => res);
    if(getClientBanksData.error){ return { status: false, code: 500, message: getClientBanksData.error }; }
    if(getClientBanksData.result.rowsAffected > 0){
        for(let i = 0; i < getClientBanksData.result.recordset.length; i++){
            let bank = {
                cbanco: getClientBanksData.result.recordset[i].CBANCO,
                xbanco: getClientBanksData.result.recordset[i].XBANCO,
                ctipocuentabancaria: getClientBanksData.result.recordset[i].CTIPOCUENTABANCARIA,
                xtipocuentabancaria: getClientBanksData.result.recordset[i].XTIPOCUENTABANCARIA,
                xnumerocuenta: getClientBanksData.result.recordset[i].XNUMEROCUENTA
            }
            banks.push(bank);
        }
    }
    let contacts = [];
    let getClietContactsData = await bd.getClientContactsDataQuery(clientData.ccliente).then((res) => res);
    if(getClietContactsData.error){ return { status: false, code: 500, message: getClietContactsData.error }; }
    if(getClietContactsData.result.rowsAffected > 0){
        for(let i = 0; i < getClietContactsData.result.recordset.length; i++){
            let contact = {
                ccontacto: getClietContactsData.result.recordset[i].CCONTACTO,
                xnombre: getClietContactsData.result.recordset[i].XNOMBRE,
                xapellido: getClietContactsData.result.recordset[i].XAPELLIDO,
                icedula: getClietContactsData.result.recordset[i].ICEDULA,
                xdocidentidad: getClietContactsData.result.recordset[i].XDOCIDENTIDAD,
                xtelefonocelular: getClietContactsData.result.recordset[i].XTELEFONOCELULAR,
                xemail: getClietContactsData.result.recordset[i].XEMAIL,
                xcargo: getClietContactsData.result.recordset[i].XCARGO ? getClietContactsData.result.recordset[i].XCARGO : undefined,
                xtelefonocasa: getClietContactsData.result.recordset[i].XTELEFONOCASA ? getClietContactsData.result.recordset[i].XTELEFONOCASA : undefined,
                xtelefonooficina: getClietContactsData.result.recordset[i].XTELEFONOOFICINA ? getClietContactsData.result.recordset[i].XTELEFONOOFICINA : undefined,
            }
            contacts.push(contact);
        }
    }
    let documents = [];
    let getClientDocumentsData = await bd.getClientDocumentsDataQuery(clientData.ccliente).then((res) => res);
    if(getClientDocumentsData.error){ return { status: false, code: 500, message: getClientDocumentsData.error }; }
    if(getClientDocumentsData.result.rowsAffected > 0){
        for(let i = 0; i < getClientDocumentsData.result.recordset.length; i++){
            let document = {
                cdocumento: getClientDocumentsData.result.recordset[i].CDOCUMENTO,
                xdocumento: getClientDocumentsData.result.recordset[i].XDOCUMENTO,
                xrutaarchivo: getClientDocumentsData.result.recordset[i].XRUTAARCHIVO
            }
            documents.push(document);
        }
    }
    return { 
        status: true,
        ccliente: getClientData.result.recordset[0].CCLIENTE,
        xcliente: getClientData.result.recordset[0].XCLIENTE,
        xrepresentante: representante,
        icedula: getClientData.result.recordset[0].ICEDULA,
        xdocidentidad: getClientData.result.recordset[0].XDOCIDENTIDAD,
        cestado: getClientData.result.recordset[0].CESTADO,
        cciudad: getClientData.result.recordset[0].CCIUDAD,
        xestado: getClientData.result.recordset[0].XESTADO,
        xciudad: getClientData.result.recordset[0].XCIUDAD,
        xdireccionfiscal: getClientData.result.recordset[0].XDIRECCIONFISCAL,
        xemail: getClientData.result.recordset[0].XEMAIL,
        finicio: getClientData.result.recordset[0].FINICIO,
        xtelefono: getClientData.result.recordset[0].XTELEFONO ? getClientData.result.recordset[0].XTELEFONO : undefined,
        xpaginaweb: getClientData.result.recordset[0].XPAGINAWEB ? getClientData.result.recordset[0].XPAGINAWEB : undefined,
        xrutaimagen: getClientData.result.recordset[0].XRUTAIMAGEN ? getClientData.result.recordset[0].XRUTAIMAGEN : undefined,
        bactivo: getClientData.result.recordset[0].BACTIVO,
        banks: banks,
        contacts: contacts,
        documents: documents
    }
}

router.route('/create').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code:400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationCreateClient(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCreateClient' } });
        });
    }
});

const operationCreateClient = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let clientData = {
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania,
        xcliente: requestBody.xcliente.toUpperCase(),
        xrepresentante: requestBody.xrepresentante.toUpperCase() ? requestBody.xrepresentante: null,
        icedula: requestBody.icedula ? requestBody.icedula: null,
        xdocidentidad: requestBody.xdocidentidad.toUpperCase() ? requestBody.xdocidentidad: null,
        cestado: requestBody.cestado ? requestBody.cestado: null,
        cciudad: requestBody.cciudad ? requestBody.cciudad: null,
        xdireccionfiscal: requestBody.xdireccionfiscal.toUpperCase() ? requestBody.xdocidentidad: null,
        xemail: requestBody.xemail.toUpperCase() ? requestBody.xemail: null,
        finicio: requestBody.finicio ? requestBody.finicio: null,
        xtelefono: requestBody.xtelefono ? requestBody.xtelefono : null,
        xpaginaweb: requestBody.xpaginaweb.toUpperCase() ? requestBody.xpaginaweb : null,
        xrutaimagen: requestBody.xrutaimagen ? requestBody.xrutaimagen : null,
        bactivo: requestBody.bactivo,
        cusuariocreacion: requestBody.cusuariocreacion
    }

    let createClient = await bd.createClientQuery(clientData).then((res) => res);
    if(createClient.error){return { status: false, code: 500, message: createClient.error }; }
    if(createClient.result.rowsAffected > 0){
        if(requestBody.banks){
            let bankList = [];
            for(let i = 0; i < requestBody.banks.length; i++){
                bankList.push({
                    cbanco: requestBody.banks[i].cbanco,
                    xbanco: requestBody.banks[i].xbanco,
                    ctipocuentabancaria: requestBody.banks[i].ctipocuentabancaria,
                    xtipocuentabancaria: requestBody.banks[i].xtipocuentabancaria,
                    xnumerocuenta: requestBody.banks[i].xnumerocuenta
                })
            }
            let createBanksFromClient = await bd.createBanksFromClientQuery(clientData, bankList, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createBanksFromClient.error){return { status: false, code: 500, message: createBanksFromClient.error }; }
        }
        if(requestBody.contacts){
            let contactsList = [];
            for(let i = 0; i < requestBody.contacts.length; i++){
                contactsList.push({
                    xnombre: requestBody.contacts[i].xnombre,
                    xapellido: requestBody.contacts[i].xapellido,
                    icedula: requestBody.contacts[i].icedula,
                    xdocidentidad: requestBody.contacts[i].xdocidentidad,
                    xtelefonocelular: requestBody.contacts[i].xtelefonocelular,
                    xemail: requestBody.contacts[i].xemail,
                    xcargo: requestBody.contacts[i].xcargo,
                    xtelefonocasa: requestBody.contacts[i].xtelefonocasa,
                    xtelefonooficina: requestBody.contacts[i].xtelefonooficina,
                })
            }
            let createContactsFromClient = await bd.createContactsFromClientQuery(clientData, contactsList, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createContactsFromClient.error){return { status: false, code: 500, message: createContactsFromClient.error }; }
        }
        if(requestBody.documents){
            let documentsList = [];
            for(let i = 0; i < requestBody.documents.length; i++){
                documentsList.push({
                    xrutaarchivo: requestBody.documents[i].xrutaarchivo
                })
            }
            let createDocumentsFromClient = await bd.createDocumentsFromClientQuery(clientData, documentsList, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createDocumentsFromClient.error){return { status: false, code: 500, message: createDocumentsFromClient.error }; }
        }
        return{status: true, ccliente: createClient.result.recordset[0].CCLIENTE}
    }
}

router.route('/update').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code:400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationUpdateClient(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationUpdateClient' } });
        });
    }
});

const operationUpdateClient = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let clientData = {
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania,
        ccliente: requestBody.ccliente,
        xcliente: requestBody.xcliente.toUpperCase(),
        xrepresentante: requestBody.xrepresentante.toUpperCase() ? requestBody.xrepresentante: null,
        icedula: requestBody.icedula ? requestBody.icedula: null,
        xdocidentidad: requestBody.xdocidentidad.toUpperCase() ? requestBody.xdocidentidad: null,
        cestado: requestBody.cestado ? requestBody.cestado: null,
        cciudad: requestBody.cciudad ? requestBody.cciudad: null,
        xdireccionfiscal: requestBody.xdireccionfiscal.toUpperCase() ? requestBody.xdocidentidad: null,
        xemail: requestBody.xemail.toUpperCase() ? requestBody.xemail: null,
        finicio: requestBody.finicio ? requestBody.finicio: null,
        xtelefono: requestBody.xtelefono ? requestBody.xtelefono : null,
        xpaginaweb: requestBody.xpaginaweb.toUpperCase() ? requestBody.xpaginaweb : null,
        xrutaimagen: requestBody.xrutaimagen ? requestBody.xrutaimagen : null,
        bactivo: requestBody.bactivo,
        cusuariomodificacion: requestBody.cusuariomodificacion
    }

    let createClient = await bd.createClientQuery(clientData).then((res) => res);
    if(createClient.error){return { status: false, code: 500, message: createClient.error }; }
    if(requestBody.banks){
        if(requestBody.banks.create){

        }
        let bankList = [];
        for(let i = 0; i < requestBody.banks.length; i++){
            bankList.push({
                cbanco: requestBody.banks[i].cbanco,
                xbanco: requestBody.banks[i].xbanco,
                ctipocuentabancaria: requestBody.banks[i].ctipocuentabancaria,
                xtipocuentabancaria: requestBody.banks[i].xtipocuentabancaria,
                xnumerocuenta: requestBody.banks[i].xnumerocuenta
            })
        }
        let createBanksFromClient = await bd.createBanksFromClientQuery(clientData, bankList, createClient.result.recordset[0].CCLIENTE).then((res) => res);
        if(createBanksFromClient.error){return { status: false, code: 500, message: createBanksFromClient.error }; }
    }
    if(requestBody.contacts){
        let contactsList = [];
        for(let i = 0; i < requestBody.contacts.length; i++){
            contactsList.push({
                xnombre: requestBody.contacts[i].xnombre,
                xapellido: requestBody.contacts[i].xapellido,
                icedula: requestBody.contacts[i].icedula,
                xdocidentidad: requestBody.contacts[i].xdocidentidad,
                xtelefonocelular: requestBody.contacts[i].xtelefonocelular,
                xemail: requestBody.contacts[i].xemail,
                xcargo: requestBody.contacts[i].xcargo,
                xtelefonocasa: requestBody.contacts[i].xtelefonocasa,
                xtelefonooficina: requestBody.contacts[i].xtelefonooficina,
            })
        }
        let createContactsFromClient = await bd.createContactsFromClientQuery(clientData, contactsList, createClient.result.recordset[0].CCLIENTE).then((res) => res);
        if(createContactsFromClient.error){return { status: false, code: 500, message: createContactsFromClient.error }; }
    }
    if(requestBody.documents){
        let documentsList = [];
        for(let i = 0; i < requestBody.documents.length; i++){
            documentsList.push({
                xrutaarchivo: requestBody.documents[i].xrutaarchivo
            })
        }
        let createDocumentsFromClient = await bd.createDocumentsFromClientQuery(clientData, documentsList, createClient.result.recordset[0].CCLIENTE).then((res) => res);
        if(createDocumentsFromClient.error){return { status: false, code: 500, message: createDocumentsFromClient.error }; }
    }
    return{status: true, ccliente: createClient.result.recordset[0].CCLIENTE}
    
}

module.exports = router;