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
        cplan: requestBody.cplan
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
        paseguradora: requestBody.paseguradora,
        parys: requestBody.parys,
        mcosto: requestBody.mcosto,
        brcv: requestBody.brcv,
        bactivo: requestBody.bactivo,
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania,
        cusuario: requestBody.cusuario
    }
    //Busca código del plan
    let searchCodePlan = await bd.searchCodePlanQuery().then((res) => res);
    if(searchCodePlan.error){return { status: false, code: 500, message: searchCodePlan.error }; }
    if(searchCodePlan.result.rowsAffected > 0){ 

        //Crea el plan
        let cplan = searchCodePlan.result.recordset[0].CPLAN + 1;

        let createPlan = await bd.createPlanQuery(dataList, cplan).then((res) => res);
        if(createPlan.error){return { status: false, code: 500, message: createPlan.error }; }
        if(createPlan.result.rowsAffected > 0){  
            if(requestBody.services){
                //Crea los servicios del plan
                let serviceList = [];
                for(let i = 0; i < requestBody.services.length; i++){
                    serviceList.push({
                        ctiposervicio: requestBody.services[i].ctiposervicio,
                    })
                }
                let createService = await bd.createServiceFromPlanQuery(serviceList, dataList, cplan).then((res) => res);
                if(createService.error){ return  { status: false, code: 500, message: createService.error }; }
            }
            let searchLastPlan = await bd.searchLastPlanQuery().then((res) => res);
            if(searchLastPlan.error){ return  { status: false, code: 500, message: searchLastPlan.error }; }
            if(createPlan.result.rowsAffected > 0){return {status: true, cplan: searchLastPlan.result.recordset[0].CPLAN}}
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


module.exports = router;