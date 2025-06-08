import db from "../models/index";
require('dotenv').config();
import emailService from './emailService'
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

let buildUrlEmail = (doctorId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`
    return result;
}
let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let qrCode = Math.random().toString(36).substring(2, 11); // 9 ký tự ngẫu nhiên
            // Tạo ảnh QR từ chuỗi randomCode
            let qrImage = await QRCode.toDataURL(qrCode);

            console.log('check qrcode: ', qrCode)
            console.log('check qrImage: ', qrImage)

            let base64Data = qrImage.replace(/^data:image\/png;base64,/, "");
            let qrBuffer = Buffer.from(base64Data, 'base64');
            console.log('check data: ', data)
            if (!data.email?.trim() || !data.doctorId || !data.birthday || !data.dateTime || !data.timeType || !data.fullName || !data.selectedGender || !data.address) {
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

                let gender = await db.Allcode.findOne({
                    where: { type: 'GENDER', keyMap: data.selectedGender },
                    attributes: ['valueVi', 'valueEn'],
                    raw: true
                });

                console.log('check doctorInfor: ', doctorInfor)
                console.log('check time: ', moment(data.date).format('DD/MM/YYYY HH:mm:ss'))

                let doctorName = data.language === 'vi' ? `${doctorInfor.firstName} ${doctorInfor.lastName}` : `${doctorInfor.lastName} ${doctorInfor.firstName}`
                let patientGender = data.language === 'vi' ? gender.valueVi : gender.valueEn
                await emailService.sendSimpleEmail({
                    receiverEmail: data.email,
                    patientName: data.fullName,
                    birthday: `${moment(parseInt(data.birthday)).format('DD/MM/YYYY')}`,
                    patientPhoneNumber: data.phoneNumber,
                    patientAddress: data.address,
                    patientSeason: data.reason,
                    patientGender: patientGender,
                    time: data.timeString,
                    doctorName: doctorName,
                    qrCode: qrBuffer ? qrBuffer : '',
                    redirectLink: buildUrlEmail(data.doctorId, idToken)

                })
                //  upsert patient
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: 'R3',
                        gender: data.selectedGender,
                        address: data.address,
                        firstName: data.fullName,
                    },
                })


                if (user && user[0]) {
                    await db.Booking.findOrCreate({
                        where: {
                            patientId: user[0].id,
                            doctorId: data.doctorId,
                            date: data.dateTime,
                            timeType: data.timeType
                        },
                        defaults: {
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.dateTime,
                            timeType: data.timeType,
                            token: idToken,
                            qrCode: qrCode
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