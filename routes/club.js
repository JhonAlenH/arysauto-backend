const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');

router.route('/city').post((req, res) => {
    operationValrepCity(req.body).then((result) => {
        if(!result.status){ 
            res.status(result.code).json({ data: result });
            return;
        }
        res.json({ data: result });
    }).catch((err) => {
        res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationValrepCity' } });
    });
});

const operationValrepCity = async(requestBody) => {
    let searchData = {
        cestado: requestBody.cestado
    };
    let query = await bd.cityValrepQuery(searchData).then((res) => res);
    if(query.error){ return { status: false, code: 500, message: query.error }; }
    let jsonArray = [];
    for(let i = 0; i < query.result.recordset.length; i++){
        jsonArray.push({ cciudad: query.result.recordset[i].CCIUDAD, xciudad: query.result.recordset[i].XCIUDAD, bactivo: query.result.recordset[i].BACTIVO });
    }
    return { status: true, list: jsonArray }
}

router.route('/state').post((req, res) => {
    operationValrepState(req.body).then((result) => {
        if(!result.status){ 
            res.status(result.code).json({ data: result });
            return;
        }
        res.json({ data: result });
    }).catch((err) => {
        res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationValrepState' } });
    });
});

const operationValrepState = async(requestBody) => {
    let cpais = requestBody.cpais;
    let query = await bd.stateValrepQuery(cpais).then((res) => res);
    if(query.error){ return { status: false, code: 500, message: query.error }; }
    let jsonArray = [];
    for(let i = 0; i < query.result.recordset.length; i++){
        jsonArray.push({ cestado: query.result.recordset[i].CESTADO, xestado: query.result.recordset[i].XESTADO, bactivo: query.result.recordset[i].BACTIVO });
    }
    return { status: true, list: jsonArray }
}

router.route('/sex').post((req, res) => {
    operationValrepSex(req.body).then((result) => {
        if(!result.status){ 
            res.status(result.code).json({ data: result });
            return;
        }
        res.json({ data: result });
    }).catch((err) => {
        res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationValrepSex' } });
    });
});

const operationValrepSex = async(requestBody) => {
    let query = await bd.sexValrepQuery().then((res) => res);
    if(query.error){ return { status: false, code: 500, message: query.error }; }
    let jsonArray = [];
    for(let i = 0; i < query.result.recordset.length; i++){
        jsonArray.push({ csexo: query.result.recordset[i].CSEXO, xsexo: query.result.recordset[i].XSEXO });
    }
    return { status: true, list: jsonArray }
}

router.route('/create-user-club').post((req, res) => {
    operationCreateCity(req.body).then((result) => {
        if(!result.status){
            res.status(result.code).json({ data: result });
            return;
        }
        res.json({ data: result });
    }).catch((err) => {
        res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCreateCity' } });
    });
});

const operationCreateCity = async(requestBody) => {
    let userData = {
        xnombre: requestBody.xnombre.toUpperCase(),
        xapellido: requestBody.xapellido,
        csexo: requestBody.csexo,
        fnacimiento: requestBody.fnacimiento,
        xemail: requestBody.xemail,
        xcontrasena: requestBody.xcontrasena,
        cciudad: requestBody.cciudad,
        cestado: requestBody.cestado,
        xdireccion: requestBody.xdireccion,
        xdocidentidad: requestBody.xdocidentidad,
        xtelefonocelular: requestBody.xtelefonocelular,
    };
    let createUserClub = await bd.createUserClubQuery(userData).then((res) => res);
    if(createUserClub.error){ return { status: false, code: 500, message: createUserClub.error }; }
    if(createUserClub.result.rowsAffected > 0){ return { status: true, id: createUserClub.result.recordset[0].ID }; }
    else{ return { status: false, code: 500, message: 'Server Internal Error.', hint: 'createCity' }; }
}

router.route('/Data/Client/vehicle').post((req, res) => {
    operationSearchDataClientVehicle(req.body).then((result) => {
        if(!result.status){ 
            res.status(result.code).json({ data: result });
            return;
        }
        res.json({ data: result });
    }).catch((err) => {
        res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchDataClientVehicle' } });
    });
});

const operationSearchDataClientVehicle = async(requestBody) => {
    let ClientData = {
        cpropietario: requestBody.cpropietario,
        cpais: requestBody.cpais,
    };
    let client = await bd.ClienDataClubVehicle(ClientData).then((res) => res);
    if(client.error){ return { status: false, code: 500, message: client.error }; }

    let DatosVehiculo = [];
    for(let i = 0; i < client.result.recordset.length; i++){
        DatosVehiculo.push({ 
            xmarca: client.result.recordset[0].XMARCA,
            xmodelo: client.result.recordset[0].XMODELO,
            xversion: client.result.recordset[0].XVERSION,
            xplaca: client.result.recordset[0].XPLACA,
            fano: client.result.recordset[0].FANO,
            xcolor: client.result.recordset[0].XCOLOR,
            xserialcarroceria: client.result.recordset[0].XSERIALCARROCERIA,
            xseriamotor: client.result.recordset[0].XSERIALMOTOR,
        });
    }
   
    return { 
        status: true, 
        listdatavehicle: DatosVehiculo
    }
}

router.route('/Data/Client').post((req, res) => {
    operationSearchDataClient(req.body).then((result) => {
        if(!result.status){ 
            res.status(result.code).json({ data: result });
            return;
        }
        res.json({ data: result });
    }).catch((err) => {
        res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchDataClient' } });
    });
});

const operationSearchDataClient = async(requestBody) => {
    let ClientData = {
        cpropietario: requestBody.cpropietario,
        cpais: requestBody.cpais,
    };
    let client = await bd.ClienDataClub(ClientData).then((res) => res);
    if(client.error){ return { status: false, code: 500, message: client.error }; }

    let DatosCliente = [];
    for(let i = 0; i < client.result.recordset.length; i++){
        DatosCliente.push({ 
            xnombre: client.result.recordset[0].XNOMBRE,
            xapellido: client.result.recordset[0].XAPELLIDO,
            xzona_postal: client.result.recordset[0].XZONA_POSTAL,
            icedula: client.result.recordset[0].ICEDULA,
            xdocidentidad: client.result.recordset[0].XDOCIDENTIDAD,
            xemail: client.result.recordset[0].XEMAIL,
            telefono: client.result.recordset[0].XTELEFONOCELULAR,
        });
    }

    return { 
        status: true, 
        UserProfile : DatosCliente,

    }
}

router.route('/Data/Client/Plan').post((req, res) => {
    operationSearchDataPlan(req.body).then((result) => {
        if(!result.status){ 
            res.status(result.code).json({ data: result });
            return;
        }
        res.json({ data: result });
    }).catch((err) => {
        res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchDataPlan' } });
    });
});

const operationSearchDataPlan = async(requestBody) => {
    let ClientData = {
        cpropietario: requestBody.cpropietario,
    };
    let client = await bd.ClienDataClubPlan(ClientData).then((res) => res);
    if(client.error){ return { status: false, code: 500, message: client.error }; }

    let DataTypeService = [];
    for(let i = 0; i < client.result.recordset.length; i++){
        DataTypeService.push({ 
            ctiposervicio: client.result.recordset[i].CTIPOSERVICIO, 
            xtiposervicio: client.result.recordset[i].XTIPOSERVICIO, });
    }

    let DataService = [];
    for(let i = 0; i < client.result.recordset.length; i++){
        DataService.push({ 
            ctiposervicio: client.result.recordset[i].CTIPOSERVICIO,
            cservicio: client.result.recordset[i].CSERVICIO, 
            xservicio: client.result.recordset[i].XSERVICIO});
    }
    return { 
        status: true, 
        xplan: client.result.recordset[0].XPLAN,
        cplan: client.result.recordset[0].CPLAN,
        ccontratoflota: client.result.recordset[0].CCONTRATOFLOTA,
        listTypeService : DataTypeService,
    }
}

router.route('/Data/Client/Plan/service').post((req, res) => {
    operationSearchDataPlanService(req.body).then((result) => {
        if(!result.status){ 
            res.status(result.code).json({ data: result });
            return;
        }
        res.json({ data: result });
    }).catch((err) => {
        res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchDataPlanService' } });
    });
});

const operationSearchDataPlanService = async(requestBody) => {
    let ClientData = {
        ctiposervicio: requestBody.ctiposervicio,
        ccontratoflota: requestBody.ccontratoflota,
    };
    let client = await bd.ClienDataClubPlanService(ClientData).then((res) => res);
    if(client.error){ return { status: false, code: 500, message: client.error }; }


    let DataService = [];
    for(let i = 0; i < client.result.recordset.length; i++){
        DataService.push({ 
            cservicio: client.result.recordset[i].CSERVICIO, 
            xservicio: client.result.recordset[i].XSERVICIO});
    }

    return { 
        status: true, 
        DataService : DataService,
    }
}

router.route('/Data/Proveedor').post((req, res) => {
    operationSearchProveedor(req.body).then((result) => {
        if(!result.status){ 
            res.status(result.code).json({ data: result });
            return;
        }
        res.json({ data: result });
    }).catch((err) => {
        res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchProveedor' } });
    });
});

const operationSearchProveedor = async(requestBody) => {
    let ClientData = {
        cservicio: requestBody.cservicio,
        cestado: requestBody.cestado,
        cciudad: requestBody.cciudad,
    };
    let client = await bd.ClienDataProveedor(ClientData).then((res) => res);
    if(client.error){ return { status: false, code: 500, message: client.error }; }

    if(client.rowsAffected == 0){ return { status: false, code: 404 }; }


    let ListProveedor = [];
    for(let i = 0; i < client.result.recordset.length; i++){
        ListProveedor.push({ 
            cproveedor: client.result.recordset[i].CPROVEEDOR,
            xnombre: client.result.recordset[i].XNOMBRE, 
            xtelefono: client.result.recordset[i].XTELEFONO,
            xtelefonocelular: client.result.recordset[i].XTELEFONOCELULAR
        });
    }

    return { 
        status: true, 
        ListProveedor : ListProveedor,
    }
}

router.route('/Data/Solicitud').post((req, res) => {
    operationGenerateSolicitud(req.body).then((result) => {
        if(!result.status){ 
            res.status(result.code).json({ data: result });
            return;
        }
        res.json({ data: result });
    }).catch((err) => {
        res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationGenerateSolicitud' } });
    });
});

const operationGenerateSolicitud = async(requestBody) => {
    let ClientData = {       
        cestado: requestBody.cestado,
        cciudad: requestBody.cciudad,
        cservicio: requestBody.cservicio,
        ctiposervicio: requestBody.ctiposervicio,
        cproveedor: requestBody.cproveedor,
        cpropietario: requestBody.cpropietario,
        ccontratoflota: requestBody.ccontratoflota
    };
    let client = await bd.SolicitudServiceClub(ClientData).then((res) => res);
    if(client.error){ return { status: false, code: 500, message: client.error }; }

    return { 
        status: true, 
        message: 'La solicitud fue creada con exito'

    }
}

router.route('/Data/store-procedure/service').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationStoreProcedureFromClub(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationStoreProcedureFromClub' } });
        });
    }
});

const operationStoreProcedureFromClub = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let data = {
        ccontratoflota: requestBody.ccontratoflota,
        cusuariocreacion: requestBody.cusuariocreacion,
        cplan: requestBody.cplan,
        ctiposervicio: requestBody.ctiposervicio,
    }
    let storeProcedure = await bd.storeProcedureFromClubQuery(data).then((res) => res);
    if(storeProcedure.error){ return  { status: false, code: 500, message: storeProcedure.error }; }
    if(storeProcedure.result.rowsAffected > 0){
        let jsonList = [];
        for(let i = 0; i < storeProcedure.result.recordset.length; i++){
            jsonList.push({
                cservicio: storeProcedure.result.recordset[i].CSERVICIO,
                xservicio: storeProcedure.result.recordset[i].XSERVICIO,
            });
        }
        return { status: true, list: jsonList };
    }else{ return { status: false, code: 404, message: 'Replacement not found.' }; }
}

module.exports = router;