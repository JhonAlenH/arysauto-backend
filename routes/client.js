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
        xcliente: requestBody.xcliente ? requestBody.xcliente: null,
        xrepresentante: requestBody.xrepresentante ? requestBody.xrepresentante: null,
        icedula: requestBody.icedula ? requestBody.icedula: null,
        xdocidentidad: requestBody.xdocidentidad ? requestBody.xdocidentidad: null,
        cestado: requestBody.cestado ? requestBody.cestado: null,
        cciudad: requestBody.cciudad ? requestBody.cciudad: null,
        xdireccionfiscal: requestBody.xdireccionfiscal ? requestBody.xdireccionfiscal: null,
        xemail: requestBody.xemail ? requestBody.xemail: null,
        finicio: requestBody.finicio ? requestBody.finicio: null,
        xtelefono: requestBody.xtelefono ? requestBody.xtelefono : null,
        xpaginaweb: requestBody.xpaginaweb ? requestBody.xpaginaweb : null,
        xrutaimagen: requestBody.xrutaimagen ? requestBody.xrutaimagen : null,
        bactivo: requestBody.bactivo,
        cusuariomodificacion: requestBody.cusuariomodificacion
    }
    console.log(clientData)
    let updateClient = await bd.updateClientQuery(clientData).then((res) => res);
    if(updateClient.error){return { status: false, code: 500, message: updateClient.error }; }
    if(requestBody.banks){
        if(requestBody.banks.create){
            let createBankList = [];
            for(let i = 0; i < requestBody.banks.create.length; i++){
                createBankList.push({
                    cbanco: requestBody.banks.create[i].cbanco,
                    xbanco: requestBody.banks.create[i].xbanco,
                    ctipocuentabancaria: requestBody.banks.create[i].ctipocuentabancaria,
                    xtipocuentabancaria: requestBody.banks.create[i].xtipocuentabancaria,
                    xnumerocuenta: requestBody.banks.create[i].xnumerocuenta
                })
            }
            let createBanksFromClient = await bd.createBanksByClientUpdateQuery(clientData, createBankList).then((res) => res);
            if(createBanksFromClient.error){return { status: false, code: 500, message: createBanksFromClient.error }; }
        }
        if(requestBody.banks.update){
            let updateBankList = [];
            for(let i = 0; i < requestBody.banks.update.length; i++){
                updateBankList.push({
                    cbanco: requestBody.banks.update[i].cbanco,
                    xbanco: requestBody.banks.update[i].xbanco,
                    ctipocuentabancaria: requestBody.banks.update[i].ctipocuentabancaria,
                    xtipocuentabancaria: requestBody.banks.update[i].xtipocuentabancaria,
                    xnumerocuenta: requestBody.banks.update[i].xnumerocuenta
                })
            }
            let updateBanksFromClient = await bd.updateBanksByClientUpdateQuery(clientData, updateBankList).then((res) => res);
            if(updateBanksFromClient.error){return { status: false, code: 500, message: updateBanksFromClient.error }; }
        }
    }
    if(requestBody.contacts){
        if(requestBody.contacts.create){
            let createContactsList = [];
            for(let i = 0; i < requestBody.contacts.create.length; i++){
                createContactsList.push({
                    xnombre: requestBody.contacts.create[i].xnombre,
                    xapellido: requestBody.contacts.create[i].xapellido,
                    icedula: requestBody.contacts.create[i].icedula,
                    xdocidentidad: requestBody.contacts.create[i].xdocidentidad,
                    xtelefonocelular: requestBody.contacts.create[i].xtelefonocelular,
                    xemail: requestBody.contacts.create[i].xemail,
                    xcargo: requestBody.contacts.create[i].xcargo,
                    xtelefonocasa: requestBody.contacts.create[i].xtelefonocasa,
                    xtelefonooficina: requestBody.contacts.create[i].xtelefonooficina,
                })
            }
            let createContactsFromClient = await bd.createContactsFromClientQuery(clientData, createContactsList).then((res) => res);
            if(createContactsFromClient.error){return { status: false, code: 500, message: createContactsFromClient.error }; }
        }
        if(requestBody.contacts.update){
            let updateContactsList = [];
            for(let i = 0; i < requestBody.contacts.update.length; i++){
                updateContactsList.push({
                    ccontacto: requestBody.contacts.update[i].ccontacto,
                    xnombre: requestBody.contacts.update[i].xnombre,
                    xapellido: requestBody.contacts.update[i].xapellido,
                    icedula: requestBody.contacts.update[i].icedula,
                    xdocidentidad: requestBody.contacts.update[i].xdocidentidad,
                    xtelefonocelular: requestBody.contacts.update[i].xtelefonocelular,
                    xemail: requestBody.contacts.update[i].xemail,
                    xcargo: requestBody.contacts.update[i].xcargo,
                    xtelefonocasa: requestBody.contacts.update[i].xtelefonocasa,
                    xtelefonooficina: requestBody.contacts.update[i].xtelefonooficina,
                })
            }
            let updateContactsFromClient = await bd.updateContactsByClientUpdateQuery(clientData, updateContactsList).then((res) => res);
            if(updateContactsFromClient.error){return { status: false, code: 500, message: updateContactsFromClient.error }; }
        }
    }
    if(requestBody.documents){
        if(requestBody.documents.create){
            console.log(requestBody.documents.create)
            let createDocumentsList = [];
            for(let i = 0; i < requestBody.documents.create.length; i++){
                createDocumentsList.push({
                    xdocumento: requestBody.documents.create[i].xdocumento,
                    xrutaarchivo: requestBody.documents.create[i].xrutaarchivo
                })
            }
            let createDocumentsFromClient = await bd.createDocumentsFromClientQuery(clientData, createDocumentsList).then((res) => res);
            if(createDocumentsFromClient.error){return { status: false, code: 500, message: createDocumentsFromClient.error }; }
        }
        if(requestBody.documents.update){
            let updateDocumentsList = [];
            for(let i = 0; i < requestBody.documents.update.length; i++){
                updateDocumentsList.push({
                    cdocumento: requestBody.documents.update[i].cdocumento,
                    xrutaarchivo: requestBody.documents.update[i].xrutaarchivo
                })
            }
            let updateDocumentsFromClient = await bd.updateDocumentsByClientUpdateQuery(clientData, updateDocumentsList).then((res) => res);
            if(updateDocumentsFromClient.error){return { status: false, code: 500, message: updateDocumentsFromClient.error }; }
        }
    }
    return{status: true, ccliente: clientData.ccliente}
    
}

module.exports = router;