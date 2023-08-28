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
    let associates = [];
    let getClientAssociatesData = await bd.getClientAssociatesDataQuery(clientData.ccliente).then((res) => res);
    if(getClientAssociatesData.error){ return { status: false, code: 500, message: getClientAssociatesData.error }; }
    if(getClientAssociatesData.result.rowsAffected > 0){
        for(let i = 0; i < getClientAssociatesData.result.recordset.length; i++){
            let associate = {
                casociado: getClientAssociatesData.result.recordset[i].CASOCIADO,
                xasociado: getClientAssociatesData.result.recordset[i].XASOCIADO,
            }
            associates.push(associate);
        }
    }
    let bonds = [];
    let getClientBondsData = await bd.getClientBondsDataQuery(clientData.ccliente).then((res) => res);
    if(getClientBondsData.error){ return { status: false, code: 500, message: getClientBondsData.error }; }
    if(getClientBondsData.result.rowsAffected > 0){
        for(let i = 0; i < getClientBondsData.result.recordset.length; i++){
            let bond = {
                cbono: getClientBondsData.result.recordset[i].CBONO,
                pbono: getClientBondsData.result.recordset[i].PBONO,
                mbono: getClientBondsData.result.recordset[i].MBONO,
                fefectiva: getClientBondsData.result.recordset[i].FEFECTIVA,
            }
            bonds.push(bond);
        }
    }
    let brokers = [];
    let getClientBrokersData = await bd.getClientBrokersDataQuery(clientData.ccliente).then((res) => res);
    if(getClientBrokersData.error){ return { status: false, code: 500, message: getClientBrokersData.error }; }
    if(getClientBrokersData.result.rowsAffected > 0){
        for(let i = 0; i < getClientBrokersData.result.recordset.length; i++){
            let broker = {
                ccorredor: getClientBrokersData.result.recordset[i].CCORREDOR,
                xcorredor: getClientBrokersData.result.recordset[i].XCORREDOR,
                pcorredor: getClientBrokersData.result.recordset[i].PCORREDOR,
                mcorredor: getClientBrokersData.result.recordset[i].MCORREDOR,
                fefectiva: getClientBrokersData.result.recordset[i].FEFECTIVA,
            }
            brokers.push(broker);
        }
    }
    let depreciations = [];
    let getClientDepreciationData = await bd.getClientDepreciationsDataQuery(clientData.ccliente).then((res) => res);
    if(getClientDepreciationData.error){ return { status: false, code: 500, message: getClientDepreciationData.error }; }
    if(getClientDepreciationData.result.rowsAffected > 0){
        for(let i = 0; i < getClientDepreciationData.result.recordset.length; i++){
            let depreciation = {
                cdepreciacion: getClientDepreciationData.result.recordset[i].CDEPRECIACION,
                xdepreciacion: getClientDepreciationData.result.recordset[i].XDEPRECIACION,
                pdepreciacion: getClientDepreciationData.result.recordset[i].PDEPRECIACION,
                mdepreciacion: getClientDepreciationData.result.recordset[i].MDEPRECIACION,
                fefectiva: getClientDepreciationData.result.recordset[i].FEFECTIVA,
            }
            depreciations.push(depreciation);
        }
    }
    let relationships = [];
    let getClientRelationshipsData = await bd.getClientRelationshipDataQuery(clientData.ccliente).then((res) => res);
    if(getClientRelationshipsData.error){ return { status: false, code: 500, message: getClientRelationshipsData.error }; }
    if(getClientRelationshipsData.result.rowsAffected > 0){
        for(let i = 0; i < getClientRelationshipsData.result.recordset.length; i++){
            let relationship = {
                cparentesco: getClientRelationshipsData.result.recordset[i].CPARENTESCO,
                xparentesco: getClientRelationshipsData.result.recordset[i].XPARENTESCO,
                xobservacion: getClientRelationshipsData.result.recordset[i].XOBSERVACION,
                fefectiva: getClientDepreciationData.result.recordset[i].FEFECTIVA,
            }
            relationships.push(relationship);
        }
    }
    let penalties = [];
    let getClientPenaltiesData = await bd.getClientPenaltiesDataQuery(clientData.ccliente).then((res) => res);
    if(getClientPenaltiesData.error){ return { status: false, code: 500, message: getClientPenaltiesData.error }; }
    if(getClientPenaltiesData.result.rowsAffected > 0){
        for(let i = 0; i < getClientPenaltiesData.result.recordset.length; i++){
            let penalty = {
                cpenalizacion: getClientPenaltiesData.result.recordset[i].CPENALIZACION,
                xpenalizacion: getClientPenaltiesData.result.recordset[i].XPENALIZACION,
                ppenalizacion: getClientPenaltiesData.result.recordset[i].PPENALIZACION,
                mpenalizacion: getClientPenaltiesData.result.recordset[i].MPENALIZACION,
                fefectiva: getClientPenaltiesData.result.recordset[i].FEFECTIVA,
            }
            penalties.push(penalty);
        }
    }
    let providers = [];
    let getClientProvidersData = await bd.getClientProvidersDataQuery(clientData.ccliente).then((res) => res);
    if(getClientProvidersData.error){ return { status: false, code: 500, message: getClientProvidersData.error }; }
    if(getClientProvidersData.result.rowsAffected > 0){
        for(let i = 0; i < getClientProvidersData.result.recordset.length; i++){
            let provider = {
                cproveedor: getClientProvidersData.result.recordset[i].CPROVEEDOR,
                xnombre: getClientProvidersData.result.recordset[i].XNOMBRE,
                xobservacion: getClientProvidersData.result.recordset[i].XOBSERVACION,
                fefectiva: getClientProvidersData.result.recordset[i].FEFECTIVA,
            }
            providers.push(provider);
        }
    }
    let models = [];
    let getClientModelsData = await bd.getClientModelsDataQuery(clientData.ccliente).then((res) => res);
    if(getClientModelsData.error){ return { status: false, code: 500, message: getClientModelsData.error }; }
    if(getClientModelsData.result.rowsAffected > 0){
        for(let i = 0; i < getClientModelsData.result.recordset.length; i++){
            let model = {
                cmodelo: getClientModelsData.result.recordset[i].CMODELO,
                xmodelo: getClientModelsData.result.recordset[i].XMODELO,
                cmarca: getClientModelsData.result.recordset[i].CMARCA,
                xmarca: getClientModelsData.result.recordset[i].XMARCA,
                xobservacion: getClientModelsData.result.recordset[i].XOBSERVACION,
            }
            models.push(model);
        }
    }
    let workers = [];
    let getClientWorkersData = await bd.getClientWorkersDataQuery(clientData.ccliente).then((res) => res);
    if(getClientWorkersData.error){ return { status: false, code: 500, message: getClientWorkersData.error }; }
    if(getClientWorkersData.result.rowsAffected > 0){
        for(let i = 0; i < getClientWorkersData.result.recordset.length; i++){
            let worker = {
                ctrabajador: getClientWorkersData.result.recordset[i].CTRABAJADOR,
                xnombre: getClientWorkersData.result.recordset[i].XNOMBRE,
                xapellido: getClientWorkersData.result.recordset[i].XAPELLIDO,
                ctipodocidentidad: getClientWorkersData.result.recordset[i].CTIPODOCIDENTIDAD,
                xdocidentidad: getClientWorkersData.result.recordset[i].XDOCIDENTIDAD,
                xtelefonocelular: getClientWorkersData.result.recordset[i].XTELEFONOCELULAR,
                xemail: getClientWorkersData.result.recordset[i].XEMAIL,
                xprofesion: getClientWorkersData.result.recordset[i].XPROFESION,
                xtelefonocasa: getClientWorkersData.result.recordset[i].XTELEFONOCASA,
                xocupacion: getClientWorkersData.result.recordset[i].XOCUPACION,
                xfax: getClientWorkersData.result.recordset[i].XFAX,
                cparentesco: getClientWorkersData.result.recordset[i].CPARENTESCO,
                cestadocivil: getClientWorkersData.result.recordset[i].CESTADOCIVIL,
                cestado: getClientWorkersData.result.recordset[i].CESTADO,
                cciudad: getClientWorkersData.result.recordset[i].CCIUDAD,
                xdireccion: getClientWorkersData.result.recordset[i].XDIRECCION,
                fnacimiento: getClientWorkersData.result.recordset[i].FNACIMIENTO
            }
            workers.push(worker);
        }
    }
    let groupers = [];
    let getClientGroupersData = await bd.getClientGroupersDataQuery(clientData.ccliente).then((res) => res);
    if(getClientGroupersData.error){ return { status: false, code: 500, message: getClientGroupersData.error }; }
    if(getClientGroupersData.result.rowsAffected > 0){
        for(let i = 0; i < getClientGroupersData.result.recordset.length; i++){
            let banks = [];
            let getGrouperBanksData = await bd.getGrouperBanksDataQuery(getClientGroupersData.result.recordset[i].CAGRUPADOR).then((res) => res);
            if(getGrouperBanksData.error){ return { status: false, code: 500, message: getGrouperBanksData.error }; }
            if(getGrouperBanksData.result.rowsAffected > 0){
                for(let i = 0; i < getGrouperBanksData.result.recordset.length; i++){
                    let bank = {
                        cbanco: getGrouperBanksData.result.recordset[i].CBANCO,
                        xbanco: getGrouperBanksData.result.recordset[i].XBANCO,
                        ctipocuentabancaria: getGrouperBanksData.result.recordset[i].CTIPOCUENTABANCARIA,
                        xtipocuentabancaria: getGrouperBanksData.result.recordset[i].XTIPOCUENTABANCARIA,
                        xnumerocuenta: getGrouperBanksData.result.recordset[i].XNUMEROCUENTA,
                        xcontrato: getGrouperBanksData.result.recordset[i].XCONTRATO,
                        bprincipal: getGrouperBanksData.result.recordset[i].BPRINCIPAL,
                    }
                    banks.push(bank);
                }
            }
            let grouper = {
                cagrupador: getClientGroupersData.result.recordset[i].CAGRUPADOR,
                xcontratoalternativo: getClientGroupersData.result.recordset[i].XCONTRATOALTERNATIVO,
                xnombre: getClientGroupersData.result.recordset[i].XNOMBRE,
                xrazonsocial: getClientGroupersData.result.recordset[i].XRAZONSOCIAL,
                cestado: getClientGroupersData.result.recordset[i].CESTADO,
                cciudad: getClientGroupersData.result.recordset[i].CCIUDAD,
                xdireccionfiscal: getClientGroupersData.result.recordset[i].XDIRECCIONFISCAL,
                ctipodocidentidad: getClientGroupersData.result.recordset[i].CTIPODOCIDENTIDAD,
                xdocidentidad: getClientGroupersData.result.recordset[i].XDOCIDENTIDAD,
                bfacturar: getClientGroupersData.result.recordset[i].BFACTURAR,
                bcontribuyente: getClientGroupersData.result.recordset[i].BCONTRIBUYENTE,
                bimpuesto: getClientGroupersData.result.recordset[i].BIMPUESTO,
                xtelefono: getClientGroupersData.result.recordset[i].XTELEFONO,
                xfax: getClientGroupersData.result.recordset[i].XFAX,
                xemail: getClientGroupersData.result.recordset[i].XEMAIL,
                xrutaimagen: getClientGroupersData.result.recordset[0].XRUTAIMAGEN ? getClientGroupersData.result.recordset[0].XRUTAIMAGEN : undefined,
                bactivo: getClientGroupersData.result.recordset[i].BACTIVO,
                banks: banks
            }
            groupers.push(grouper);
        }
    }
    let plans = [];
    let getClientPlansData = await bd.getClientPlansDataQuery(clientData.ccliente).then((res) => res);
    if(getClientPlansData.error){ return { status: false, code: 500, message: getClientPlansData.error }; }
    if(getClientPlansData.result.rowsAffected > 0){
        for(let i = 0; i < getClientPlansData.result.recordset.length; i++){
            let plan = {
                cplancliente: getClientPlansData.result.recordset[i].CPLANCLIENTE,
                cplan: getClientPlansData.result.recordset[i].CPLAN,
                xplan: getClientPlansData.result.recordset[i].XPLAN,
                casociado: getClientPlansData.result.recordset[i].CASOCIADO,
                xasociado: getClientPlansData.result.recordset[i].XASOCIADO,
                ctipoplan: getClientPlansData.result.recordset[i].CTIPOPLAN,
                xtipoplan: getClientPlansData.result.recordset[i].XTIPOPLAN,
                fdesde: getClientPlansData.result.recordset[i].FDESDE,
                fhasta: getClientPlansData.result.recordset[i].FHASTA
            }
            plans.push(plan);
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
        documents: documents,
        associates: associates,
        bonds: bonds,
        brokers: brokers,
        depreciations: depreciations,
        relationships: relationships,
        penalties: penalties,
        providers: providers,
        models: models,
        workers: workers,
        groupers: groupers,
        plans: plans
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
        xpaginaweb: requestBody.xpaginaweb ? requestBody.xpaginaweb : null,
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
        if(requestBody.associates){
            let associates = [];
            for(let i = 0; i < requestBody.associates.length; i++){
                associates.push({
                    casociado: requestBody.associates[i].casociado
                })
            }
            let createAssociatesFromClient = await bd.createAssociatesFromClientQuery(clientData, associates, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createAssociatesFromClient.error){return { status: false, code: 500, message: createAssociatesFromClient.error }; }
        }
        if(requestBody.bonds){
            let bonds = [];
            for(let i = 0; i < requestBody.bonds.length; i++){
                bonds.push({
                    pbono: requestBody.bonds[i].pbono,
                    mbono: requestBody.bonds[i].mbono,
                    fefectiva: requestBody.bonds[i].fefectiva,
                })
            }
            let createBondsFromClient = await bd.createBondsFromClientQuery(clientData, bonds, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createBondsFromClient.error){return { status: false, code: 500, message: createBondsFromClient.error }; }
        }
        if(requestBody.brokers){
            let brokers = [];
            for(let i = 0; i < requestBody.brokers.length; i++){
                brokers.push({
                    ccorredor: requestBody.brokers[i].ccorredor,
                    pcorredor: requestBody.brokers[i].pcorredor,
                    mcorredor: requestBody.brokers[i].mcorredor,
                    fefectiva: requestBody.brokers[i].fefectiva,
                })
            }
            let createBrokersFromClient = await bd.createBrokersFromClientQuery(clientData, brokers, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createBrokersFromClient.error){return { status: false, code: 500, message: createBrokersFromClient.error }; }
        }
        if(requestBody.depreciations){
            let depreciations = [];
            for(let i = 0; i < requestBody.depreciations.length; i++){
                depreciations.push({
                    cdepreciacion: requestBody.depreciations[i].cdepreciacion,
                    pdepreciacion: requestBody.depreciations[i].pdepreciacion,
                    mdepreciacion: requestBody.depreciations[i].mdepreciacion,
                    fefectiva: requestBody.depreciations[i].fefectiva,
                })
            }
            let createDepreciationFromClient = await bd.createDepreciationsFromClientQuery(clientData, depreciations, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createDepreciationFromClient.error){return { status: false, code: 500, message: createDepreciationFromClient.error }; }
        }
        if(requestBody.relationships){
            let relationships = [];
            for(let i = 0; i < requestBody.relationships.length; i++){
                relationships.push({
                    cparentesco: requestBody.relationships[i].cparentesco,
                    xobservacion: requestBody.relationships[i].xobservacion,
                    fefectiva: requestBody.relationships[i].fefectiva,
                })
            }
            let createRelationshipsFromClient = await bd.createRelationshipsFromClientQuery(clientData, relationships, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createRelationshipsFromClient.error){return { status: false, code: 500, message: createRelationshipsFromClient.error }; }
        }
        if(requestBody.penalties){
            let penalties = [];
            for(let i = 0; i < requestBody.penalties.length; i++){
                penalties.push({
                    cpenalizacion: requestBody.penalties[i].cpenalizacion,
                    ppenalizacion: requestBody.penalties[i].ppenalizacion,
                    mpenalizacion: requestBody.penalties[i].mpenalizacion,
                    fefectiva: requestBody.penalties[i].fefectiva,
                })
            }
            let createPenaltiesFromClient = await bd.createPenaltiesFromClientQuery(clientData, penalties, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createPenaltiesFromClient.error){return { status: false, code: 500, message: createPenaltiesFromClient.error }; }
        }
        if(requestBody.providers){
            let providers = [];
            for(let i = 0; i < requestBody.providers.length; i++){
                providers.push({
                    cproveedor: requestBody.providers[i].cproveedor,
                    xobservacion: requestBody.providers[i].xobservacion,
                    fefectiva: requestBody.providers[i].fefectiva,
                })
            }
            let createProvidersFromClient = await bd.createProvidersFromClientQuery(clientData, providers, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createProvidersFromClient.error){return { status: false, code: 500, message: createProvidersFromClient.error }; }
        }
        if(requestBody.models){
            let models = [];
            for(let i = 0; i < requestBody.models.length; i++){
                models.push({
                    cmodelo: requestBody.models[i].cmodelo,
                    cmarca: requestBody.models[i].cmarca,
                    xobservacion: requestBody.models[i].xobservacion,
                })
            }
            let createModelsFromClient = await bd.createModelsFromClientQuery(clientData, models, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createModelsFromClient.error){return { status: false, code: 500, message: createModelsFromClient.error }; }
        }
        if(requestBody.workers){
            let workers = [];
            for(let i = 0; i < requestBody.workers.length; i++){
                workers.push({
                    xnombre: requestBody.workers[i].xnombre,
                    xapellido: requestBody.workers[i].xapellido,
                    ctipodocidentidad: requestBody.workers[i].ctipodocidentidad,
                    xdocidentidad: requestBody.workers[i].xdocidentidad,
                    xtelefonocelular: requestBody.workers[i].xtelefonocelular,
                    xemail: requestBody.workers[i].xemail,
                    xprofesion: requestBody.workers[i].xprofesion,
                    xfax: requestBody.workers[i].xfax,
                    xocupacion: requestBody.workers[i].xocupacion,
                    xtelefonocasa: requestBody.workers[i].xtelefonocasa,
                    cparentesco: requestBody.workers[i].cparentesco,
                    cciudad: requestBody.workers[i].cciudad,
                    cestado: requestBody.workers[i].cestado,
                    xdireccion: requestBody.workers[i].xdireccion,
                    fnacimiento: requestBody.workers[i].fnacimiento,
                    cestadocivil: requestBody.workers[i].cestadocivil
                })
            }
            let createWorkersFromClient = await bd.createWorkersFromClientQuery(clientData, workers, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createWorkersFromClient.error){return { status: false, code: 500, message: createWorkersFromClient.error }; }
        }
        if(requestBody.groupers){
            let createGroupersList = [];
            let createGroupersBanksList = [];
            for(let i = 0; i < requestBody.groupers.length; i++){
                createGroupersList.push({
                    xcontratoalternativo: requestBody.groupers[i].xcontratoalternativo,
                    xnombre: requestBody.groupers[i].xnombre,
                    xrazonsocial: requestBody.groupers[i].xrazonsocial,
                    cestado: requestBody.groupers[i].cestado,
                    cciudad: requestBody.groupers[i].cciudad,
                    xdireccionfiscal: requestBody.groupers[i].xdireccionfiscal,
                    ctipodocidentidad: requestBody.groupers[i].ctipodocidentidad,
                    xdocidentidad: requestBody.groupers[i].xdocidentidad,
                    bfacturar: requestBody.groupers[i].bfacturar,
                    bcontribuyente: requestBody.groupers[i].bcontribuyente,
                    bimpuesto: requestBody.groupers[i].bimpuesto,
                    xtelefono: requestBody.groupers[i].xtelefono,
                    xfax: requestBody.groupers[i].xfax ? requestBody.groupers[i].xfax : undefined,
                    xemail: requestBody.groupers[i].xemail,
                    xrutaimagen: requestBody.groupers[i].xrutaimagen ? requestBody.groupers[i].xrutaimagen : undefined,
                    bactivo: requestBody.groupers[i].bactivo,
                })
                if(requestBody.groupers[i].banks){
                    for(let j = 0; j < requestBody.groupers[i].banks.length; j++){
                        createGroupersBanksList.push({
                            cbanco: requestBody.groupers[i].banks[j].cbanco,
                            ctipocuentabancaria: requestBody.groupers[i].banks[j].ctipocuentabancaria,
                            xnumerocuenta: requestBody.groupers[i].banks[j].xnumerocuenta,
                            xcontrato: requestBody.groupers[i].banks[j].xcontrato,
                            bprincipal: requestBody.groupers[i].banks[j].bprincipal,
                        })
                    }
                }
            }
            let createGroupersByClient = await bd.createGroupersByClientQuery(clientData, createGroupersList, createGroupersBanksList, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createGroupersByClient.error){ return { status: false, code: 500, message: createGroupersByClientUpdate.error }; }
        }
        if(requestBody.plans){
            let plans = [];
            for(let i = 0; i < requestBody.plans.length; i++){
                plans.push({
                    cplan: requestBody.plans[i].cplan,
                    casociado: requestBody.plans[i].casociado,
                    ctipoplan: requestBody.plans[i].ctipoplan,
                    fdesde: requestBody.plans[i].fdesde,
                    fhasta: requestBody.plans[i].fhasta
                })
            }
            let createWorkersFromClient = await bd.createPlansFromClientQuery(clientData, plans, createClient.result.recordset[0].CCLIENTE).then((res) => res);
            if(createWorkersFromClient.error){return { status: false, code: 500, message: createWorkersFromClient.error }; }
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
        cusuariomodificacion: requestBody.cusuario,
        cusuariocreacion: requestBody.cusuario
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
            let createContactsFromClient = await bd.createContactsFromClientUpdateQuery(clientData, createContactsList).then((res) => res);
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
    if(requestBody.associates){
        if(requestBody.associates.create){
            let createAssociatesList = [];
            for(let i = 0; i < requestBody.associates.create.length; i++){
                createAssociatesList.push({
                    casociado: requestBody.associates.create[i].casociado,
                })
            }
            let createAssociatesFromClient = await bd.createAssociatesFromClientUpdateQuery(clientData, createAssociatesList).then((res) => res);
            if(createAssociatesFromClient.error){console.log(createAssociatesFromClient.error); return { status: false, code: 500, message: createAssociatesFromClient.error }; }
        }
        if(requestBody.associates.update){
            let updateAssociatesList = [];
            for(let i = 0; i < requestBody.associates.update.length; i++){
                updateAssociatesList.push({
                    casociado: requestBody.associates.update[i].casociado,
                })
            }
            let updateAssociatesFromClient = await bd.updateAssociatesByClientUpdateQuery(clientData, updateAssociatesList).then((res) => res);
            if(updateAssociatesFromClient.error){console.log(updateAssociatesFromClient.error);return { status: false, code: 500, message: updateAssociatesFromClient.error }; }
        }
    }
    if(requestBody.bonds){
        if(requestBody.bonds.create){
            let createBondsList = [];
            for(let i = 0; i < requestBody.bonds.create.length; i++){
                createBondsList.push({
                    pbono: requestBody.bonds.create[i].pbono,
                    mbono: requestBody.bonds.create[i].mbono,
                    fefectiva: requestBody.bonds.create[i].fefectiva,
                })
            }
            let createBondsFromClientUpdate = await bd.createBondsFromClientUpdateQuery(clientData, createBondsList).then((res) => res);
            if(createBondsFromClientUpdate.error){console.log(createBondsFromClientUpdate.error); return { status: false, code: 500, message: createBondsFromClientUpdate.error }; }
        }
        if(requestBody.bonds.update){
            let updateBondsList = [];
            for(let i = 0; i < requestBody.bonds.update.length; i++){
                updateBondsList.push({
                    cbono: requestBody.bonds.update[i].cbono,
                    pbono: requestBody.bonds.update[i].pbono,
                    mbono: requestBody.bonds.update[i].mbono,
                    fefectiva: requestBody.bonds.update[i].fefectiva,
                })
            }
            let updateBondsListFromClientUpdate = await bd.updateBondsByClientUpdateQuery(clientData, updateBondsList).then((res) => res);
            if(updateBondsListFromClientUpdate.error){console.log(updateBondsListFromClientUpdate.error);return { status: false, code: 500, message: updateBondsListFromClientUpdate.error }; }
        }
    }
    if(requestBody.brokers){
        if(requestBody.brokers.create){
            let createBrokersList = [];
            for(let i = 0; i < requestBody.brokers.create.length; i++){
                createBrokersList.push({
                    ccorredor: requestBody.brokers.create[i].ccorredor,
                    pcorredor: requestBody.brokers.create[i].pcorredor,
                    mcorredor: requestBody.brokers.create[i].mcorredor,
                    fefectiva: requestBody.brokers.create[i].fefectiva,
                })
            }
            let createBrokersFromClientUpdate = await bd.createBrokersFromClientUpdateQuery(clientData, createBrokersList).then((res) => res);
            if(createBrokersFromClientUpdate.error){console.log(createBrokersFromClientUpdate.error); return { status: false, code: 500, message: createBrokersFromClientUpdate.error }; }
        }
        if(requestBody.brokers.update){
            let updateBrokersList = [];
            for(let i = 0; i < requestBody.brokers.update.length; i++){
                updateBrokersList.push({
                    ccorredor: requestBody.brokers.update[i].ccorredor,
                    pcorredor: requestBody.brokers.update[i].pcorredor,
                    mcorredor: requestBody.brokers.update[i].mcorredor,
                    fefectiva: requestBody.brokers.update[i].fefectiva,
                })
            }
            let updateBrokersListFromClientUpdate = await bd.updateBrokersByClientUpdateQuery(clientData, updateBrokersList).then((res) => res);
            if(updateBrokersListFromClientUpdate.error){console.log(updateBrokersListFromClientUpdate.error);return { status: false, code: 500, message: updateBrokersListFromClientUpdate.error }; }
        }
    }
    if(requestBody.depreciations){
        if(requestBody.depreciations.create){
            let createDepreciationsList = [];
            for(let i = 0; i < requestBody.depreciations.create.length; i++){
                createDepreciationsList.push({
                    cdepreciacion: requestBody.depreciations.create[i].cdepreciacion,
                    pdepreciacion: requestBody.depreciations.create[i].pdepreciacion,
                    mdepreciacion: requestBody.depreciations.create[i].mdepreciacion,
                    fefectiva: requestBody.depreciations.create[i].fefectiva,
                })
            }
            let createDepreciationsFromClientUpdate = await bd.createDepreciationsFromClientUpdateQuery(clientData, createDepreciationsList).then((res) => res);
            if(createDepreciationsFromClientUpdate.error){console.log(createDepreciationsFromClientUpdate.error); return { status: false, code: 500, message: createDepreciationsFromClientUpdate.error }; }
        }
        if(requestBody.depreciations.update){
            let updateDepreciationsList = [];
            for(let i = 0; i < requestBody.depreciations.update.length; i++){
                updateDepreciationsList.push({
                    cdepreciacion: requestBody.depreciations.update[i].cdepreciacion,
                    pdepreciacion: requestBody.depreciations.update[i].pdepreciacion,
                    mdepreciacion: requestBody.depreciations.update[i].mdepreciacion,
                    fefectiva: requestBody.depreciations.update[i].fefectiva,
                })
            }
            let updateDepreciationsFromClientUpdate = await bd.updateDepreciationsByClientUpdateQuery(clientData, updateDepreciationsList).then((res) => res);
            if(updateDepreciationsFromClientUpdate.error){console.log(updateDepreciationsFromClientUpdate.error);return { status: false, code: 500, message: updateDepreciationsFromClientUpdate.error }; }
        }
    }
    if(requestBody.relationships){
        if(requestBody.relationships.create){
            let createRelationshipsList = [];
            for(let i = 0; i < requestBody.relationships.create.length; i++){
                createRelationshipsList.push({
                    cparentesco: requestBody.relationships.create[i].cparentesco,
                    xobservacion: requestBody.relationships.create[i].xobservacion,
                    fefectiva: requestBody.relationships.create[i].fefectiva,
                })
            }
            let createRelationshipsFromClientUpdate = await bd.createPenaltiesFromClientUpdateQuery(clientData, createRelationshipsList).then((res) => res);
            if(createRelationshipsFromClientUpdate.error){console.log(createRelationshipsFromClientUpdate.error); return { status: false, code: 500, message: createRelationshipsFromClientUpdate.error }; }
        }
        if(requestBody.relationships.update){
            let updateRelationshipsList = [];
            for(let i = 0; i < requestBody.relationships.update.length; i++){
                updateRelationshipsList.push({
                    cparentesco: requestBody.relationships.update[i].cparentesco,
                    xobservacion: requestBody.relationships.update[i].xobservacion,
                    fefectiva: requestBody.relationships.update[i].fefectiva,
                })
            }
            let updateRelationshipFromClientUpdate = await bd.updateRelationshipByClientUpdateQuery(clientData, updateRelationshipsList).then((res) => res);
            if(updateRelationshipFromClientUpdate.error){console.log(updateRelationshipFromClientUpdate.error);return { status: false, code: 500, message: updateRelationshipFromClientUpdate.error }; }
        }
    }
    if(requestBody.penalties){
        if(requestBody.penalties.create){
            let createPenaltiesList = [];
            for(let i = 0; i < requestBody.penalties.create.length; i++){
                createPenaltiesList.push({
                    cpenalizacion: requestBody.penalties.create[i].cpenalizacion,
                    ppenalizacion: requestBody.penalties.create[i].ppenalizacion,
                    mpenalizacion: requestBody.penalties.create[i].mpenalizacion,
                    fefectiva: requestBody.penalties.create[i].fefectiva,
                })
            }
            let createPenaltiesFromClientUpdate = await bd.createPenaltiesFromClientUpdateQuery(clientData, createPenaltiesList).then((res) => res);
            if(createPenaltiesFromClientUpdate.error){console.log(createPenaltiesFromClientUpdate.error); return { status: false, code: 500, message: createPenaltiesFromClientUpdate.error }; }
        }
        if(requestBody.penalties.update){
            let updatePenaltiesList = [];
            for(let i = 0; i < requestBody.penalties.update.length; i++){
                updatePenaltiesList.push({
                    cpenalizacion: requestBody.penalties.update[i].cpenalizacion,
                    ppenalizacion: requestBody.penalties.update[i].ppenalizacion,
                    mpenalizacion: requestBody.penalties.update[i].mpenalizacion,
                    fefectiva: requestBody.penalties.update[i].fefectiva,
                })
            }
            let updatePenaltiesFromClientUpdate = await bd.updatePenaltiesByClientUpdateQuery(clientData, updatePenaltiesList).then((res) => res);
            if(updatePenaltiesFromClientUpdate.error){console.log(updatePenaltiesFromClientUpdate.error);return { status: false, code: 500, message: updatePenaltiesFromClientUpdate.error }; }
        }
    }
    if(requestBody.providers){
        if(requestBody.providers.create){
            let createProvidersList = [];
            for(let i = 0; i < requestBody.providers.create.length; i++){
                createProvidersList.push({
                    cproveedor: requestBody.providers.create[i].cproveedor,
                    xobservacion: requestBody.providers.create[i].xobservacion,
                    fefectiva: requestBody.providers.create[i].fefectiva,
                })
            }
            let createProvidersFromClientUpdate = await bd.createProvidersFromClientUpdateQuery(clientData, createProvidersList).then((res) => res);
            if(createProvidersFromClientUpdate.error){console.log(createProvidersFromClientUpdate.error); return { status: false, code: 500, message: createProvidersFromClientUpdate.error }; }
        }
        if(requestBody.providers.update){
            let updateProvidersList = [];
            for(let i = 0; i < requestBody.providers.update.length; i++){
                updateProvidersList.push({
                    cproveedor: requestBody.providers.update[i].cproveedor,
                    xobservacion: requestBody.providers.update[i].xobservacion,
                    fefectiva: requestBody.providers.update[i].fefectiva,
                })
            }
            let updateProvidersFromClientUpdate = await bd.updateProvidersByClientUpdateQuery(clientData, updateProvidersList).then((res) => res);
            if(updateProvidersFromClientUpdate.error){console.log(updateProvidersFromClientUpdate.error);return { status: false, code: 500, message: updateProvidersFromClientUpdate.error }; }
        }
    }
    if(requestBody.models){
        if(requestBody.models.create){
            let createModelsList = [];
            for(let i = 0; i < requestBody.models.create.length; i++){
                createModelsList.push({
                    cmodelo: requestBody.models.create[i].cmodelo,
                    cmarca: requestBody.models.create[i].cmarca,
                    xobservacion: requestBody.models.create[i].xobservacion,
                })
            }
            let createModelsFromClientUpdate = await bd.createModelsFromClientUpdateQuery(clientData, createModelsList).then((res) => res);
            if(createModelsFromClientUpdate.error){console.log(createModelsFromClientUpdate.error); return { status: false, code: 500, message: createModelsFromClientUpdate.error }; }
        }
        if(requestBody.models.update){
            let updateModelsList = [];
            for(let i = 0; i < requestBody.models.update.length; i++){
                updateModelsList.push({
                    cmodelo: requestBody.models.update[i].cmodelo,
                    cmarca: requestBody.models.update[i].cmarca,
                    xobservacion: requestBody.models.update[i].xobservacion,
                })
            }
            let updateModelsFromClientUpdate = await bd.updateModelsByClientUpdateQuery(clientData, updateModelsList).then((res) => res);
            if(updateModelsFromClientUpdate.error){console.log(updateModelsFromClientUpdate.error);return { status: false, code: 500, message: updateModelsFromClientUpdate.error }; }
        }
    }
    if(requestBody.workers){
        if(requestBody.workers.create){
            let createWorkersList = [];
            for(let i = 0; i < requestBody.workers.create.length; i++){
                createWorkersList.push({
                    xnombre: requestBody.workers.create[i].xnombre,
                    xapellido: requestBody.workers.create[i].xapellido,
                    ctipodocidentidad: requestBody.workers.create[i].ctipodocidentidad,
                    xdocidentidad: requestBody.workers.create[i].xdocidentidad,
                    xtelefonocelular: requestBody.workers.create[i].xtelefonocelular,
                    xemail: requestBody.workers.create[i].xemail,
                    xprofesion: requestBody.workers.create[i].xprofesion,
                    xfax: requestBody.workers.create[i].xfax,
                    xocupacion: requestBody.workers.create[i].xocupacion,
                    xtelefonocasa: requestBody.workers.create[i].xtelefonocasa,
                    cparentesco: requestBody.workers.create[i].cparentesco,
                    cciudad: requestBody.workers.create[i].cciudad,
                    cestado: requestBody.workers.create[i].cestado,
                    xdireccion: requestBody.workers.create[i].xdireccion,
                    fnacimiento: requestBody.workers.create[i].fnacimiento,
                    cestadocivil: requestBody.workers.create[i].cestadocivil
                })
            }
            let createWorkersFromClientUpdate = await bd.createWorkersFromClientUpdateQuery(clientData, createWorkersList).then((res) => res);
            if(createWorkersFromClientUpdate.error){console.log(createWorkersFromClientUpdate.error); return { status: false, code: 500, message: createWorkersFromClientUpdate.error }; }
        }
        if(requestBody.workers.update){
            let updateWorkersList = [];
            for(let i = 0; i < requestBody.workers.update.length; i++){
                updateWorkersList.push({
                    ctrabajador: requestBody.workers.update[i].ctrabajador,
                    xnombre: requestBody.workers.update[i].xnombre,
                    xapellido: requestBody.workers.update[i].xapellido,
                    ctipodocidentidad: requestBody.workers.update[i].ctipodocidentidad,
                    xdocidentidad: requestBody.workers.update[i].xdocidentidad,
                    xtelefonocelular: requestBody.workers.update[i].xtelefonocelular,
                    xemail: requestBody.workers.update[i].xemail,
                    xprofesion: requestBody.workers.update[i].xprofesion,
                    xfax: requestBody.workers.update[i].xfax,
                    xocupacion: requestBody.workers.update[i].xocupacion,
                    xtelefonocasa: requestBody.workers.update[i].xtelefonocasa,
                    cparentesco: requestBody.workers.update[i].cparentesco,
                    cciudad: requestBody.workers.update[i].cciudad,
                    cestado: requestBody.workers.update[i].cestado,
                    xdireccion: requestBody.workers.update[i].xdireccion,
                    fnacimiento: requestBody.workers.update[i].fnacimiento,
                    cestadocivil: requestBody.workers.update[i].cestadocivil
                })
            }
            let updateWorkersFromClientUpdate = await bd.updateWorkersByClientUpdateQuery(clientData, updateWorkersList).then((res) => res);
            if(updateWorkersFromClientUpdate.error){console.log(updateWorkersFromClientUpdate.error);return { status: false, code: 500, message: updateWorkersFromClientUpdate.error }; }
        }
    }
    if(requestBody.groupers){
        let createGroupersList = [];
        let createGroupersBanksList = [];
        if(requestBody.groupers.create){
            for(let i = 0; i < requestBody.groupers.create.length; i++){
                createGroupersList.push({
                    xcontratoalternativo: requestBody.groupers.create[i].xcontratoalternativo,
                    xnombre: requestBody.groupers.create[i].xnombre,
                    xrazonsocial: requestBody.groupers.create[i].xrazonsocial,
                    cestado: requestBody.groupers.create[i].cestado,
                    cciudad: requestBody.groupers.create[i].cciudad,
                    xdireccionfiscal: requestBody.groupers.create[i].xdireccionfiscal,
                    ctipodocidentidad: requestBody.groupers.create[i].ctipodocidentidad,
                    xdocidentidad: requestBody.groupers.create[i].xdocidentidad,
                    bfacturar: requestBody.groupers.create[i].bfacturar,
                    bcontribuyente: requestBody.groupers.create[i].bcontribuyente,
                    bimpuesto: requestBody.groupers.create[i].bimpuesto,
                    xtelefono: requestBody.groupers.create[i].xtelefono,
                    xfax: requestBody.groupers.create[i].xfax ? requestBody.groupers.create[i].xfax : undefined,
                    xemail: requestBody.groupers.create[i].xemail,
                    xrutaimagen: requestBody.groupers.create[i].xrutaimagen ? requestBody.groupers.create[i].xrutaimagen : undefined,
                    bactivo: requestBody.groupers.create[i].bactivo,
                })
                if(requestBody.groupers.create[i].banks){
                    for(let j = 0; j < requestBody.groupers.create[i].banks.length; j++){
                        createGroupersBanksList.push({
                            cbanco: requestBody.groupers.create[i].banks[j].cbanco,
                            ctipocuentabancaria: requestBody.groupers.create[i].banks[j].ctipocuentabancaria,
                            xnumerocuenta: requestBody.groupers.create[i].banks[j].xnumerocuenta,
                            xcontrato: requestBody.groupers.create[i].banks[j].xcontrato,
                            bprincipal: requestBody.groupers.create[i].banks[j].bprincipal,
                        })
                    }
                }
            }
            let createGroupersByClientUpdate = await bd.createGroupersByClientUpdateQuery(clientData, createGroupersList, createGroupersBanksList).then((res) => res);
            if(createGroupersByClientUpdate.error){ return { status: false, code: 500, message: createGroupersByClientUpdate.error }; }
        }
        if(requestBody.groupers.update){
            let updateGroupersList = [];
            let updateGroupersBanksList = [];
            for(let i = 0; i < requestBody.groupers.update.length; i++){
                updateGroupersList.push({
                    cagrupador: requestBody.groupers.update[i].cagrupador,
                    xcontratoalternativo: requestBody.groupers.update[i].xcontratoalternativo,
                    xnombre: requestBody.groupers.update[i].xnombre,
                    xrazonsocial: requestBody.groupers.update[i].xrazonsocial,
                    cestado: requestBody.groupers.update[i].cestado,
                    cciudad: requestBody.groupers.update[i].cciudad,
                    xdireccionfiscal: requestBody.groupers.update[i].xdireccionfiscal,
                    ctipodocidentidad: requestBody.groupers.update[i].ctipodocidentidad,
                    xdocidentidad: requestBody.groupers.update[i].xdocidentidad,
                    bfacturar: requestBody.groupers.update[i].bfacturar,
                    bcontribuyente: requestBody.groupers.update[i].bcontribuyente,
                    bimpuesto: requestBody.groupers.update[i].bimpuesto,
                    xtelefono: requestBody.groupers.update[i].xtelefono,
                    xfax: requestBody.groupers.update[i].xfax ? requestBody.groupers.update[i].xfax : undefined,
                    xemail: requestBody.groupers.update[i].xemail,
                    xrutaimagen: requestBody.groupers.update[i].xrutaimagen ? requestBody.groupers.update[i].xrutaimagen : undefined,
                    bactivo: requestBody.groupers.update[i].bactivo,
                })
                if(requestBody.groupers.update[i].banks){
                    for(let j = 0; j < requestBody.groupers.update[i].banks.length; j++){
                        updateGroupersBanksList.push({
                            cbanco: requestBody.groupers.update[i].banks[j].cbanco,
                            ctipocuentabancaria: requestBody.groupers.update[i].banks[j].ctipocuentabancaria,
                            xnumerocuenta: requestBody.groupers.update[i].banks[j].xnumerocuenta,
                            xcontrato: requestBody.groupers.update[i].banks[j].xcontrato,
                            bprincipal: requestBody.groupers.update[i].banks[j].bprincipal,
                        })
                    }
                }
            }
            let updateGroupersByClientUpdate = await bd.updateGroupersByClientUpdateQuery(clientData, updateGroupersList, updateGroupersBanksList).then((res) => res);
            if(updateGroupersByClientUpdate.error){ return { status: false, code: 500, message: updateGroupersByClientUpdate.error }; }
        }
    }
    if(requestBody.plans){
        if(requestBody.plans.create){
            let createPlansList = [];
            for(let i = 0; i < requestBody.plans.create.length; i++){
                createPlansList.push({
                    cplan: requestBody.plans.create[i].cplan,
                    casociado: requestBody.plans.create[i].casociado,
                    ctipoplan: requestBody.plans.create[i].ctipoplan,
                    fdesde: requestBody.plans.create[i].fdesde,
                    fhasta: requestBody.plans.create[i].fhasta
                })
            }
            let createPlansFromClientUpdate = await bd.createPlansFromClientUpdateQuery(clientData, createPlansList).then((res) => res);
            if(createPlansFromClientUpdate.error){console.log(createPlansFromClientUpdate.error); return { status: false, code: 500, message: createPlansFromClientUpdate.error }; }
        }
        if(requestBody.plans.update){
            let updatePlansList = [];
            for(let i = 0; i < requestBody.plans.update.length; i++){
                updatePlansList.push({
                    cplan: requestBody.plans.update[i].cplan,
                    cplancliente: requestBody.plans.update[i].cplancliente,
                    casociado: requestBody.plans.update[i].casociado,
                    ctipoplan: requestBody.plans.update[i].ctipoplan,
                    fdesde: requestBody.plans.update[i].fdesde,
                    fhasta: requestBody.plans.update[i].fhasta
                })
            }
            let updatePlansFromClientUpdate = await bd.updatePlansFromClientUpdateQuery(clientData, updatePlansList).then((res) => res);
            if(updatePlansFromClientUpdate.error){console.log(updatePlansFromClientUpdate.error);return { status: false, code: 500, message: updatePlansFromClientUpdate.error }; }
        }
    }
    return{status: true, ccliente: clientData.ccliente}
    
}

module.exports = router;