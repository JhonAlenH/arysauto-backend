const router = require('express').Router();
const helper = require('../src/helper');
const bd = require('../src/bd');
const nodemailer = require('nodemailer');

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
        ccompania: requestBody.ccompania
    };
    let estatus; 
    let searchCorporativeIssuanceCertificates = await bd.searchCorporativeIssuanceCertificates(searchData).then((res) => res);
    if(searchCorporativeIssuanceCertificates.error){ return  { status: false, code: 500, message: searchCorporativeIssuanceCertificates.error }; }
    if(searchCorporativeIssuanceCertificates.result.rowsAffected > 0){
        let jsonList = [];
        for(let i = 0; i < searchCorporativeIssuanceCertificates.result.recordset.length; i++){
            if(searchCorporativeIssuanceCertificates.result.recordset[i].IRENOVACION == 'NU'){
                estatus = 'Nuevo';
            }else if(searchCorporativeIssuanceCertificates.result.recordset[i].IRENOVACION == 'RE'){
                estatus = 'Renovado';
            }
            jsonList.push({
                ccontratoflota: searchCorporativeIssuanceCertificates.result.recordset[i].CCONTRATOFLOTA,
                cmarca: searchCorporativeIssuanceCertificates.result.recordset[i].CMARCA,
                xmarca: searchCorporativeIssuanceCertificates.result.recordset[i].XMARCA,
                cmodelo: searchCorporativeIssuanceCertificates.result.recordset[i].CMODELO,
                xmodelo: searchCorporativeIssuanceCertificates.result.recordset[i].XMODELO,
                cversion: searchCorporativeIssuanceCertificates.result.recordset[i].CVERSION,
                xversion: searchCorporativeIssuanceCertificates.result.recordset[i].XVERSION,
                xplaca: searchCorporativeIssuanceCertificates.result.recordset[i].XPLACA,
                xnombre: searchCorporativeIssuanceCertificates.result.recordset[i].XNOMBRE,
                xestatusgeneral: estatus,
                xcliente: searchCorporativeIssuanceCertificates.result.recordset[i].XCLIENTE,
            });
        }
        return { status: true, list: jsonList };
    }
    else{ return { status: false, code: 404, message: 'Fleet Contract Management not found.' }; }
}

router.route('/search-all').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationSearchAllCorporativeIssuanceCertificates(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationSearchAllCorporativeIssuanceCertificates' } });
        });
    }
});

const operationSearchAllCorporativeIssuanceCertificates = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let searchData = {
        ccarga: requestBody.ccarga,
        clote: requestBody.clote,
        ccompania: requestBody.ccompania
    };
    let estatus; 
    let searchAllCorporativeIssuanceCertificates = await bd.searchAllCorporativeIssuanceCertificatesQuery(searchData).then((res) => res);
    if(searchAllCorporativeIssuanceCertificates.error){ return  { status: false, code: 500, message: searchAllCorporativeIssuanceCertificates.error }; }
    if(searchAllCorporativeIssuanceCertificates.result.rowsAffected > 0){
        let jsonList = [];
        for(let i = 0; i < searchAllCorporativeIssuanceCertificates.result.recordset.length; i++){
            if(searchAllCorporativeIssuanceCertificates.result.recordset[i].IRENOVACION == 'NU'){
                estatus = 'Nuevo';
            }else if(searchAllCorporativeIssuanceCertificates.result.recordset[i].IRENOVACION == 'RE'){
                estatus = 'Renovado';
            }else if(searchAllCorporativeIssuanceCertificates.result.recordset[i].IRENOVACION == 'VE'){
                estatus = 'Vencido';
            }
            jsonList.push({
                ccontratoflota: searchAllCorporativeIssuanceCertificates.result.recordset[i].CCONTRATOFLOTA,
                cmarca: searchAllCorporativeIssuanceCertificates.result.recordset[i].CMARCA,
                xmarca: searchAllCorporativeIssuanceCertificates.result.recordset[i].XMARCA,
                cmodelo: searchAllCorporativeIssuanceCertificates.result.recordset[i].CMODELO,
                xmodelo: searchAllCorporativeIssuanceCertificates.result.recordset[i].XMODELO,
                cversion: searchAllCorporativeIssuanceCertificates.result.recordset[i].CVERSION,
                xversion: searchAllCorporativeIssuanceCertificates.result.recordset[i].XVERSION,
                xplaca: searchAllCorporativeIssuanceCertificates.result.recordset[i].XPLACA,
                xnombre: searchAllCorporativeIssuanceCertificates.result.recordset[i].XNOMBRE,
                xestatusgeneral: estatus,
                xcliente: searchAllCorporativeIssuanceCertificates.result.recordset[i].XCLIENTE,
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
        ccontratoflota: requestBody.ccontratoflota
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
        xcliente: searchReceipt.result.recordset[0].XCLIENTE,
        xrif_cliente: searchReceipt.result.recordset[0].XDOCIDENTIDAD,
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
        xtipo: requestBody.xtipo,
        xclase: requestBody.xclase,
    };
    let searchCode = await bd.searchCodeFlotaQuery().then((res) => res);
    if(searchCode.error){return { status: false, code: 500, message: searchCode.error }; }
    if(searchCode.result.rowsAffected > 0){ 
        let id = searchCode.result.recordset[0].ID + 1;
        if(userData){
            let createInclusionContract = await bd.createInclusionContractQuery(userData, id).then((res) => res);
            if(createInclusionContract.error){ return { status: false, code: 500, message: createInclusionContract.error }; }
        }
    }else{
        return { status: false, code: 500, message: "Ha ocurrido un error, no se pudo guardar la información."};
    }

    return { status: true, code: 200};
}

router.route('/correo').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationCorreo(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationCorreo' } });
        });
    }
});

const operationCorreo = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'contactoarysauto@gmail.com',
              pass: 'hyyzpwrfwvbwbtsm'
            }
          });

        let mailOptions = {
            from: 'contactoarysauto@gmail.com',
            to: 'alenjhon9@gmail.com',
            subject: '¡Bienvenido a ArysAutoClub!',
            html: `
            <html>
            <head>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  background-color: #f5f5f5;
                }
                .container {
                  width: 100%;
                  height: 100vh;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background-color: #f5f5f5;
                }
                .inner-container {
                  text-align: center;
                  background-color: #ffffff;
                  border-radius: 10px;
                  padding: 20px;
                  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
                }
                .logo {
                  width: 165px;
                  height: auto;
                  margin-right: 20px;
                }
                .content {
                  text-align: left;
                  margin-top: 20px;
                }
                .content h2,
                .content h4,
                .content p {
                  margin: 0;
                  color: #0070c0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <table class="inner-container" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <img class="logo" src="https://i.ibb.co/sPCnfhH/Arys-logo.png" alt="Logo">
                      <h2>Hola <span style="color: #0070C0;">Jhon Alen</span>,</h2>
                      <h4>¡Te damos la bienvenida a ArysAutoClub!</h4>
                      <h4>Ahora podrás disfrutar de todos los beneficios de ArysAutoClub, tu plataforma online</h4>
                      <div style="display: flex; align-items: center;">
                        <img class="logo" src="https://i.ibb.co/ThJRqPr/arys-muneco.png" alt="Logo">
                        <div>
                          <h4>Para acceder a nuestro canal de autogestión online, puedes hacerlo con:</h4>
                          <h4>Correo electrónico</h4>
                          <h2 style="color:#0070c0;">alenjhon9@gmail.com</h2>
                          <h4>Contraseña</h4>
                          <h2 style="color:#0070c0;">Ar654321!</h2>
                        </div>
                      </div>
                      <h4>¿Qué ventajas tienes como usuario registrado?</h4>
                      <p>Realizar trámites y consultas desde el lugar donde estés, acceder y agendar todos los servicios de forma digital asociados a tu perfil.</p>
                      <h4>Conoce lo que puedes hacer <a href="https://arysauto.com/">Click para ir al sistema</a>.</h4>
                      <p style="font-size: 18px; font-style: italic; border-radius: 10px; background-color: lightgray; padding: 10px;">Conduce tu vehículo, del resto nos encargamos nosotros</p>
                    </td>
                  </tr>
                </table>
              </div>
            </body>
            </html>
            `
          };
        
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log('Error al enviar el correo:', error);
          } else {
            console.log('Correo enviado correctamente:', info.response);
            return {status: true}
          }
        });
}

router.route('/exclude').post((req, res) => {
    if(!req.header('Authorization')){
        res.status(400).json({ data: { status: false, code: 400, message: 'Required authorization header not found.' } });
        return;
    }else{
        operationExcludePropietary(req.header('Authorization'), req.body).then((result) => {
            if(!result.status){
                res.status(result.code).json({ data: result });
                return;
            }
            res.json({ data: result });
        }).catch((err) => {
            console.log(err.message);
            res.status(500).json({ data: { status: false, code: 500, message: err.message, hint: 'operationExcludePropietary' } });
        });
    }
});

const operationExcludePropietary = async(authHeader, requestBody) => {
    if(!helper.validateAuthorizationToken(authHeader)){ return { status: false, code: 401, condition: 'token-expired', expired: true }; }
    let updateData = {
        ccontratoflota: requestBody.ccontratoflota,
        cestatusgeneral: requestBody.cestatusgeneral
    };
    console.log(updateData)
    let excludePropietary = await bd.excludePropietaryQuery(updateData).then((res) => res);
    if(excludePropietary.error){ return  { status: false, code: 500, message: excludePropietary.error }; }
    if(excludePropietary.result.rowsAffected > 0){ return { status: true }; }
}

module.exports = router;