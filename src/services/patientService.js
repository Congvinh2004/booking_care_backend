import db from "../models/index";
require('dotenv').config();
import emailService from './emailService'
let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.date || !data.timeType) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter"
                })
            }
            else {


                await emailService.sendSimpleEmail({
                    reciverEmail: data.email,
                    patientName: 'hoi dan IT patient name',
                    time: '8:00 - 9:00 Chủ Nhật 25/7/2024',
                    doctorName: 'HoiDanIT',
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

                console.log('hoir ddan it check user: ', user[0])
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