const router = require('express').Router();
const bd = require('../src/bd');
const helper = require('../src/helper');

router.route('/detail').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code:400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationDetailServiceRequest(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message)
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationDetailServiceRequest' } });
        });
    }
});

const operationDetailServiceRequest = async(authHeader, requestBody) => { 
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let serviceRequestData = {
        cpais: requestBody.cpais,
        ccompania: requestBody.ccompania,
        csolicitudservicio: requestBody.csolicitudservicio
    };
    console.log(serviceRequestData)
    let getServiceRequestData = await bd.getServiceRequestDataQuery(serviceRequestData).then((res) => res);
    if(getServiceRequestData.error){ return { status: false, code: 500, message: getServiceRequestData.error }; }
    if(getServiceRequestData.result.rowsAffected == 0){ return { status: false, code: 404, message: 'Service Request not found.' }; }
    let tracings = [];
    let getServiceRequestTracingsData = await bd.getServiceRequestTracingsDataQuery(serviceRequestData.csolicitudservicio).then((res) => res);
    if(getServiceRequestTracingsData.error){ return { status: false, code: 500, message: getServiceRequestTracingsData.error }; }
    if(getServiceRequestTracingsData.result.rowsAffected > 0){
        for(let i = 0; i < getServiceRequestTracingsData.result.recordset.length; i++){
            let tracing = {
                cseguimientosolicitudservicio: getServiceRequestTracingsData.result.recordset[i].CSEGUIMIENTOSOLICITUDSERVICIO,
                ctiposeguimiento: getServiceRequestTracingsData.result.recordset[i].CTIPOSEGUIMIENTO,
                xtiposeguimiento: getServiceRequestTracingsData.result.recordset[i].XTIPOSEGUIMIENTO,
                cmotivoseguimiento: getServiceRequestTracingsData.result.recordset[i].CMOTIVOSEGUIMIENTO,
                xmotivoseguimiento: getServiceRequestTracingsData.result.recordset[i].XMOTIVOSEGUIMIENTO,
                fseguimientosolicitudservicio: getServiceRequestTracingsData.result.recordset[i].FSEGUIMIENTOSOLICITUDSERVICIO,
                bcerrado: getServiceRequestTracingsData.result.recordset[i].BCERRADO,
                xobservacion: getServiceRequestTracingsData.result.recordset[i].XOBSERVACION ? helper.decrypt(getServiceRequestTracingsData.result.recordset[i].XOBSERVACION) : undefined
            }
            tracings.push(tracing);
        }
    }
    return {
        status: true,
        csolicitudservicio: getServiceRequestData.result.recordset[0].CSOLICITUDSERVICIO,
        isolicitante: getServiceRequestData.result.recordset[0].ISOLICITANTE,
        fgestion: getServiceRequestData.result.recordset[0].FGESTION,
        fcreacion: getServiceRequestData.result.recordset[0].FCREACION,
        bcubierto: getServiceRequestData.result.recordset[0].BCUBIERTO,
        bactivo: getServiceRequestData.result.recordset[0].BACTIVO,
        cprocedencia: getServiceRequestData.result.recordset[0].CPROCEDENCIA,
        ccontratoflota: getServiceRequestData.result.recordset[0].CCONTRATOFLOTA,
        cplan: getServiceRequestData.result.recordset[0].CPLAN,
        xnombre: getServiceRequestData.result.recordset[0].XNOMBRE,
        xapellido: getServiceRequestData.result.recordset[0].XAPELLIDO,
        xdocidentidad: getServiceRequestData.result.recordset[0].XDOCIDENTIDAD,
        xplaca: getServiceRequestData.result.recordset[0].XPLACA,
        xmarca: getServiceRequestData.result.recordset[0].XMARCA,
        xmodelo: getServiceRequestData.result.recordset[0].XMODELO,
        xversion: getServiceRequestData.result.recordset[0].XVERSION,
        fano: getServiceRequestData.result.recordset[0].FANO,
        ctiposervicio: getServiceRequestData.result.recordset[0].CTIPOSERVICIO,
        cservicio: getServiceRequestData.result.recordset[0].CSERVICIO,
        xtiposervicio: getServiceRequestData.result.recordset[0].XTIPOSERVICIO,
        xservicio: getServiceRequestData.result.recordset[0].XSERVICIO,
        cproveedor: getServiceRequestData.result.recordset[0].CPROVEEDOR,
        xproveedor: getServiceRequestData.result.recordset[0].XNOMBREPROVEEDOR,
        xrazonsocial: getServiceRequestData.result.recordset[0].XRAZONSOCIAL,
        xestado: getServiceRequestData.result.recordset[0].XESTADO,
        xciudad: getServiceRequestData.result.recordset[0].XCIUDAD,
        xdireccion: getServiceRequestData.result.recordset[0].XDIRECCIONPROVEEDOR,
        tracings: tracings
    }
}

module.exports = router;