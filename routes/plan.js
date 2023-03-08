const router = require('express').Router();
const bd = require('../src/bd');
const helper = require('../src/helper');

router.route('/search').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchPlan(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchPlan' } });
        });
    }
});

const operationSearchPlan = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania,
        ctipoplan: requestBody.ctipoplan ? requestBody.ctipoplan : undefined,
        xplan: requestBody.xplan ? requestBody.xplan.toUpperCase() : undefined
    };
    let searchPlan = await bd.searchPlanQuery(searchData).then((res) => res);
    if(searchPlan.error){ return  { status: false, code: 500, message: searchPlan.error }; }
    if(searchPlan.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Plan not found.' }; }
    let jsonList = [];
    for(let i = 0; i < searchPlan.result.recordset.length; i++){
        jsonList.push({
            cplan: searchPlan.result.recordset[i].CPLAN,
            xplan: searchPlan.result.recordset[i].XPLAN,
            mcosto: searchPlan.result.recordset[i].MCOSTO,
            bactivo: searchPlan.result.recordset[i].BACTIVO
        });
    }
    return { status: true, list: jsonList };
}

router.route('/detail').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationDetailPlan(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationDetailPlan' } });
        });
    }
});

const operationDetailPlan = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let planData = {
        ccompania: requestBody.ccompania,
        cpais: requestBody.cpais,
        cplan: requestBody.cplan,
        ctipoplan: requestBody.ctipoplan
    };
    let getPlanData = await bd.getPlanDataQuery(planData).then((res) => res);
    if(getPlanData.error){ return { status: false, code: 500, message: getPlanData.error }; }
    if(getPlanData.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Plan not found.' }; }
    let servicesTypeList = [];
    let getPlanServicesData = await bd.getPlanServicesDataQuery(planData.cplan).then((res) => res);
    if(getPlanServicesData.error){ return { status: false, code: 500, message: getPlanServicesData.error }; }
    if(getPlanServicesData.result.rowsAffected > 0){
        for(let i = 0; i < getPlanServicesData.result.recordset.length; i++){
            servicesTypeList.push({
                ctiposervicio: getPlanServicesData.result.recordset[i].CTIPOSERVICIO,
                xtiposervicio: getPlanServicesData.result.recordset[i].XTIPOSERVICIO,
            })
        }
    }
    let servicesInsurers = [];
    let getPlanServicesInsurersData = await bd.getPlanServicesInsurersDataQuery(planData.cplan).then((res) => res);
    if(getPlanServicesInsurersData.error){ return { status: false, code: 500, message: getPlanServicesInsurersData.error }; }
    if(getPlanServicesInsurersData.result.rowsAffected > 0){
        for(let i = 0; i < getPlanServicesInsurersData.result.recordset.length; i++){
            let serviceInsurer = {
                cservicio: getPlanServicesInsurersData.result.recordset[i].CSERVICIO_ASEG,
                cservicioplan: getPlanServicesInsurersData.result.recordset[i].CSERVICIOPLAN,
                xservicio: getPlanServicesInsurersData.result.recordset[i].XSERVICIO_ASEG,
                ctiposervicio: getPlanServicesInsurersData.result.recordset[i].CTIPOSERVICIO,
                xtiposervicio: getPlanServicesInsurersData.result.recordset[i].XTIPOSERVICIO,
            }
            servicesInsurers.push(serviceInsurer);
        }
    }
    return { 
        status: true,
        cplan: getPlanData.result.recordset[0].CPLAN,
        xplan: getPlanData.result.recordset[0].XPLAN,
        mcosto: getPlanData.result.recordset[0].MCOSTO,
        ctipoplan: getPlanData.result.recordset[0].CTIPOPLAN,
        brcv: getPlanData.result.recordset[0].BRCV,
        bactivo: getPlanData.result.recordset[0].BACTIVO,
        services: servicesTypeList,
        servicesInsurers: servicesInsurers,
        parys: getPlanData.result.recordset[0].PARYS, 
        paseguradora: getPlanData.result.recordset[0].PASEGURADORA,
        cmoneda: getPlanData.result.recordset[0].CMONEDA,
        ptasa_casco: getPlanData.result.recordset[0].PTASA_CASCO,
        ptasa_catastrofico: getPlanData.result.recordset[0].PTASA_CATASTROFICO,
        msuma_recuperacion: getPlanData.result.recordset[0].MSUMA_RECUPERACION,
        mprima_recuperacion: getPlanData.result.recordset[0].MPRIMA_RECUPERACION,
        mdeducible: getPlanData.result.recordset[0].MDEDUCIBLE,
    }
}

router.route('/search-service').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationSearchService(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchService' } });
        });
    }
});

const operationSearchService = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let ctiposervicio =  requestBody.ctiposervicio

    let searchService = await bd.getServiceFromPlanQuery(ctiposervicio).then((res) => res);
    if(searchService.error){ return  { status: false, code: 500, message: searchService.error }; }
    if(searchService.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Plan not found.' }; }
    let jsonList = [];
    for(let i = 0; i < searchService.result.recordset.length; i++){
        jsonList.push({
            cservicio: searchService.result.recordset[i].CSERVICIO,
            xservicio: searchService.result.recordset[i].XSERVICIO,
        });
    }
    return { status: true, list: jsonList };
}

router.route('/create').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code:400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationCreatePlan(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCreatePlan' } });
        });
    }
});

const operationCreatePlan = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let dataList =  {
        cplan: requestBody.cplan,
        ctipoplan: requestBody.ctipoplan,
        xplan: requestBody.xplan,
        paseguradora: requestBody.paseguradora ? requestBody.paseguradora: 0,
        parys: requestBody.parys ? requestBody.parys: 100,
        mcosto: requestBody.mcosto,
        brcv: requestBody.brcv,
        bactivo: requestBody.bactivo,
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania,
        cusuario: requestBody.cusuario,
        cmoneda: requestBody.cmoneda,
        ptasa_casco: requestBody.ptasa_casco ? requestBody.ptasa_casco: 0,
        ptasa_catastrofico: requestBody.ptasa_catastrofico ? requestBody.ptasa_catastrofico: 0,
        msuma_recuperacion: requestBody.msuma_recuperacion ? requestBody.msuma_recuperacion: 0,
        mprima_recuperacion: requestBody.mprima_recuperacion ? requestBody.mprima_recuperacion: 0,
        mdeducible: requestBody.mdeducible ? requestBody.mdeducible: 0,
    }
    //Busca código del plan
    let searchCodePlan = await bd.searchCodePlanQuery().then((res) => res);
    if(searchCodePlan.error){return { status: false, code: 500, message: searchCodePlan.error }; }
    if(searchCodePlan.result.rowsAffected > 0){ 

        //Crea el plan
        let cplan = searchCodePlan.result.recordset[0].CPLAN + 1;
        let apovList = [];

        let createPlan = await bd.createPlanQuery(dataList, cplan).then((res) => res);
        if(createPlan.error){return { status: false, code: 500, message: createPlan.error }; }
        if(createPlan.result.rowsAffected > 0){  
            if(requestBody.servicesType){
                //Crea los tipos de servicios del plan
                let serviceTypeList = [];
                for(let i = 0; i < requestBody.servicesType.length; i++){
                    serviceTypeList.push({
                        ctiposervicio: requestBody.servicesType[i].ctiposervicio,
                    })
                }
                let createTypeService = await bd.createServiceTypeFromPlanQuery(serviceTypeList, dataList, cplan).then((res) => res);
                if(createTypeService.error){ return  { status: false, code: 500, message: createTypeService.error }; }
            }
            if(requestBody.quantity){
                //Crea la cantidad de servicios que presta.
                let quantityList = [];
                for(let i = 0; i < requestBody.quantity.length; i++){
                    quantityList.push({
                        ncantidad: requestBody.quantity[i].ncantidad,
                        cservicio: requestBody.quantity[i].cservicio,
                    })
                }
                let updateServiceFromQuantity = await bd.updateServiceFromQuantityQuery(quantityList, cplan).then((res) => res);
                if(updateServiceFromQuantity.error){ return  { status: false, code: 500, message: updateServiceFromQuantity.error }; }
            }
            let searchLastPlan = await bd.searchLastPlanQuery().then((res) => res);
            if(searchLastPlan.error){ return  { status: false, code: 500, message: searchLastPlan.error }; }
            if(createPlan.result.rowsAffected > 0){return {status: true, cplan: searchLastPlan.result.recordset[0].CPLAN, list: apovList}}
        }
        else{ return { status: false, code: 500, message: 'Server Internal Error.', hint: 'createPlan' }; }
    }

}

router.route('/create-plan-rcv').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code:400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationCreatePlanRcv(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCreatePlanRcv' } });
        });
    }
});

const operationCreatePlanRcv = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let dataList =  {
        cservicio_aseg: requestBody.cservicio_aseg,
        ctiposervicio: requestBody.ctiposervicio,
        ctipoagotamientoservicio: requestBody.ctipoagotamientoservicio,
        ncantidad: requestBody.ncantidad,
        pservicio: requestBody.pservicio,
        mmaximocobertura: requestBody.mmaximocobertura,
        mdeducible: requestBody.mdeducible,
        bserviciopadre: requestBody.bserviciopadre,
        bactivo: requestBody.bactivo,
        cusuario: requestBody.cusuario
    }
    //Busca código del plan
    let searchPlan = await bd.searchLastPlanQuery().then((res) => res);
    if(searchPlan.error){return { status: false, code: 500, message: searchPlan.error }; }
    if(searchPlan.result.rowsAffected > 0){ 

        let plan = {
            cplan: searchPlan.result.recordset[0].CPLAN,
            xplan: searchPlan.result.recordset[0].XPLAN
        }

        //crea el plan en POSERVICIOPLAN_RC
        let createServicePlanRcv = await bd.createServicePlanRcvQuery(dataList, plan).then((res) => res);
        if(createServicePlanRcv.error){return { status: false, code: 500, message: createServicePlanRcv.error }; }
        if(createServicePlanRcv.result.rowsAffected > 0){  
            //crea el plan en PRPLAN_RC
            if(requestBody.rcv){
                let rcv = requestBody.rcv
                let createPlanRcv = await bd.createPlanRcvQuery(dataList, rcv, plan).then((res) => res);
                if(createPlanRcv.error){ return  { status: false, code: 500, message: createPlanRcv.error }; }
            }
        }
        if(createPlanRcv.result.rowsAffected > 0){return {status: true}}
        else{ return { status: false, code: 500, message: 'Server Internal Error.', hint: 'createPlan' }; }
    }

}
router.route('/store-procedure').post((req, res) => {
    if(!req.header('Authorization')){ 
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } })
        return;
    }else{
        operationStoreProcedure(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){ 
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationStoreProcedure' } });
        });
    }
});

const operationStoreProcedure = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData =  {
        cplan: requestBody.cplan,
        cmoneda: requestBody.cmoneda
    }

    let searchApov = await bd.searchApovQuery(searchData).then((res) => res);
    if(searchApov.error){ return  { status: false, code: 500, message: searchApov.error }; }
    let apovList = [];
    if(searchApov.result.rowsAffected > 0){
        for(let i = 0; i < searchApov.result.recordset.length; i++){
            apovList.push({
                    cplan: searchApov.result.recordset[i].CPLAN,
                    ccobertura: searchApov.result.recordset[i].CCOBERTURA,
                    xcobertura: searchApov.result.recordset[i].XCOBERTURA,
                    msuma_aseg: searchApov.result.recordset[i].MSUMA_ASEG,
                    ptasa_par_rus: searchApov.result.recordset[i].PTASA_PAR_RUS,
                    mprima_par_rus: searchApov.result.recordset[i].MPRIMA_PAR_RUS,
                    ptasa_carga: searchApov.result.recordset[i].PTASA_CARGA,
                    mprima_carga: searchApov.result.recordset[i].MPRIMA_CARGA
            })
        }
    }

    let searchExceso = await bd.searchExcesoQuery(searchData).then((res) => res);
    if(searchExceso.error){ return  { status: false, code: 500, message: searchExceso.error }; }
    let excesoList = [];
    if(searchExceso.result.rowsAffected > 0){
        for(let i = 0; i < searchExceso.result.recordset.length; i++){
            excesoList.push({
                    cplan: searchExceso.result.recordset[i].CPLAN,
                    ctarifa: searchExceso.result.recordset[i].CTARIFA,
                    xtipo: searchExceso.result.recordset[i].XTIPO,
                    cmoneda: searchExceso.result.recordset[i].CMONEDA,
                    ms_defensa_penal: searchExceso.result.recordset[i].MS_DEFENSA_PENAL,
                    mp_defensa_penal: searchExceso.result.recordset[i].MP_DEFENSA_PENAL,
                    ms_exceso_limite: searchExceso.result.recordset[i].MS_EXCESO_LIMITE,
                    mp_exceso_limite: searchExceso.result.recordset[i].MP_EXCESO_LIMITE
            })
        }
    }
    return { status: true, apov: apovList, exceso: excesoList};
}

router.route('/update').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code:400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationUpdatePlan(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationUpdatePlan' } });
        });
    }
});

const operationUpdatePlan = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let dataList =  {
        cplan: requestBody.cplan,
        ctipoplan: requestBody.ctipoplan,
        xplan: requestBody.xplan,
        paseguradora: requestBody.paseguradora ? requestBody.paseguradora: 0,
        parys: requestBody.parys ? requestBody.parys: 100,
        mcosto: requestBody.mcosto,
        brcv: requestBody.brcv,
        bactivo: requestBody.bactivo,
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania,
        cusuario: requestBody.cusuario,
        cmoneda: requestBody.cmoneda,
        ptasa_casco: requestBody.ptasa_casco ? requestBody.ptasa_casco: 0,
        ptasa_catastrofico: requestBody.ptasa_catastrofico ? requestBody.ptasa_catastrofico: 0,
        msuma_recuperacion: requestBody.msuma_recuperacion ? requestBody.msuma_recuperacion: 0,
        mprima_recuperacion: requestBody.mprima_recuperacion ? requestBody.mprima_recuperacion: 0,
        mdeducible: requestBody.mdeducible ? requestBody.mdeducible: 0,
        apov: requestBody.apov,
        exceso: requestBody.exceso
    }
    let updatePlan = await bd.updatePlanQuery(dataList).then((res) => res);
    if(updatePlan.error){return { status: false, code: 500, message: updatePlan.error }; }

    if(dataList.apov){
        let apovList = [];

        for(let i = 0; i < dataList.apov.length; i++){  
            apovList.push({
                cplan: dataList.apov[i].cplan,
                ccobertura: dataList.apov[i].ccobertura,
                xcobertura: dataList.apov[i].xcobertura,
                msuma_aseg: dataList.apov[i].msuma_aseg,
                ptasa_par_rus: dataList.apov[i].ptasa_par_rus,
                mprima_par_rus: dataList.apov[i].mprima_par_rus,
                ptasa_carga: dataList.apov[i].ptasa_carga,
                mprima_carga: dataList.apov[i].mprima_carga
            })
        }
        let updateApovFromPlan = await bd.updateApovFromPlanQuery(apovList).then((res) => res);
        if(updateApovFromPlan.error){return { status: false, code: 500, message: updateApovFromPlan.error }; }
    }

    if(dataList.exceso){
        let excesoList = [];

        for(let i = 0; i < dataList.exceso.length; i++){  
            excesoList.push({
                cplan: dataList.exceso[i].cplan,
                ctarifa: dataList.exceso[i].ctarifa,
                cmoneda: dataList.exceso[i].cmoneda,
                ms_defensa_penal: dataList.exceso[i].ms_defensa_penal,
                mp_defensa_penal: dataList.exceso[i].mp_defensa_penal,
                ms_exceso_limite: dataList.exceso[i].ms_exceso_limite,
                mp_exceso_limite: dataList.exceso[i].mp_exceso_limite
            })
        }
        let updateExcesoFromPlan = await bd.updateExcesoFromPlanQuery(excesoList).then((res) => res);
        if(updateExcesoFromPlan.error){return { status: false, code: 500, message: updateExcesoFromPlan.error }; }
    }

    return{status: true, cplan: dataList.cplan}
}

module.exports = router;