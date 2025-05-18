import db from "../models/index";
require('dotenv').config();
import emailService from './emailService'
import moment from 'moment';
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
                console.log('check schedule: ', schedule)

                let doctorName = doctorInfor ? `${doctorInfor.firstName} ${doctorInfor.lastName}` : ''
                let scheduleTime = schedule ? schedule.valueVi : ''
                let patientGender = gender.valueVi
                await emailService.sendSimpleEmail({
                    reciverEmail: data.email,
                    patientName: data.fullName,
                    date: `${moment(parseInt(data.date)).format('DD/MM/YYYY')}`,
                    patientPhoneNumber: data.phoneNumber,
                    patientAddress: data.address,
                    patientSeason: data.reason,
                    patientGender: patientGender,
                    time: scheduleTime,
                    doctorName: doctorName,
                    redirectLink: 'https://www.youtube.com/@hoidanit'

                })
                //  upsert patient
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    default: {
                        email: data.email,
                        roleId: 'R3'
                    },
                })

                // console.log('hoir ddan it check user: ', user[0])
                // create a booking record

                if (user && user[0]) {
                    await db.Booking.findOrCreate({
                        where: { patientId: user[0].id },
                        defaults: {
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType
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

module.exports = {
    postBookAppointment: postBookAppointment
}