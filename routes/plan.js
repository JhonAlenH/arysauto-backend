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
                cservicio: getPlanServicesData.result.recordset[i].CSERVICIO,
                cservicioplan: getPlanServicesData.result.recordset[i].CSERVICIOPLAN,
                xservicio: getPlanServicesData.result.recordset[i].XSERVICIO,
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

module.exports = router;