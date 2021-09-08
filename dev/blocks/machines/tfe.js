IDRegistry.genBlockID("tree_extrac");
Block.createBlock("tree_extrac", [
    {
        name: "Tree Fluid Extractor", texture: [
           [side.top,0], 
           [side.top, 0],
           [side.side, 0],
           [side.side, 0],
           ["tree_fluid_extractor", 0],
           [side.side, 0]
        ], inCreative: true
    }
]);

var guiTFE = new UI.StandartWindow({
	standart: {
		header: {text: {text: Translation.translate("Tree Fluid Extractor")}},
		inventory: {standart: true},
		background: {standart: true}
	},

	drawing: [
		{type: "bitmap", x: 449, y: 149, bitmap: "3", scale: 0.75}
	],
	
	elements: {
		"textAmount": {type: "text", x: 500, y: 230, width: 300, height: 30, text: "0 mB"},
		
		"progressScale": {type: "scale", x: 450, y: 150, direction: 0, value: .5, bitmap: "4", scale: 0.75},
		"scaleLatex": {type: "scale", x: 520, y: 150, direction: 1, value: 0.5, bitmap: "gui_water_scale", overlay: "gui_liquid_storage_overlay", scale: GUI_SCALE},
		"slotLatex0": {type: "slot", x: 550, y: 280, isValid: function(id, count, data){
            return LiquidLib.getFullItem(id, data, "latex") ? true : false;
        }},
        
		"slotLatex1": {type: "slot", x: 550, y: 150, isValid: function(){return false;}}
	}
});

MachineRegistry.registerPrototype(BlockID.tree_extrac, {
	defaultValues:{
		
		progress: 0,
		isActive: false,
	},
	
	getGuiScreen: function(){
       return guiTFE;
    },
	
	init: function(){
		this.liquidStorage.setLimit("latex", 8);
	},
	
	addLiquidToItem: MachineRegistry.addLiquidToItem,
	
    tick: function(){
		StorageInterface.checkHoppers(this);
		
		var newActive = false;
		if(World.getBlockID(this.x,this.y,this.z+1)==17 || World.getBlockID(this.x,this.y,this.z+1)==162){
			newActive = true;
			this.data.progress ++;
			if(this.data.progress >= 100){
				this.liquidStorage.addLiquid("latex", 1);
				this.data.progress = 0;
				World.destroyBlock(this.x,this.y,this.z+1, false);
			}
		}
		
		else {
			this.data.progress = 0;
		}
		if(this.liquidStorage.getAmount("latex") >= 8){
			newActive = false;
			this.data.progress = 0;
			}
		this.setActive(newActive);
		
		
		var slot1 = this.container.getSlot("slotLatex0");
		var slot2 = this.container.getSlot("slotLatex1");
		this.addLiquidToItem("latex", slot1, slot2);
		
		this.container.setScale("progressScale", this.data.progress / 100);
		this.liquidStorage.updateUiScale("scaleLatex", "latex");
		this.container.setText("textAmount", this.liquidStorage.getAmount("latex")*1000 + "mB");
    }

});

StorageInterface.createInterface(BlockID.water_conden, {
	slots: {
		"slotLatex0": {input: true},
		"slotLatex1": {output: true}
	},
	isValidInput: function(item){
		return LiquidLib.getFullItem(item.id, item.data, "latex")? true : false;
	},
	canReceiveLiquid: function(liquid, side){ return false; },
	canTransportLiquid: function(liquid, side){ return true; }
});
