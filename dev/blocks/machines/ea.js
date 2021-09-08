IDRegistry.genBlockID("enchantment_aplicator");
Block.createBlock("enchantment_aplicator", [
    {
        name: "Enchantment Aplicator", texture: [
           [enchantAp.top,0], 
           [enchantAp.top, 0],
           [enchantAp.side, 0],
           [enchantAp.front, 0],
           [enchantAp.side, 0],
           [enchantAp.side, 0]
        ], inCreative: true
    }
]);

var guiEA = new UI.StandartWindow({
	standart: {header: {text: {text: "Enchantment Aplicator"}},
	background: {color: android.graphics.Color.parseColor("#b3b3b3")}, inventory: {standart: true}},
	drawing: [
	{type: "scale", x: 530, y: 138, direction: 0, bitmap: "progress_background", scale: 3.2, value: 1},
	{type: "scale", x: 700, y: 130, direction: 0, bitmap: "rf_scale", scale: 3.2, value: 1}
    ],
	elements: {
		"slotLiquid1": {type: "slot", x: 640, y: 190, size: 60},
		"slotLiquid2": {type: "slot", x: 640, y: 130, size: 60},
		"slotInput": {type: "slot", x: 500, y: 190, size: 60},
		"slotOutput1": {type: "slot", x: 700, y: 130, size: 60},
		/*
		"slotOutput2": {type: "slot", x: 350, y: 130, size: 60},
		"slotOutput3": {type: "slot", x: 350, y: 200, size: 60},
		"slotOutput4":  {type: "slot", x: 700, y: 200, size: 60},
		*/
		
		"energyScale": {type: "scale", x: 700, y: 130, direction: 0, bitmap: "rf_scale_full", scale: 3.2, value: 1},
		"progressScale": {type: "scale", x: 530, y: 138, direction: 0, bitmap: "progress_background", scale: 3.2, value: 1},
		"liquidScale": {type: "scale", x: 450, y: 120, direction: 1, value: 0.5, bitmap: "gui_water_scale", overlay: "gui_liquid_storage_overlay", scale: GUI_SCALE}
	}
});

var EnchID = Native.Enchantment;


var enchantList = [];

function addEL(enchantType, maxLv, minLv) {
	enchantList.push({
		enchantType: enchantType,
		minLv: minLv,
		maxLv: maxLv
	});
}

addEL(EnchID.AQUA_AFFINITI, 1, 1);
addEL(EnchID.BANE_OF_ARTHROPODS, 5, 1);
addEL(EnchID.PROTECTION, 4, 1);
addEL(EnchID.FIRE_PROTECTION, 4, 1);
addEL(EnchID.MENDING, 1, 1);

addEL(EnchID.FEATHER_FALLING, 4, 1);
addEL(EnchID.BLAST_PROTECTION, 4, 1);
addEL(EnchID.PROJECTILE_PROTECTION, 4, 1);
addEL(EnchID.THORNS, 3, 1);
addEL(EnchID.RESPIRATION, 3, 1);

addEL(EnchID.DEPTH_STRIDER, 3, 1);
addEL(EnchID.FROST_WALKER, 2, 1);
addEL(EnchID.SHARPNESS, 5, 1);
addEL(EnchID.SMITE, 5, 1);
addEL(EnchID.KNOCKBACK, 2, 1);

addEL(EnchID.FIRE_ASPECT, 2, 1);
addEL(EnchID.LOOTING, 3, 1);
addEL(EnchID.SWEEPING, 3, 1);
addEL(EnchID.EFFICIENCY, 5, 1);
addEL(EnchID.SILK_TOUCH, 1, 1);

addEL(EnchID.UNBREAKING, 5, 1);
addEL(EnchID.FORTUNE, 3, 1);
addEL(EnchID.POWER, 5, 1);
addEL(EnchID.PUNCH, 2, 1);
addEL(EnchID.FLAME, 1, 1);

addEL(EnchID.INFINITY, 1, 1);
addEL(EnchID.LUCK_OF_THE_SEA, 3, 1);
addEL(EnchID.LURE, 3, 1);
/*

*/

MachineRegistry.registerElectricMachine(BlockID.enchantment_aplicator, {
	defaultValues:{
		power_tier: 1,
		energy_storage: 55000,
		energy_consumption: 100,
		work_time: 50,
		progress: 0,
		isActive: false,
	},
	
	getGuiScreen: function(){
       return guiEA;
    },
	
	init: function(){
		this.liquidStorage.setLimit("essence", 44);
	},
	
	getLiquidFromItem: MachineRegistry.getLiquidFromItem,
	
    tick: function(){
		StorageInterface.checkHoppers(this);
		
		var newActive = false;
		var input = this.container.getSlot("slotInput");
		if(this.liquidStorage.getAmount("essence") >= 0.1 && input.id == VanillaItemID.book){
			if(this.data.energy >= this.data.energy_consumption){
				this.data.energy -= this.data.energy_consumption;
				this.data.progress ++;
				newActive = true;
				this.startPlaySound();
			}
			if(this.data.progress >= this.data.work_time){
				this.liquidStorage.getLiquid("essence", 0.1);
				this.data.progress = 0;
				
				var Enchant = enchantList[Math.floor(Math.random() * enchantList.length)] ;
				
				var EnchantType = Enchant .enchantType;
				
				var RandomLevel = Math.floor(Math.random() * Enchant.maxLv) + 1 ;
				 
				
					var slot = this.container.getSlot("slotOutput1");
					input.count -=1;
					slot.id = VanillaItemID.book;
					slot.count += 1;
                            if(slot.id == 340){
                            	var slot.extra = new ItemExtraData;
				                 slot.extra.addEnchant(EnchantType, RandomLevel);
				
                           }
		}
		else {
			this.data.progress = 0;
		}
		if(!newActive)
			this.stopPlaySound(true);
		this.setActive(newActive);
		
		
		var slot1 = this.container.getSlot("slotLiquid1");
		var slot2 = this.container.getSlot("slotLiquid2");
		this.getLiquidFromItem("essence", slot1, slot2);
		
		var energyStorage = this.getEnergyStorage();
		this.data.energy = Math.min(this.data.energy, energyStorage);
		
		this.container.setScale("progressScale", this.data.progress / this.data.work_time);
		this.liquidStorage.updateUiScale("liquidScale", "essence"); 
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
   
	energyReceive: MachineRegistry.basicEnergyReceiveFunc
	
});

TileRenderer.setRotationPlaceFunction(BlockID.enchantment_aplicator, true);