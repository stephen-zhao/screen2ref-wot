var https = require('https');
var config = require('./config.js');
var mysql = require('mysql');
var util = require('./util.js');

module.exports = {

  WoTmoduleTypes: [
    { "moduleName": "suspension", "nodeName": "vehicleChassis" },
    { "moduleName": "turret", "nodeName": "vehicleTurret" },
    { "moduleName": "gun", "nodeName": "vehicleGun" },
    { "moduleName": "engine", "nodeName": "vehicleEngine" },
    { "moduleName": "radio", "nodeName": "vehicleRadio" }
  ],

  addProfileToDb: function(data, tank_id, profile_id) {
    console.log('DEBUG data:', data);
    console.log('DEBUG str tank_id:', tank_id.toString());
    console.log('DEBUG profile_id:', profile_id);
    var profile_data = JSON.stringify(data.data[tank_id.toString()]);
    console.log('DEBUG profile_data:', profile_data);
    var connection = mysql.createConnection(config.dbConnectionOptions);
    connection.connect();
    var sql = 
      'INSERT INTO vehicle_profile ( tank_id, profile_id, profile_data ) '+
      '  VALUES ( ? ) '
      +
      '  ON DUPLICATE KEY UPDATE tank_id=?, profile_data=?';
    var values = [tank_id, profile_id, profile_data];
    var escapedValues2 = mysql.escape(values[2]);
    console.log(escapedValues2);
    connection.query(sql, [
        values, 
        mysql.escape(values[0]), 
        profile_data
        ], 
    function(err, res) {
      if (err) throw err;
      connection.end(function(err) {
        console.log('Added vehicle profile', profile_id,'to database.');
      });
    });
  },

  getListTopModuleIds: function(vehicle) {
    console.log('DEBUG vehicle:', vehicle);

    var recursivelyGetTopModuleInfo = function(vehicle, module_id, moduleType) {
      console.log('DEBUG module_id:', module_id);
      console.log('DEBUG moduleType:', moduleType);
      // if at leaf of module tree, return module info if correct type, otherwise return null
      if (!vehicle.modules_tree[module_id.toString()].next_modules) {
        console.log('DEBUG at leaf');
        if (moduleType.nodeName == vehicle.modules_tree[module_id.toString()].type) {
          return [
            module_id, 
            vehicle.modules_tree[module_id.toString()].price_xp,
            vehicle.modules_tree[module_id.toString()].price_credit
          ];
        }
        else {
          return null;
        }
      }
      // otherwise, we're at a branch node
      else {
        // for each of its next modules, we run the search
        var listFromNextModules = [];
        for (var i in vehicle.modules_tree[module_id.toString()].next_modules) {
          listFromNextModules.push(recursivelyGetTopModuleInfo(vehicle, vehicle.modules_tree[module_id.toString()].next_modules[i], moduleType));
        }
        // filter out the nulls
        listFromNextModules = listFromNextModules.filter((x) => { return x != null; });
        console.log('DEBUG listFromNextModules:', listFromNextModules);
        // if empty, check self, return self if correct type, else return null
        if (listFromNextModules == false) {
          if (moduleType.nodeName == vehicle.modules_tree[module_id.toString()].type) {
            return [
              module_id, 
              vehicle.modules_tree[module_id.toString()].price_xp,
              vehicle.modules_tree[module_id.toString()].price_credit
            ];
          }
          else {
            return null;
          }
        }
        // otherwise, determine the cost in xp and credits (weighted) and return info
        else {
          var listWeightedCosts = listFromNextModules.map((m) => {
            return m[1] + m[2]/10;
          });
          var largesti = util.getIndexOfLargest(listWeightedCosts);
          return [
            listFromNextModules[largesti][0], 
            listFromNextModules[largesti][1] + vehicle.modules_tree[module_id.toString()].price_xp,
            listFromNextModules[largesti][2] + vehicle.modules_tree[module_id.toString()].price_credit
          ];
        }
      }

    }

    // make a list of default profile modules
    var defaultModules = [];
    for (var t in this.WoTmoduleTypes) {
      defaultModules.push(vehicle.default_profile.modules[this.WoTmoduleTypes[t].moduleName + "_id"]);
    }
    defaultModules = defaultModules.filter((x) => { return x != null; });
    console.log('DEBUG defaultModules:', defaultModules)

    // for each type of module
    var listFromDefaultModules = [];
    for (var t in this.WoTmoduleTypes) {
      var listOfTFromDefaultModules = [];
      // for each default module, recursively get top modules under the subtree of each default module, make one final base case check
      for (var mi in defaultModules) {
        listOfTFromDefaultModules.push(recursivelyGetTopModuleInfo(
          vehicle, 
          defaultModules[mi], 
          this.WoTmoduleTypes[t]
        ));
      }
      // filter out the nulls
      listOfTFromDefaultModules = listOfTFromDefaultModules.filter((x) => { return x != null; });
      var listWeightedCosts = listOfTFromDefaultModules.map((m) => {
        return m[1] + m[2]/10;
      });
      var largesti = util.getIndexOfLargest(listWeightedCosts);
      listFromDefaultModules.push(listOfTFromDefaultModules[largesti]);
    }
    listFromDefaultModules = listFromDefaultModules.filter((x) => { return x != null && x != undefined; });

    console.log('DEBUG listFromDefaultModules:', listFromDefaultModules);
    return listFromDefaultModules.map((x) => { return x[0]; });
  },

  getProfileId: function(modules) {
    var filtered = modules.filter((x) => { return x != null; });
    filtered.sort((a,b) => { return a - b; });
    return filtered.join('-');
  },

  processVehicles: function(data, isUpdateDb) {
    // Augment vehicle data with top config data
    var vehicles = data.data;

    for (var k in vehicles) {
      var defaultModules = {};
      for (var j in this.WoTmoduleTypes) {
        defaultModules[this.WoTmoduleTypes[j].moduleName] = vehicles[k].default_profile.modules[this.WoTmoduleTypes[j].moduleName + "_id"];
      }
      vehicles[k].topModules = this.getListTopModuleIds(vehicles[k]);
    }

    if (isUpdateDb) {
      var listVehicleKeys = [];
      for (var k in vehicles) {
        listVehicleKeys.push(k);
      }
      var getProfilesRecursively = (function(i, vehicle) {
        setTimeout((function () {
          console.log('============ TANK PROFILE #'+i+' ============')
          var topModulesArr = vehicle.topModules;
          console.log('DEBUG topModulesArr:', topModulesArr);
          var profile_id = this.getProfileId(topModulesArr);
          var wgWotProfileApi = 'https://api.worldoftanks.com/wot/encyclopedia/vehicleprofile/'
            +'?application_id='+config.wgAppID
            +'&tank_id='+vehicle.tank_id
            +'&profile_id='+profile_id;
          console.log('Making GET request to:', wgWotProfileApi);
          var getCallback = (function(res) {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            var body = '';
            var onEndCallback = 
            res.on('data', (d) => { body += d; });
            res.on('end', (function() {
              this.addProfileToDb(JSON.parse(body), vehicle.tank_id, profile_id); 
            }).bind(this));
          }).bind(this);
          https.get(wgWotProfileApi, getCallback);
          ++i;
          if (i < listVehicleKeys.length) getProfilesRecursively(i, vehicles[listVehicleKeys[i]]);
        }).bind(this), 1000);
      }).bind(this);
      var starti = 0;
      getProfilesRecursively(starti, vehicles[listVehicleKeys[starti]]);
    }
  }

}