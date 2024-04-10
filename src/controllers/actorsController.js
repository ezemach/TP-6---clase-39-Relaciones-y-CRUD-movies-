const db = require('../database/models');
// const sequelize = db.sequelize;


const actorsController = {
    'list': (req, res) => {
        db.Actor.findAll({
            include:['movies']
        })
            .then(actors => {
                // return res.send(actors)
                res.render('actorsList.ejs', {actors})
            })
    },
    'detail': (req, res) => {
        db.Actor.findByPk(req.params.id,{
            include:['movies','favourite']
        }
            )
            .then(actors => {
                res.render('actorsDetail.ejs', {actors});
            });
    }

}

module.exports = actorsController;