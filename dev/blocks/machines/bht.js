// 2,147,483,647
IDRegistry.genBlockID("black_hole_tank");
Block.createBlockWithRotation("black_hole_tank", [{name: "Black Hole Tank", texture: [[side.top, 0], [blackholes.top, 0], [blackholes.sidetank, 0], [blackholes.sidetank, 0], [blackholes.sidetank, 0], [blackholes.sidetank, 0]], inCreative: true}]);

const guiBHT = new UI.StandartWindow({
 standart: {
  header: {text: {text: "Black Hole Tank"}},
  inventory: {standart: true},
  background: {standart: true}
 },

 elements: {
  "slotInput": {type: "slot", x: 500, y: 195},
  "slotOutput": {type: "slot", x: 560, y: 195},
  "name": {type: "text", x: 680, y: 100, text: "Null"},
  "count": {type: "text", x: 680, y: 120, text: "0"},
  "liquidScale": {type: "scale", x: 680, y: 100, direction: 1, value: 0.5, bitmap: "gui_water_scale", scale: GUI_SCALE}

});

Item.registerNameOverrideFunction(BlockID.black_hole_tank, function(item, name){
	item = Player.getCarriedItem();
	if(item.extra){
		return name + "\n§7" + LiquidRegistry.getLiquidName(item.extra.getString("stored")) + ": " + (item.extra.getFloat("amount") * 1000) + " mB";
	}
	return name;
});

const nativeDropItem = ModAPI.requireGlobal("Level.dropItem");

TileEntity.registerPrototype(BlockID.black_hole_tank,{

 getGuiScreen: function(){
  return guiBHU;
 },

init: function(){
		this.liquidStorage.setLimit(null, 2147483.647);
	},

	tick: function(){
		var storage = this.liquidStorage;
		var liquid = storage.getLiquidStored();
		var slot1 = this.container.getSlot("slotInput");
		var slot2 = this.container.getSlot("slotOutput");
		this.getLiquidFromItem(liquid, slot1, slot2);
		if(liquid){
			var full = LiquidLib.getFullItem(slot1.id, slot1.data, liquid);
			if(full && storage.getAmount(liquid) >= full.storage && (slot2.id == full.id && slot2.data == full.data && slot2.count < Item.getMaxStack(full.id) || slot2.id == 0)){
				storage.getLiquid(liquid, full.storage);
				slot1.count--;
				slot2.id = full.id;
				slot2.data = full.data;
				slot2.count++;
				this.container.validateAll();
			}
		}
		storage.updateUiScale("liquidScale", storage.getLiquidStored());
		this.container.setText("name", storage.getAmount(liquid));
		this.container.setText("count", this.liquidStorage.getAmount(liquid)*1000 + "mB");
		
	},

	destroyBlock: function(){
		const stored = this.liquidStorage.getLiquidStored();
		if(stored){
			const extra = new ItemExtraData();
			extra.putString("stored", stored);
			extra.putFloat("amount", this.liquidStorage.getAmount(stored));
			nativeDropItem(this.x + 0.5, this.y, this.z + 0.5, 0, BlockID.black_hole_tank, 1, this.data.meta, extra);
		}
		else{
			World.drop(this.x + 0.5, this.y, this.z + 0.5, BlockID.black_hole_tank, 1, this.data.meta);
		}
	}

});

StorageInterface.createInterface(BlockID.tank, {
	slots: {
		"slotInput": {input: true},
		"slotOutput": {output: true}
	},
	isValidInput: function(item){
		return LiquidRegistry.getFullItem(item.id, item.data, "water") || LiquidLib.getEmptyItem(item.id, item.data);
	},
	canReceiveLiquid: function(liquid, side){ return true; },
	canTransportLiquid: function(liquid, side){ return true; }
});