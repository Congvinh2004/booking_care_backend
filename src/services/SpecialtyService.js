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


module.exports = {
    handleCreateNewSpecialtyService: handleCreateNewSpecialtyService
}