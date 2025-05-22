import db from "../models/index";
require('dotenv').config();
import emailService from './emailService'
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';


let buildUrlEmail = (doctorId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`
    return result;
}
let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('check data: ', data)
            if (!data.email || !data.doctorId || !data.date || !data.timeType) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter"
                })
            }
            else {
                let idToken = uuidv4();
                let doctorInfor = await db.User.findOne({
                    where: { id: data.doctorId },
                    attributes: ['firstName', 'lastName'],
                    raw: true
                })
                let schedule = await db.Allcode.findOne({
                    where: { type: 'TIME', keyMap: data.timeType },
                    attributes: ['valueVi', 'valueEn'],
                    raw: true
                });
                let gender = await db.Allcode.findOne({
                    where: { type: 'GENDER', keyMap: data.selectedGender },
                    attributes: ['valueVi', 'valueEn'],
                    raw: true
                });

                console.log('check doctorInfor: ', doctorInfor)

                let doctorName = data.language === 'vi' ? `${doctorInfor.firstName} ${doctorInfor.lastName}` : `${doctorInfor.lastName} ${doctorInfor.firstName}`
                // let scheduleTime = data.language === 'vi' ? schedule.valueVi : schedule.valueEn
                let patientGender = data.language === 'vi' ? gender.valueVi : gender.valueEn
                await emailService.sendSimpleEmail({
                    reciverEmail: data.email,
                    patientName: data.fullName,
                    date: `${moment(parseInt(data.date)).format('DD/MM/YYYY')}`,
                    patientPhoneNumber: data.phoneNumber,
                    patientAddress: data.address,
                    patientSeason: data.reason,
                    patientGender: patientGender,
                    time: data.timeString,
                    doctorName: doctorName,
                    redirectLink: buildUrlEmail(data.doctorId, idToken)

                })
                //  upsert patient
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    default: {
                        email: data.email,
                        roleId: 'R3'
                    },
                })


                if (user && user[0]) {
                    await db.Booking.findOrCreate({
                        where: {
                            patientId: user[0].id,
                            doctorId: data.doctorId,
                            date: data.date,
                            timeType: data.timeType
                        },
                        defaults: {
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            token: idToken
                        }



                    })
                }
                resolve({
                    errCode: 0,
                    errMessage: 'save infor patient succeed !'
                })
            }

        }
        catch (e) {
            reject(e);
        }
    })
}
let postVerifyBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.doctorId || !data.token) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter !'
                })
            }
            else {
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        statusId: 'S1'
                    },
                    raw: false
                })
                if (appointment) {
                    appointment.statusId = 'S2';
                    await appointment.save();
                    resolve({
                        errCode: 0,
                        errMessage: 'Update the appointment succseed!'
                    })
                }
                else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Appointment confirmed or not available'
                    })
                }
            }
        } catch (e) {
            reject(e)
        }
    })
}


module.exports = {
    postBookAppointment: postBookAppointment,
    buildUrlEmail: buildUrlEmail,
    postVerifyBookAppointment: postVerifyBookAppointment
}