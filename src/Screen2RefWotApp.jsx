//import React from 'react';
//import ReactDOM from 'react-dom';

var Screen2RefWotApp = React.createClass({
  tankClasses: [
    {
      "prettyName": "Light",
      "wgName": "lightTank",
      "localName": "light"
    },
    {
      "prettyName": "Medium",
      "wgName": "mediumTank",
      "localName": "medium"
    },
    {
      "prettyName": "Heavy",
      "wgName": "heavyTank",
      "localName": "heavy"
    },
    {
      "prettyName": "SPG",
      "wgName": "SPG",
      "localName": "spg"
    },
    {
      "prettyName": "TD",
      "wgName": "AT-SPG",
      "localName": "td"
    }
  ],

  moduleTypes: [
    { "moduleName": "suspension", "nodeName": "vehicleChassis" },
    { "moduleName": "turret", "nodeName": "vehicleTurret" },
    { "moduleName": "gun", "nodeName": "vehicleGun" },
    { "moduleName": "engine", "nodeName": "vehicleEngine" },
    { "moduleName": "radio", "nodeName": "vehicleRadio" }
  ],

  getInitialState: function() {
    return {
      battleTier: 11,
      tanksData: {},
      vehicleProfilesData: {},
      battleTierData: {},
      battleTierSpecialData: {},
      options: { 
        hasBia: 1,
        hasRammer: 1,
        hasVents: 1
      }
    }
  },

  componentDidMount: function() {
    this.wgapiVehiclesReq = $.get('/api/vehicleData', function(res) {
      this.setState({
        tanksData: res
      });
    }.bind(this));
    this.s2rapiVehicleProfilesReq = $.get('/api/vehicleTopConfigs', function(res) {
      this.setState({
        vehicleProfilesData: res
      });
    }.bind(this));
    this.localBattleTiersReq = $.get('/api/battleTiers', function(res) {
      this.setState({
        battleTierData: res
      });
    }.bind(this));
    this.localBattleTiersSpecialReq = $.get('/api/battleTiersSpecial', function(res) {
      this.setState({
        battleTierSpecialData: res
      });
    }.bind(this));
  },

  componentWillUnmount: function() {
    this.wgapiVehiclesReq.abort();
    this.localBattleTiersReq.abort();
    this.localBattleTiersSpecialReq.abort();
  },

  handleOptionsChange: function(has_bia, has_rammer, has_vents) {
    this.setState({
      options: {
        hasBia: has_bia,
        hasRammer: has_rammer,
        hasVents: has_vents
      }
    });
  },

  handleBattleTierChange: function(battleTier) {
    this.setState({
      battleTier: battleTier
    });
  },

  // getTopModuleId: function(vehicle, module_id, moduleType) {
  //   // LAZY JUST KILL IT IF MODULE_ID IS NULL, I DON"T WANT TO DEAL WITH THIS
  //   if (module_id == null) return null;
  //   // if no more next module, we are at top module, check if correct type
  //   if (!vehicle.modules_tree[module_id.toString()].next_modules) {
  //     if (moduleType.nodeName == vehicle.modules_tree[module_id.toString()].type) {
  //       return module_id;
  //     }
  //     else {
  //       return null;
  //     }    
  //   }
  //   // else for each module in the tree, rerun the search
  //   else {
  //     for (var i in vehicle.modules_tree[module_id.toString()].next_modules) {
  //       res = this.getTopModuleId(vehicle, vehicle.modules_tree[module_id.toString()].next_modules[i], moduleType);
  //       if (res != null) {
  //         return res;
  //       }
  //     }
  //     // if everything we visited was not the correct type (-1), check self
  //     if (moduleType.nodeName == vehicle.modules_tree[module_id.toString()].type) {
  //       return module_id;
  //     }
  //     else {
  //       return null;
  //     }
  //   }
  // },

  render: function() {
    // Create list to hold filtered & augmented vehicle data
    var vehicles = [];

    // Vehicle filtering by battle tier
    for (var vehicle in this.state.tanksData.data) {
      var wgVehicleClass = '';
      var wgVehicleTier = this.state.tanksData.data[vehicle].tier;
      var wgVehicleId = this.state.tanksData.data[vehicle].tank_id;
      // translate wg tank class names to local names
      for(var tankClassTranslator in this.tankClasses) {
        if (this.tankClasses[tankClassTranslator].wgName == this.state.tanksData.data[vehicle].type) {
          wgVehicleClass = this.tankClasses[tankClassTranslator].localName;
        }
      }
      // check for special tanks
      var battleTierSpecialVehicles = this.state.battleTierSpecialData.vehiclesSpecial;
      for (var specialVehicle in battleTierSpecialVehicles) {
        // If the tank is a special tank, then check if the battle tier matches
        if (battleTierSpecialVehicles[specialVehicle].tank_id == wgVehicleId && 
           (battleTierSpecialVehicles[specialVehicle].battleTiers.indexOf(this.state.battleTier) != -1)) {
          vehicles.push(this.state.tanksData.data[vehicle]);
        }
      }
      var battleTierVehicles = this.state.battleTierData.battleTiers[this.state.battleTier - 1].vehicles;
      for (var vehicleTypeInBattleTier in battleTierVehicles) {
        // check if the vehicle's tier and class combination exists
        if (battleTierVehicles[vehicleTypeInBattleTier].vehicleClass == wgVehicleClass &&
            battleTierVehicles[vehicleTypeInBattleTier].vehicleTier == wgVehicleTier) {
          vehicles.push(this.state.tanksData.data[vehicle]);
        }
      }
    }

    //Augment vehicle data with top profile data
    for (var i in vehicles) {
      vehicles[i].top_profile = this.state.vehicleProfilesData[vehicles[i].tank_id.toString()];
    }

    return (
      <div className="Screen2RefWotAppDiv">
        <TopBar options={this.state.options} battleTier={this.state.battleTier} onChangeOptions={this.handleOptionsChange} onChangeBattleTier={this.handleBattleTierChange} />
        <MainView vehicles={vehicles} options={this.state.options}/>
      </div>
    );
  }
});

var TopBar = React.createClass({
  render: function() {
    return (
      <div className="TopBar_Div">
        <AppLogo/>
        <PageDescription/>
        <PageOptions options={this.props.options} onUserInput={this.props.onChangeOptions}/>
        <BattleTierSelector battleTier={this.props.battleTier} onUserInput={this.props.onChangeBattleTier}/>
      </div>
    );
  }
});

var AppLogo = React.createClass({
  render: function() {
    return (
      <div className="AppLogo_Div">
        <img className="AppLogo_Img" src="./img/Logo-wot.png"/>
      </div>
    );
  }
});

var PageDescription = React.createClass({
  render: function() {
    return (
      <div className="PageDescription_Div">
        <span className="PageDescription_SpanDesc">Reload | Armor</span>
      </div>
    );
  }
});

var PageOptions = React.createClass({
  handleChange: function() {
    this.props.onUserInput(
      this.refs.cb_has_bia.checked,
      this.refs.cb_has_rammer.checked,
      this.refs.cb_has_vents.checked
    );
  },

  render: function() {
    return (
      <div className="PageOptions_Div">
        <span className="PageOptions_Elem PageOptions_SpanAttribute">
          <div className="PageOptions_LabelDiv">
            <span>
            Reload
            </span>
          </div>
        </span>
        <span className="PageOptions_Elem PageOptions_SpanDelim">
          <div className="PageOptions_LabelDiv">
            <span>
            //
            </span>
          </div>
        </span>
        <span className="PageOptions_Elem PageOptions_SpanModifier">
          <label className="PageOptions_LabelModifier">
            <input id="cb_has_bia" type="checkbox" ref="cb_has_bia" className="PageOptions_cbOption"
              value="1" checked={this.props.options.hasBia} onChange={this.handleChange}/>
            <div className="PageOptions_LabelDiv PageOptions_LabelDivCB">
              <span>
                BIA
              </span>
            </div>
          </label>
        </span>
        <span className="PageOptions_Elem PageOptions_SpanDelim">
          <div className="PageOptions_LabelDiv">
            <span>
            /
            </span>
          </div>
        </span>
        <span className="PageOptions_Elem PageOptions_SpanModifier">
          <label className="PageOptions_LabelModifier">
            <input id="cb_has_rammer" type="checkbox" ref="cb_has_rammer" className="PageOptions_cbOption"
              value="1" checked={this.props.options.hasRammer} onChange={this.handleChange}/>
            <div className="PageOptions_LabelDiv PageOptions_LabelDivCB">
              <span>
                Gun Rammer
              </span>
            </div>
          </label>
        </span>
        <span className="PageOptions_Elem PageOptions_SpanDelim">
          <div className="PageOptions_LabelDiv">
            <span>
            /
            </span>
          </div>
        </span>
        <span className="PageOptions_Elem PageOptions_SpanModifier">
          <label className="PageOptions_LabelModifier">
            <input id="cb_has_vents" type="checkbox" ref="cb_has_vents" className="PageOptions_cbOption"
              value="1" checked={this.props.options.hasVents} onChange={this.handleChange}/>
            <div className="PageOptions_LabelDiv PageOptions_LabelDivCB">
              <span>
                Vents
              </span>
            </div>
          </label>
        </span>
      </div>
    );
  }
});

var BattleTierSelector = React.createClass({
  // isBattleTierN: [
  //   false, // 1 [0]
  //   false, // 2 [1]
  //   false, // 3 [2]
  //   false, // 4 [3]
  //   false, // 5 [4]
  //   false, // 6 [5]
  //   false, // 7 [6]
  //   false, // 8 [7]
  //   false, // 9 [8]
  //   false, // 10 [9]
  //   true   // 11 [10]
  // ],

  handleChange: function() {
    this.props.onUserInput(
      this.refs.battleTierInput.value
    );
  },

          //<option value="11" selected={this.isBattleTierN[10]}>XI</option>
          //<option value="10" selected={this.isBattleTierN[9]}>X</option>
          //<option value="9" selected={this.isBattleTierN[8]}>IX</option>
          //<option value="8" selected={this.isBattleTierN[7]}>VIII</option>
          //<option value="7" selected={this.isBattleTierN[6]}>VII</option>
          //<option value="6" selected={this.isBattleTierN[5]}>VI</option>
          //<option value="5" selected={this.isBattleTierN[4]}>V</option>
          //<option value="4" selected={this.isBattleTierN[3]}>IV</option>
          //<option value="3" selected={this.isBattleTierN[2]}>III</option>
          //<option value="2" selected={this.isBattleTierN[1]}>II</option>
          //<option value="1" selected={this.isBattleTierN[0]}>I</option>

  render: function() {
    return (
      <div className="BattleTierSelector_Div">
        <span className="BattleTierSelector_SpanLabel">Battle Tier&nbsp;&nbsp;&nbsp;</span>
        <select className="BattleTierSelector_Select" name="battleTiers" value={this.props.battleTier} ref="battleTierInput" onChange={this.handleChange}>
          <option value="11">XI</option>
          <option value="10">X</option>
          <option value="9">IX</option>
          <option value="8">VIII</option>
          <option value="7">VII</option>
          <option value="6">VI</option>
          <option value="5">V</option>
          <option value="4">IV</option>
          <option value="3">III</option>
          <option value="2">II</option>
          <option value="1">I</option>
        </select>
      </div>
    );
  }
});

var MainView = React.createClass({
  render: function() {
    return (
      <div className="MainView_Div">
        <TableOfTanks vehicles={this.props.vehicles} options={this.props.options}/>
      </div>
    );
  }
});

var TableOfTanks = React.createClass({
  tankClasses: [
    {
      "prettyName": "Light",
      "wgName": "lightTank"
    },
    {
      "prettyName": "Medium",
      "wgName": "mediumTank"
    },
    {
      "prettyName": "Heavy",
      "wgName": "heavyTank"
    },
    {
      "prettyName": "SPG",
      "wgName": "SPG"
    },
    {
      "prettyName": "TD",
      "wgName": "AT-SPG"
    }
  ],

  nations: [
    {
      "prettyName": "China",
      "wgName": "china",
      "flagImg": "china-flag.png"
    },
    {
      "prettyName": "Czechia",
      "wgName": "czech",
      "flagImg": "czechia-flag.png"
    },
    {
      "prettyName": "France",
      "wgName": "france",
      "flagImg": "france-flag.png"
    },
    {
      "prettyName": "Germany",
      "wgName": "germany",
      "flagImg": "germany-flag.png"
    },
    {
      "prettyName": "Japan",
      "wgName": "japan",
      "flagImg": "japan-flag.png"
    },
    {
      "prettyName": "Sweden",
      "wgName": "sweden",
      "flagImg": "sweden-flag.png"
    },
    {
      "prettyName": "UK",
      "wgName": "uk",
      "flagImg": "uk-flag.png"
    },
    {
      "prettyName": "USA",
      "wgName": "usa",
      "flagImg": "usa-flag.png"
    },
    {
      "prettyName": "USSR",
      "wgName": "ussr",
      "flagImg": "ussr-flag.png"
    }
  ],

  render: function() {
    const tankClassesAsTHLabels = this.tankClasses.map(tankClass =>
      <th className="TableOfTanks_THTankClassLabel">
        {tankClass.prettyName}
      </th>
    );
    const nationsAsTableOfTanksRowNations = this.nations.map(nation =>
      <TableOfTanksRowNation nation={nation} tankClasses={this.tankClasses} options={this.props.options} 
      vehicles={
        this.props.vehicles.filter(vehicle =>
          (vehicle.nation == nation.wgName)
        )
      }/>
    );
    return (
      <table className="TableOfTanks_Table">
        <tr className="TableOfTanks_TRTankClassLabels">
          <td className="TableOfTanks_TRTankClassLabelsTDPlaceholder">
          </td>
          {tankClassesAsTHLabels}
        </tr>
        {nationsAsTableOfTanksRowNations}
      </table>
    );
  }
});

var TableOfTanksRowNation = React.createClass({

  // componentDidMount: function() {
  //   this.wgapiVehiclesReq = $.get('https://api.worldoftanks.com/wot/encyclopedia/vehicles/?application_id=7c6bb9f5b4ebb263c4fecfe190103f40', function(res) {
  //     this.setState({
  //       nationRadios: res
  //     });
  //   }.bind(this));
  //   this.localBattleTiersReq = $.get('/api/battleTiers', function(res) {
  //     this.setState({
  //       battleTierData: res
  //     });
  //   }.bind(this));
  //   this.localBattleTiersSpecialReq = $.get('/api/battleTiersSpecial', function(res) {
  //     this.setState({
  //       battleTierSpecialData: res
  //     });
  //   }.bind(this));
  // },

  // componentWillUnmount: function() {
  //   this.wgapiVehiclesReq.abort();
  //   this.localBattleTiersReq.abort();
  //   this.localBattleTiersSpecialReq.abort();
  // },

  render: function() {
    const TDNationLabelImgSrc = './img/' + this.props.nation.flagImg;
    const tankClassesAsTableOfTanksColumnClasses = this.props.tankClasses.map(tankClass =>
      <TableOfTanksColumnClass nation={this.props.nation} tankClass={tankClass} options={this.props.options}
      vehicles={
        this.props.vehicles.filter(vehicle =>
          (vehicle.type == tankClass.wgName)
        )
      }/>
    );
    return (
      <tr className="TableOfTanksRowNation_TR">
        <td className="TableOfTanksRowNation_TDNationLabel">
          <div className="TableOfTanksRowNation_TDNationLabelDiv">
            <img className="TableOfTanksRowNation_TDNationLabelImg" src={TDNationLabelImgSrc}/>
            <span className="TableOfTanksRowNation_TDNationLabelSpan">{this.props.nation.prettyName}</span>
          </div>
        </td>
        {tankClassesAsTableOfTanksColumnClasses}
      </tr>
    );
  }
});

var TableOfTanksColumnClass = React.createClass({
  getNumCols: function(tankClass) {
    if (tankClass.wgName == "lightTank") return 6;
    if (tankClass.wgName == "mediumTank") return 7;
    if (tankClass.wgName == "heavyTank") return 5;
    if (tankClass.wgName == "SPG") return 4;
    if (tankClass.wgName == "AT-SPG") return 7;
    return 6;
  },

  render: function() {
    return (
      <td className="TableOfTanksColumnClass_TD">
        <ListOfTanksWAttributes nation={this.props.nation} tankClass={this.props.tankClass} 
        options={this.props.options} vehicles={this.props.vehicles}
        numCols={this.getNumCols(this.props.tankClass)}/>
      </td>
    );
  }
});

var ListOfTanksWAttributes = React.createClass({
  render: function() {
    var vehiclesAsTDTankWAttributes = this.props.vehicles.map(vehicle =>
      <td className="ListOfTanksWAttributes_TD">
        <TankWAttributes nation={this.props.nation} tankClass={this.props.tankClass} options={this.props.options} vehicle={vehicle}/>
      </td>
    );
    var numTRs = Math.ceil(vehiclesAsTDTankWAttributes.length / this.props.numCols);
    var TDTankWAttributesInTRs = [];
    for (var i = 0; i < numTRs; i++) {
      TDTankWAttributesInTRs.push(
        <tr className="ListOfTanksWAttributes_TR">
          {vehiclesAsTDTankWAttributes.slice(i*this.props.numCols,(i+1)*this.props.numCols)}
        </tr>
      );
    }
    return (
      <table className="ListOfTanksWAttributes_Table">
        {TDTankWAttributesInTRs}
      </table>
    );
  }
});

var TankWAttributes = React.createClass({
  render: function() {
    var has_bia = this.props.options.hasBia;
    var has_vents = this.props.options.hasVents;
    var has_rammer = this.props.options.hasRammer;

    if (this.props.vehicle.top_profile.armor.turret != null) {
      var turretArmor = this.props.vehicle.top_profile.armor.turret;
      var turretArmorPretty = turretArmor.front + "/" + turretArmor.sides + "/" + turretArmor.rear;
    }
    if (this.props.vehicle.top_profile.armor.hull != null) {
      var hullArmor = this.props.vehicle.top_profile.armor.hull;
      var hullArmorPretty = hullArmor.front + "/" + hullArmor.sides + "/" + hullArmor.rear;
    }
    var reloadTimeEffectiveBy100 = Math.floor(this.props.vehicle.top_profile.gun.reload_time * 8750000 / (375*(110+5.5*has_bia+5.5*has_vents)+50000) * (1 - 0.1*has_rammer));
    var reloadTimePretty = Math.floor(reloadTimeEffectiveBy100 / 100) + "." + (((reloadTimeEffectiveBy100 % 100) < 10) ? "0" : "") + (reloadTimeEffectiveBy100 % 100 || "0") + "s"
    var divClassNames = "TankWAttributes_Div " + (this.props.vehicle.is_premium ? "TankIsPremium" : "");
    return (
      <div className={divClassNames}>
        <span className="TankWAttributes_VehicleName">{this.props.vehicle.short_name}</span><br/>
        <span className="TankWAttributes_VehicleReload">{reloadTimePretty}</span><br/>
        <span className="TankWAttributes_VehicleArmorTurret">{turretArmorPretty || "N/A"}</span><br/>
        <span className="TankWAttributes_VehicleArmorHull">{hullArmorPretty || "N/A"}</span>
      </div>
    );
  }
});

ReactDOM.render(
  <Screen2RefWotApp/>,
  document.getElementById('container')
);