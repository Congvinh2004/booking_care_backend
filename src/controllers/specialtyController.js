import SpecialtyService from '../services/SpecialtyService'

let handleCreateNewSpecialty = async (req, res) => {
    try {
        let infor = await SpecialtyService.handleCreateNewSpecialtyService(req.body);
        return res.status(200).json(infor)
    }

    catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}


let getAllSpecialty = async (req, res) => {
    try {
        let listSpecialty = await SpecialtyService.getAllSpecialtyService();
        return res.status(200).json(listSpecialty)
    }

    catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}

let getDetailSpecialty = async (req, res) => {
    try {
        let dataSpecialty = await SpecialtyService.getDetailSpecialtyById(req.query.id, req.query.location);
        return res.status(200).json(dataSpecialty)
    }

    catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}

module.exports = {
    handleCreateNewSpecialty: handleCreateNewSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialty: getDetailSpecialty
}
