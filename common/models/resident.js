'use strict';
var debug = require('debug')('loopback:log:models:Resident');

module.exports = function(Resident) {
    /* Function that return the last 4 wasteCollections for user logged-in */
    Resident.__get__lastFourWasteCollection = function(id, cb){
        return Resident.find({
            where: {
                id: id
            },
            fields: ['id', 'name', 'bucketId'],
            include:{
                relation: 'bucket',
                scope: {
                    fields: ['id', 'wasteCollections'],
                    include: {
                        relation: 'wasteCollections',
                        scope: {
                            fields: ['id', 'weight', 'created', 'scaleId'],
                            limit: '4',
                            include: {
                                relation: 'scale',
                                scope: {
                                    fields: ['recyclerId'],
                                    include: {
                                        relation: 'recycler',
                                        scope: {
                                            fields: ['name']
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    };

    Resident.remoteMethod('__get__lastFourWasteCollection', {
        accepts: {arg: 'id', type: 'string'},
        returns: {arg: 'data', type: 'object'},
        http: {verb: 'GET', path: '/:id/lastFourWasteCollection'}
    });

    /*Function that return the date of collection of his Community*/
    Resident.__get__dateCollection = function(id, cb){
        Resident.find({
            fields: ['communityId'],
            where: {
                id: id
            },
            include: {
                relation: 'community',
                scope: {
                    fields: ['name', 'dateCollection']
                }
            }
        })
        .then(function(res){
            if(!res){
                console.log('No hay resultados')
                cb(null, false)
            }
            else {
                let response = res.map(item => {return item.toJSON()})
                let date = {
                    "community": response[0]['community']['name'],
                    "dateCollection": response[0]['community']['dateCollection']
                }
                cb(null, date)
            }
        })
    };

    Resident.remoteMethod('__get__dateCollection', {
        accepts: {arg: 'id', type: 'string'},
        returns: {arg: 'data', type: 'object'},
        http: {verb: 'GET', path: '/:id/dateCollection'}
    });



    //Disable Remote Methods 
    Resident.disableRemoteMethodByName('findOne');
};