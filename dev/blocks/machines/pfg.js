IDRegistry.genBlockID("pf_generator");
Block.createBlock("pf_generator", [
    {
        name: "Petrified Fuel Generator", texture: [
           [side.top,0], 
           [side.top, 0],
           [side.side, 0],
           ["petrified_fuel_generator", 0],
           [side.side, 0],
           [side.side, 0]
        ], inCreative: true
    }
]);

TileRenderer.setStandartModel(BlockID.pf_generator, [[side.top, 0], [side.top, 0], [side.side, 0], ["petrified_fuel_generator", 0], [side.side, 0], [side.side, 0]]);
TileRenderer.registerRotationModel(BlockID.pf_generator, 0, [[side.top, 0], [side.top, 0], [side.side, 0], ["petrified_fuel_generator", 0], [side.side, 0], [side.side, 0]]);
TileRenderer.registerRotationModel(BlockID.pf_generator, 4, [[side.top, 0], [side.top, 0], [side.side, 0], ["petrified_fuel_generator", 0], [side.side, 0], [side.side, 0]]);

var guiPFG = new UI.StandartWindow({
	standart: {
		header: {text: {text: Translation.translate("Petrified Fuel Generator")}},
		inventory: {standart: true},
		background: {standart: true}
	},
	
	drawing: [
		{type: "bitmap", x: 530, y: 144, bitmap: "energy_bar_background", scale: GUI_SCALE},
		{type: "bitmap", x: 450, y: 150, bitmap: "fire_background", scale: GUI_SCALE},
	],
	
	elements: {
		"energyScale": {type: "scale", x: 530 + GUI_SCALE * 4, y: 144, direction: 0, value: 0.5, bitmap: "energy_bar_scale", scale: GUI_SCALE},
		"burningScale": {type: "scale", x: 450, y: 150, direction: 1, value: 0.5, bitmap: "fire_scale", scale: GUI_SCALE},
		"slotEnergy": {type: "slot", x: 441, y: 75, isValid: function(id){return ChargeItemRegistry.isValidItem(id, "Rf", 1);}},
		"slotFuel": {type: "slot", x: 441, y: 212,
			isValid: function(id, count, data){
				return Recipes.getFuelBurnDuration(id, data) > 0;
			}
		},
		"textInfo1": {type: "text", x: 642, y: 142, width: 300, height: 30, text: "0/"},
		"textInfo2": {type: "text", x: 642, y: 172, width: 300, height: 30, text: "100000"}
	}
});

MachineRegistry.registerGenerator(BlockID.pf_generator, {
	defaultValues: {
		meta: 0,
		burn: 0,
		burnMax: 0,
		isActive: false
	},
	
	getGuiScreen: function(){
		return guiPFG;
	},
	
	getFuel: function(slotName){
		var fuelSlot = this.container.getSlot(slotName);
		if (fuelSlot.id > 0){
			var burn = Recipes.getFuelBurnDuration(fuelSlot.id, fuelSlot.data);
			if (burn && !LiquidRegistry.getItemLiquid(fuelSlot.id, fuelSlot.data)){
				fuelSlot.count--;
				this.container.validateSlot(slotName);
				
				return burn;
			}
		}
		return 0;
	},
	
	tick: function(){
		StorageInterface.checkHoppers(this);
		var energyStorage = this.getEnergyStorage();
		
		if(this.data.burn <= 0 && this.data.energy + 10 < energyStorage){
			this.data.burn = this.data.burnMax = this.getFuel("slotFuel") / 4;
		}
		if(this.data.burn > 0 && 
		  (!this.data.isActive && this.data.energy + 100 <= energyStorage ||
		  this.data.isActive && this.data.energy + 10 <= energyStorage)){
			this.data.energy += 10;
			this.data.burn--;
			this.activate();
			this.startPlaySound("Machines/Furnace.ogg");
		} else {
			this.deactivate();
			this.stopPlaySound();
		}
		
		this.data.energy -= ChargeItemRegistry.addEnergyTo(this.container.getSlot("slotEnergy"), "Rf", this.data.energy, 1);
		
		this.container.setScale("burningScale", this.data.burn / this.data.burnMax || 0);
		this.container.setScale("energyScale", this.data.energy / energyStorage);
		this.container.setText("textInfo1", this.data.energy + "/");
	},
	
	getEnergyStorage: function(){
		return 100000;
	},
	
	energyTick: function(type, src){
		var output = Math.min(32, this.data.energy);
		this.data.energy += src.add(output) - output;
	},
	
	renderModel: MachineRegistry.renderModelWithRotation
	
});

TileRenderer.setRotationPlaceFunction(BlockID.pf_generator);

StorageInterface.createInterface(BlockID.pf_generator, {
	slots: {
		"slotFuel": {input: true}
	},
	isValidInput: function(item){
		return Recipes.getFuelBurnDuration(item.id, item.data) > 0;
	}
});
