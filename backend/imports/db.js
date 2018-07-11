var mysql = require('mysql'),
    async = require('async');

var config = require('../config.json');

var PRODUCTION_DB = 'app_prod_database',
    TEST_DB = 'app_test_database'

exports.MODE_TEST = 'mode_test'
exports.MODE_PRODUCTION = 'mode_production'

var state = {
    pool: null,
    mode: null,
}

exports.connect = function (mode, done) {
    state.pool = mysql.createPool({
        host: config.mysql.host,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database
    })

    state.mode = mode
    done()
}

exports.get = function () {
    return state.pool
}

exports.fixtures = function (data, done) {
    var pool = state.pool
    if (!pool) return done(new Error('Missing database connection.'))

    var names = Object.keys(data.tables)
    async.each(names, function (name, cb) {
        async.each(data.tables[name], function (row, cb) {
            var keys = Object.keys(row),
                values = keys.map(function (key) {
                    return "'" + row[key] + "'"
                })

            pool.query('INSERT INTO ' + name + ' (' + keys.join(',') + ') VALUES (' + values.join(',') + ')', cb)
        }, cb)
    }, done)
}

exports.drop = function (tables, done) {
    var pool = state.pool
    if (!pool) return done(new Error('Missing database connection.'))

    async.each(tables, function (name, cb) {
        pool.query('DELETE * FROM ' + name, cb)
    }, done)
}

exports.selectFromTable = function(table, toSearch, toMatch, callback) {
    state.pool.query(`SELECT * FROM ` + table + ` WHERE ` + toSearch + ` = '` + toMatch + `'`, callback);
}

exports.getUserWithUsername = function(username, callback) {
    selectFromTable('users', 'user_id', username, function (err, result) {
        if (err) {
            callback(err, null);
        } else if (result.length === 0) {
            callback(null, {});
        } else {
            callback(null, result[0]);
        }
    })
}

exports.updateAUsersProperty = function(username, field, info, callback) {
    exports.getUserWithUsername(username, function (err, user) {
        if (err) {
            callback(err, null);
        } else {
            if(typeof info === "object"){
                info = JSON.stringify(info);
            }
            connection.query(`UPDATE users SET ${field} = '${info}' WHERE user_id = '${username}'`, function (err, result) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, true);
                }
            })
        }
    })
}

exports.getPropertyOfAUser = function(username, property, callback) {
    getUserWithUsername(username, function (err, user) {
        if (err) {
            callback(err, null);
        } else {
            callback(err, user[property]);
        }
    })
}

exports.parseInventory = function(username, callback){
    getPropertyOfAUser(username, property, function(err, inventory){
        if(err){
            callback(err, null);
            return;
        }

        // turns '[]' = [];
        callback(null, JSON.parse(inventory));
    })
}