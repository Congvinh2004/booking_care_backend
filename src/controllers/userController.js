let handleLogin = (req, res) => {
    return res.status(200).json(
        {
            mesage: 'hello world',
        }
    )
}
module.exports = {
    handleLogin,
}