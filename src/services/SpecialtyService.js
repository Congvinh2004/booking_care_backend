import db from "../models/index";
let handleCreateNewSpecialtyService = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name || !data.descriptionHTML || !data.descriopMarkdown || !data.avatar) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter"
                })
            }
            else {
                await db.Specialty.create({
                    name: data.name,
                    descriptionHTML: data.descriptionHTML,
                    descriopMarkdown: data.descriopMarkdown,
                    image: data.avatar
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

let getAllSpecialtyService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let allSpecialty = await db.Specialty.findAll();
            if (allSpecialty && allSpecialty.length > 0) {
                allSpecialty.map((item) => {
                    item.image = new Buffer(item.image, 'base64').toString('binary');
                    return item;
                })
            }
            resolve({
                errCode: 0,
                errMessage: "OK",
                data: allSpecialty
            })

        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    handleCreateNewSpecialtyService: handleCreateNewSpecialtyService,
    getAllSpecialtyService: getAllSpecialtyService
}