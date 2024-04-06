import db from "../models/index";
import bcrypt from 'bcryptjs';
const salt = bcrypt.genSaltSync(10);
let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            console.log('Hash error: ', e)
            reject(e);
        }
    })


}

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};

            let isExist = await checkUserEmail(email);
            if (isExist) {
                // user already exist
                let user = await db.User.findOne({
                    attributes: ['email', 'password', 'roleId'],
                    where: { email: email },

                    raw: true
                })
                if (user) {
                    // compare password
                    let check = await bcrypt.compareSync(password, user.password)
                    console.log('check condition: ', check);
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = 'ok',
                            delete user.password
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong password';
                    }
                }
                else {
                    userData.errCode = 2;
                    userData.errMessage = `User's not found~`
                }
            } else {
                //return error
                userData.errCode = 1.
                userData.errMessage = "your's Email isn't exist in your system. Plz try other elmail"
            }
            resolve(userData);

        } catch (e) {
            reject(e);
        }
    })



}
let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            })
            if (user) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === 'ALL') {
                users = db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }

                })
            } if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            resolve(users)
        } catch (e) {
            reject(e);
        }
    })
}

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: "Your email is already in usedl, plz try anoter email !"
                })
            }
            else {

                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    gender: data.gender === '1' ? true : false,
                    roleId: data.roleId,
                })
                resolve({
                    errCode: 0,
                    errMessage: 'OK',
                })
            }



        } catch (e) {
            reject(e)
        }
    })
}



let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        let foundUser = await db.User.findOne({
            where: { id: userId }
        })
        if (!foundUser) {
            resolve({
                errCode: 2,
                errMessage: `The user inn't exist`
            })
        }
        // if (foundUser) {
        //     await foundUser.destroy();
        // }
        await db.User.destroy({

            where: { id: userId }
        })



        resolve({
            errCode: 0,
            message: `the user is deleted`
        })
    })

}


let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 2,
                    errMessage: "Missing required parameters !"
                })
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            })
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                await user.save();
                //     {
                //     firstName: data.firstName,
                //     lastName: data.lastName,
                //     address: data.address

                // }), {where: { id: userId.id },}
                resolve({
                    errCode: 0,
                    message: "Update the user succeeds !"
                })
            }
            else {
                resolve({
                    errCode: 1,
                    message: "User's not found !"
                })
            }


        } catch (e) {
            reject(e)


        }

    })
}
module.exports = {
    handleUserLogin,
    getAllUsers,
    createNewUser,
    deleteUser,
    updateUserData,
}