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


module.exports = {
    handleCreateNewSpecialty: handleCreateNewSpecialty
}
