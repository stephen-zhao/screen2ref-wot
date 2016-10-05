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

  getInitialState: function() {
    return {
      battleTier: 11,
      tanksData: {},
      battleTierData: {},
      battleTierSpecialData: {}
    }
  },

  componentDidMount: function() {
    this.wgapiVehiclesReq = $.get('https://api.worldoftanks.com/wot/encyclopedia/vehicles/?application_id=7c6bb9f5b4ebb263c4fecfe190103f40', function(res) {
      this.setState({
        tanksData: res
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

  handleUserInput: function(battleTier) {
    this.setState({
      battleTier: battleTier
    });
  },

  render: function() {
    var vehicles = [];
    for (var vehicle in this.state.tanksData.data) {
      var wgVehicleClass = '';
      var wgVehicleTier = this.state.tanksData.data[vehicle].tier;
      var wgVehicleId = this.state.tanksData.data[vehicle].tank_id;
      // translate wg tank class names to local names
      for(var tankClassTransator in this.tankClasses) {
        if (this.tankClasses[tankClassTransator].wgName == this.state.tanksData.data[vehicle].type) {
          wgVehicleClass = this.tankClasses[tankClassTransator].localName;
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
          vehicles.push(this.state.tanksData.data[vehicle])
        }
      }
    }
    return (
      <div className="Screen2RefWotAppDiv">
        <TopBar battleTier={this.state.battleTier} onUserInput={this.handleUserInput}/>
        <MainView vehicles={vehicles}/>
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
        <BattleTierSelector battleTier={this.props.battleTier} onUserInput={this.props.onUserInput}/>
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
        <span className="PageDescription_SpanDesc">Reload | Alpha | Armor</span>
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
        <TableOfTanks vehicles={this.props.vehicles}/>
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
      <TableOfTanksRowNation nation={nation} tankClasses={this.tankClasses} vehicles={
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
  render: function() {
    const TDNationLabelImgSrc = './img/' + this.props.nation.flagImg;
    const tankClassesAsTableOfTanksColumnClasses = this.props.tankClasses.map(tankClass =>
      <TableOfTanksColumnClass nation={this.props.nation} tankClass={tankClass} vehicles={
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
  render: function() {
    return (
      <td className="TableOfTanksColumnClass_TD">
        <ListOfTanksWAttributes nation={this.props.nation} tankClass={this.props.tankClass} vehicles={this.props.vehicles}/>
      </td>
    );
  }
});

var ListOfTanksWAttributes = React.createClass({
  render: function() {
    var vehiclesAsTDTankWAttributes = this.props.vehicles.map(vehicle =>
      <td className="ListOfTanksWAttributes_TD">
        <TankWAttributes nation={this.props.nation} tankClass={this.props.tankClass} vehicle={vehicle}/>
      </td>
    );
    const TDS_PER_TR = 6;
    var numTRs = Math.ceil(vehiclesAsTDTankWAttributes.length / TDS_PER_TR);
    var TDTankWAttributesInTRs = [];
    for (var i = 0; i < numTRs; i++) {
      TDTankWAttributesInTRs.push(
        <tr className="ListOfTanksWAttributes_TR">
          {vehiclesAsTDTankWAttributes.slice(i*TDS_PER_TR,i*TDS_PER_TR+TDS_PER_TR)}
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
    if (this.props.vehicle.default_profile.armor.turret != null) {
      var turretArmor = this.props.vehicle.default_profile.armor.turret;
      var turretArmorPretty = turretArmor.front + "/" + turretArmor.sides + "/" + turretArmor.rear;
    }
    if (this.props.vehicle.default_profile.armor.hull != null) {
      var hullArmor = this.props.vehicle.default_profile.armor.hull;
      var hullArmorPretty = hullArmor.front + "/" + hullArmor.sides + "/" + hullArmor.rear;
    }
    var reloadTimeBy90 = Math.floor(this.props.vehicle.default_profile.gun.reload_time * 90);
    var reloadTimePretty = Math.floor(reloadTimeBy90 / 100) + "." + (((reloadTimeBy90 % 100) < 10) ? "0" : "") + (reloadTimeBy90 % 100 || "0") + "s"
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