const base = require("../../models/webMod/baseMod")

exports.login = async (req,res) => {
    try {
        const data= "hii"
        const result = await base.myapp(data);
        res.send(result)

    } catch (error) {
        res.end(error)
    }
}