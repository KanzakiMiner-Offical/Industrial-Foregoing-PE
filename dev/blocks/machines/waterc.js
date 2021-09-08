
IDRegistry.genBlockID("water_conden");
Block.createBlock("water_conden", [
    {
        name: "Water Condensator", texture: [
           [side.top,0], 
           [water.top, 0],
           [water.side, 0],
           [water.side, 0],
           [water.side, 0],
           [water.side, 0]
        ], inCreative: true
    }
]);
/*
TileRenderer.setStandartModel(BlockID.water_conden, [[side.top, 0], [water.top, 0], [water.side, 0], [water.side 0], [water.side, 0], [water.side, 0]]);
TileRenderer.registerRotationModel(BlockID.water_conden, 0, [[side.top, 0], [water.top, 0], [water.side, 0], [water.side, 0], [water.side, 0], [water.side, 0]]);
TileRenderer.registerRotationModel(BlockID.water_conden, 4, [[side.top, 0], [water.top, 0], [water.side, 0], [water.side, 0], [water.side, 0], [water.side, 0]]);
*/

var guiWC = new UI.StandartWindow({
	standart: {
		header: {text: {text: Translation.translate("Water Condensator")}},
		inventory: {standart: true},
		background: {standart: true}
	},

	drawing: [
	{type: "image", x: 480, y: 350, bitmap: "3", scale: 0.75},
	],

	elements: {
		"progressScale": {type: "scale", x: 480, y: 350, direction: 0, bitmap: "4", scale: 0.75, value: 1},
		"textAmount": {type: "text", x: 500, y: 230, width: 300, height: 30, text: "0 mB"},
		"liquidScale": {type: "scale", x: 493, y: 171, direction: 1, value: 0.5, bitmap: "gui_water_scale", overlay: "gui_liquid_storage_overlay", scale: GUI_SCALE},
		"slotLiquid1": {type: "slot", x: 550, y: 280,
			isValid: function(id, count, data){
				return LiquidLib.getFullItem(id, data, "water")? true : false;
			}
		},
		"slotLiquid2": {type: "slot", x: 550, y: 150, isValid: function(){return false;}}
		
	}
});

MachineRegistry.registerPrototype(BlockID.water_conden, {
	defaultValues: {
		progress: 0,
		isActive: false
	},
	
	getGuiScreen: function(){
       return guiWC;
    },
	
	init: function(){
		this.liquidStorage.setLimit("water", 8);
	},
	
	addLiquidToItem: MachineRegistry.addLiquidToItem,
	
    tick: function(){
		StorageInterface.checkHoppers(this);
		
		var newActive = false;
		if(World.getBlockID(this.x+1,this.y,this.z)==9 || World.getBlockID(this.x-1,this.y,this.z)==9 || World.getBlockID(this.x,this.y,this.z+1)==9 || World.getBlockID(this.x,this.y,this.z-1)==9){
			newActive = true;
			this.data.progress ++;
			this.container.setScale("progressScale", this.data.progress / 50);
			if(this.data.progress >= 50){
				this.liquidStorage.addLiquid("water", 0.1);
				this.data.progress = 0;
			}
		}
		else {
			newActive = true;
			this.data.progress ++;
			this.container.setScale("progressScale", this.data.progress / 120);
			if(this.data.progress >= 120){
				this.liquidStorage.addLiquid("water", 0.01);
				this.data.progress = 0;
			}
		}
		if(this.liquidStorage.getAmount("water") >= 8){
			newActive = false;
			this.data.progress = 0;
			}
		this.setActive(newActive);
		
		
		var slot1 = this.container.getSlot("slotLiquid1");
		var slot2 = this.container.getSlot("slotLiquid2");
		this.addLiquidToItem("water", slot1, slot2);
	
		this.liquidStorage.updateUiScale("liquidScale", "water");
		this.container.setText("textAmount", this.liquidStorage.getAmount("water")*1000 + "mB");
	}
	
});

TileRenderer.setRotationPlaceFunction(BlockID.water_conden);

StorageInterface.createInterface(BlockID.water_conden, {
	slots: {
		"slotLiquid1": {input: true},
		"slotLiquid2": {output: true}
	},
	isValidInput: function(item){
		return LiquidLib.getFullItem(item.id, item.data, "water")? true : false;
	},
	canReceiveLiquid: function(liquid, side){ return false; },
	canTransportLiquid: function(liquid, side){ return true; }
});