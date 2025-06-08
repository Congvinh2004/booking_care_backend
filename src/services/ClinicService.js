import db from "../models/index";
let createNewClinicService = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name ||
                !data.address ||
                !data.descriptionHTML ||
                !data.descriptionMarkdown ||
                !data.imageBase64) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter"
                })
            }
            else {
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                })
                resolve({
                    errCode: 0,
                    errMessage: "OK"
                })
            }
        }
        catch (e) {
            reject(e)
        }

    })

}

let getAllClinicService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Clinic.findAll();
            if (data && data.length > 0) {
                data.map((item) => {
                    item.image = new Buffer(item.image, 'base64').toString('binary');
                    return item;
                })
            }
            resolve({
                errCode: 0,
                errMessage: "OK",
                data: data
            })

        } catch (e) {
            reject(e)
        }
    })
}

let getDetailClinicById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter"
                })
            }

            else {
                let data = await db.Clinic.findOne({
                    where: { id: inputId },
                    attributes: ['name', 'address', 'descriptionHTML', 'descriptionMarkdown'],
                    raw: true

                })
                if (data) {
                    let doctorClinic = [];


                    doctorClinic = await db.Doctor_Infor.findAll({
                        where: {
                            clinicId: inputId,
                        },
                        attributes: ['doctorId', 'provinceId'],
                        raw: true
                    })
                    data.doctorClinic = doctorClinic
                }
                else {
                    data = {}
                }
                resolve({
                    errCode: 0,
                    errMessage: "OK",
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}


module.exports = {
    createNewClinicService: createNewClinicService,
    getAllClinicService: getAllClinicService,
    getDetailClinicById: getDetailClinicById

}