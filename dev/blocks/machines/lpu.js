IDRegistry.genBlockID("latex_process");
Block.createBlock("latex_process", [
    {
        name: "Latex Processing Unit", texture: [
           [side.top,0], 
           [side.top, 0],
           [side.side, 0],
           ["latex_process", 0],
           [side.side, 0],
           [side.side, 0]
        ], inCreative: true
    }
]);

TileRenderer.setStandartModel(BlockID.tree_extrac, [[side.top, 0], [side.top, 0], [side.side, 0], ["tree_fluid_extractor", 0], [side.side, 0], [side.side, 0]]);
TileRenderer.registerRotationModel(BlockID.tree_extrac, 0, [[side.top, 0], [side.top, 0], [side.side, 0], ["tree_fluid_extractor", 0], [side.side, 0], [side.side, 0]]);
TileRenderer.registerRotationModel(BlockID.tree_extrac, 4, [[side.top, 0], [side.top, 0], [side.side, 0], ["tree_fluid_extractor", 0], [side.side, 0], [side.side, 0]]);

/*
var custom_UI = new UI.StandartWindow({
	standart: {header: {text: {text: "Created With UIEditor"}},
	background: {color: android.graphics.Color.parseColor("#b3b3b3")}, inventory: {standart: true}},
	drawing: [],
	elements: {
		"slot_0": {type: "slot", x: 350, y: 250, size: 60, visual: false, bitmap: "custom.slot_default", needClean: false, isTransparentBackground: false},
		"scale_0": {type: "scale", x: 354, y: 90, direction: 0, bitmap: "custom.latex_flow", scale: 3.2, value: 1},
		"slot_1": {type: "slot", x: 440, y: 250, size: 60, visual: false, bitmap: "custom.slot_default", needClean: false, isTransparentBackground: false},
		"slot_2": {type: "slot", x: 600, y: 150, size: 60, visual: false, bitmap: "custom.slot_default", needClean: false, isTransparentBackground: false},
		"scale_1": {type: "scale", x: 420, y: 60, direction: 0, bitmap: "custom.scale", scale: 3.2, value: 1},
		"scale_2": {type: "scale", x: 530, y: 158, direction: 0, bitmap: "custom.progress_background", scale: 3.2, value: 1},
		"scale_3": {type: "scale", x: 430, y: 140, direction: 0, bitmap: "custom.gui_water_scale", scale: 3.2, value: 1},
	}
});
*/
var guiLPU = new UI.StandartWindow({
	standart: {
		header: {text: {text: Translation.translate("Latex Processing Unit")}},
		inventory: {standart: true},
		background: {standart: true}
	},

	drawing: [
		{type: "bitmap", x: 550, y: 158, bitmap: "arrow_bg", scale: GUI_SCALE},
		{type: "bitmap", x: 660, y: 135, bitmap: "rf_scale", scale: GUI_SCALE}
	
	],
	
	elements: {
		"slotResult": {type: "slot", x: 600, y: 150, size: 60},
		"progressScale": {type: "scale", x: 550, y: 158, direction: 0, value: .5, bitmap: "arrow_full", scale: GUI_SCALE},
		
		"scaleLatex": {type: "scale", x: 410, y: 90,  direction: 1, value: .5, bitmap: "gui_water_scale", scale: GUI_SCALE},
		
		"slotLatex0": {type: "slot", x: 350, y: 250, isValid: function(id, count, data){
            return LiquidLib.getItemLiquid(id, data) == "latex";
        }},
		"slotLatex1": {type: "slot", x: 350, y: 185, isValid: function(){return false;}},


       "scaleWater": {type: "scale", x: 520, y: 140, direction: 1, value: .5, bitmap: "gui_water_scale", scale: GUI_SCALE},
       
		"slotWater0": {type: "slot", x: 460, y: 250, isValid: function(id, count, data){
            return LiquidLib.getItemLiquid(id, data) == "water";
        }},
		"slotWater1": {type: "slot", x: 460, y: 185, isValid: function(){return false;}},
		
        "energyScale": {type: "scale", x: 660, y: 135, direction: 1, value: .5, bitmap: "rf_scale_full", scale: GUI_SCALE}
	}
});

MachineRegistry.registerElectricMachine(BlockID.latex_process, {
	defaultValues:{
		power_tier: 1,
		energy_storage: 20000,
		energy_consumption: 5,
		work_time: 40,
		progress: 0,
		isActive: false,
	},
	
	getGuiScreen: function(){
       return guiLPU;
    },
	
	init: function(){
		this.liquidStorage.setLimit("water", 10);
		this.liquidStorage.setLimit("latex", 8);
		this.renderModel();
	},
	
	getLiquidFromItem: MachineRegistry.getLiquidFromItem,
	
    tick: function(){
		StorageInterface.checkHoppers(this);
		
		var newActive = false;
		var output = this.container.getSlot("slotResult");
		if(this.liquidStorage.getAmount("latex") >= 0.075 && this.liquidStorage.getAmount("water") >= 1){
			if(this.data.energy >= this.data.energy_consumption){
				this.data.energy -= this.data.energy_consumption;
				this.data.progress ++;
				newActive = true;
				this.startPlaySound();
			}
			if(this.data.progress >= this.data.work_time){
				this.liquidStorage.getLiquid("latex", 0.075);
				this.liquidStorage.getLiquid("water", 1);
				this.data.progress = 0;
				output.id = ItemID.tiny_dry_rubber;
				output.count++;
			}
		}
		else {
			this.data.progress = 0;
		}
		if(!newActive)
			this.stopPlaySound(true);
		this.setActive(newActive);
		
		
		var slot1 = this.container.getSlot("slotWater0");
		var slot2 = this.container.getSlot("slotWater1");
		this.getLiquidFromItem("water", slot1, slot2);
		
		var slot1 = this.container.getSlot("slotLatex0");
		var slot2 = this.container.getSlot("slotLatex1");
		this.getLiquidFromItem("latex", slot1, slot2);
		
		var energyStorage = this.getEnergyStorage();
		this.data.energy = Math.min(this.data.energy, energyStorage);
		
		this.container.setScale("progressScale", this.data.progress / this.data.work_time);
		this.liquidStorage.updateUiScale("scaleLatex", "latex");
		this.liquidStorage.updateUiScale("scaleWater", "water");
		//this.container.setScale("scaleLatex", this.liquidStorage.getAmount("latex") / this.liquidStorage.getLimit("latex"));
		this.container.setScale("energyScale", this.data.energy / energyStorage);
    },
	
	getEnergyStorage: function(){
		return this.data.energy_storage;
	},
	
	getStartSoundFile: function(){
		return "Machines/TurnOn.ogg";
    },
	getInterruptSoundFile: function(){
		return "Machines/TurnOff.ogg";
    },
    
	renderModel: MachineRegistry.renderModelWithRotation,
	energyReceive: MachineRegistry.basicEnergyReceiveFunc
	
});

TileRenderer.setRotationPlaceFunction(BlockID.latex_process, true);

StorageInterface.createInterface(BlockID.latex_process, {
	slots: {
		"slotWater0": {input: true},
		"slotWater1": {output: true},
		"slotLatex0": {input: true},
		"slotLatex1": {output: true}
	},
	canReceiveLiquid: function(liquid){
		return liquid == "water" || liquid == "latex";
	},
	canTransportLiquid: function(liquid){ return false; },
	getLiquidStored: function(storage){
		return storage == "input" ? "water" : "latex";
	}
});
