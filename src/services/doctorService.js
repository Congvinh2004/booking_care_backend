
import db from "../models/index";
require('dotenv').config();
import _ from 'lodash';

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE
let getTopDoctorHome = (limitInput) => {

    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: { roleId: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password']
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] }
                ],
                raw: true,
                nest: true

            })

            resolve({
                errCode: 0,
                data: users
            })
        }
        catch (e) {
            reject(e);
        }
    })
}

let getAllDoctors = () => {

    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image']
                }
            })

            resolve({
                errCode: 0,
                data: doctors
            })

        } catch (e) {
            reject(e)
        }



    })
}

let checkRequiredFields = (inputData) => {
    console.log('check inputdata: ', inputData)
    let isValid = true;
    let element = '';
    let arrFeilds = [
        'doctorId',
        'contentHTML',
        'contentMarkdown',
        'action',
        'selectedPrice',
        'selectedPayment',
        'selectedProvince',
        'addressClinic',
        'nameClinic',
        'note',
        // 'specialtyId',


    ]
    for (let i = 0; i < arrFeilds.length; i++)
        if (!inputData[arrFeilds[i]]) {
            isValid = false;
            element = arrFeilds[i];
            break;
        }
    return {
        isValid: isValid,
        element: element
    }

}

let saveDetailInforDoctor = (inputData) => {

    return new Promise(async (resolve, reject) => {
        try {
            let checkObj = checkRequiredFields(inputData);
            if (checkObj.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter ${checkObj.element}`
                })
            }
            else {
                // upsert to Markdown
                if (inputData.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId
                    })

                } else if (inputData.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false

                    })
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = inputData.contentHTML;
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
                        doctorMarkdown.description = inputData.description;
                        doctorMarkdown.updateAt = new Date()
                        await doctorMarkdown.save()
                    }

                }

                // upsert to Doctor_infor  table
                let doctorInfor = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: inputData.doctorId,

                    }, raw: false

                })
                if (doctorInfor) {
                    // update
                    doctorInfor.doctorId = inputData.doctorId;
                    doctorInfor.priceId = inputData.selectedPrice;
                    doctorInfor.provinceId = inputData.selectedProvince;
                    doctorInfor.paymentId = inputData.selectedPayment;

                    doctorInfor.nameClinic = inputData.nameClinic;
                    doctorInfor.addressClinic = inputData.addressClinic;
                    doctorInfor.note = inputData.note;
                    doctorInfor.specialtyId = inputData.specialtyId;
                    doctorInfor.clinicId = inputData.clinicId;
                    await doctorInfor.save()
                }
                else {
                    // create
                    await db.Doctor_Infor.create({
                        doctorId: inputData.doctorId,
                        priceId: inputData.selectedPrice,
                        provinceId: inputData.selectedProvince,
                        paymentId: inputData.selectedPayment,
                        nameClinic: inputData.nameClinic,
                        addressClinic: inputData.addressClinic,
                        note: inputData.note,
                        specialtyId: inputData.specialtyId,
                        clinicId: inputData.clinicId
                    })

                }


            }

            resolve({
                errCode: 0,
                errMessage: 'save infor doctor succeed !'
            })


        } catch (e) {
            reject(e);
        }
    })
}


let getDetailDoctorById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "missing required parameter"
                })
            }
            else {
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        { model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown'] },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },

                            ]

                        },
                    ],
                    raw: false,
                    nest: true
                })
                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }
                if (!data) {
                    data = {}
                }
                resolve({
                    errCode: 0,
                    data: data
                })
            }

        } catch (e) {
            reject(e);
        }
    })

}

let getDoctorMarkdownService = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "missing required parameter"
                })
            }
            else {
                let data = await db.Markdown.findOne({
                    where: { doctorId: inputId }
                    // attributes: {
                    //     exclude: ['password']
                    // },

                })
                if (!data) {

                    resolve({
                        errCode: 1,
                        data: data
                    })

                }
                resolve({
                    errCode: 0,
                    data: data
                })

            }
        } catch (e) {
            reject(e)
        }


    })
}
let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {


            if (!data.arrSchedule || !data.doctorId || !data.date) {
                resolve({
                    errCode: 1,
                    errMessage: 'missing required parameter'
                })
            }
            else {
                let schedule = data.arrSchedule;
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;

                    })
                }
                console.log('hoidanit check data send: ', schedule)

                let existing = await db.Schedule.findAll(
                    {
                        where: { doctorId: data.doctorId, date: data.date },

                        attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                        raw: true

                    }
                );
                console.log('check existing: ', existing)
                console.log('check create: ', schedule)

                // convert data


                // compare different
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date

                })

                // create
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(
                        toCreate
                    )
                }

                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                }
                )

            }


        } catch (e) {
            reject(e);
        }


    })
}


let getScheduleByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required prameters'
                })

            }
            else {
                let dataSchedule = await db.Schedule.findAll({

                    where: {
                        doctorId: doctorId,
                        date: date,

                    },
                    include: [
                        { model: db.Allcode, as: 'timeTypeData', attributes: ['valueEn', 'valueVi'] },

                    ],
                    raw: false,
                    nest: true
                    // raw: false
                })
                if (!dataSchedule) data = []

                resolve({

                    errCode: 0,
                    data: dataSchedule
                })
            }


        } catch (e) {
            reject(e)
        }
    }
    )
}



let getExtraInforDoctorById = (idInput) => {

    return new Promise(async (resolve, reject) => {
        try {
            if (!idInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required prameters'
                })
            } else {
                let data = await db.Doctor_Infor.findOne({

                    where: {
                        doctorId: idInput
                    },
                    attributes: {
                        exclude: ['id', 'doctorId']
                    },
                    include: [
                        { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },

                    ],
                    raw: false,
                    nest: true
                })
                if (!data) {
                    data = {}
                }
                resolve({
                    errCode: 0,
                    data: data
                })
            }

        } catch (e) {
            reject(e)
        }

    })
}

let getProfileDoctorById = (inputId) => {

    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required prameters'
                })
            } else {
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        { model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown'] },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },

                            ]

                        },
                    ],
                    raw: false,
                    nest: true
                })
                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }
                if (!data) {
                    data = {}
                }
                resolve({
                    errCode: 0,
                    data: data
                })
            }

        } catch (e) {
            reject(e)
        }

    })
}
module.exports = {

    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    saveDetailInforDoctor: saveDetailInforDoctor,
    getDetailDoctorById: getDetailDoctorById,
    getDoctorMarkdownService: getDoctorMarkdownService,
    bulkCreateSchedule: bulkCreateSchedule,
    getScheduleByDate: getScheduleByDate,
    getExtraInforDoctorById: getExtraInforDoctorById,
    getProfileDoctorById: getProfileDoctorById,
}