IDRegistry.genBlockID("mob_crusher");
Block.createBlock("mob_crusher", [
  {
    name: "Mob Crusher",
    texture: [
           [side.top, 0],
           [side.top, 0],
           [side.side, 0],
           [side.side, 0],
           ["mob_relocator", 0],
           [side.side, 0]
        ],
    inCreative: true
    }
]);

var guiMC = new UI.StandartWindow({
  standart: {
    header: { text: { text: Translation.translate("Mob Crusher") } },
    inventory: { standart: true },
    background: { standart: true }
  },

  drawing: [
    { type: "bitmap", x: 700, y: 135, bitmap: "rf_scale", scale: 3.2 },
    { type: "bitmap", x: 449, y: 149, bitmap: "3", scale: 0.75 }
	],

  elements: {
    "textAmount": { type: "text", x: 500, y: 230, width: 300, height: 30, text: "0 mB" },

    "progressScale": { type: "scale", x: 450, y: 150, direction: 0, value: .5, bitmap: "4", scale: 0.75 },
    "scaleLiquid": { type: "scale", x: 505, y: 150, direction: 1, value: 0.5, bitmap: "gui_water_scale", overlay: "gui_liquid_storage_overlay", scale: GUI_SCALE },
    "slotLiquid1": {
      type: "slot",
      x: 550,
      y: 280,
      isValid: function(id, count, data) {
        return LiquidLib.getFullItem(id, data, "essence") ? true : false;
      }
    },

    "slotLiquid2": { type: "slot", x: 550, y: 150, isValid: function() { return false; } },
    "slotOutput0": { type: "slot", x: 700, y: 130, size: 60 },
    "slotOutput1": { type: "slot", x: 700, y: 190, size: 60 },
    "energyScale": { type: "scale", x: 800, y: 135, direction: 1, value: .5, bitmap: "rf_scale_full", scale: GUI_SCALE }
  }
});
var VanillaMobs = [
      EntityType.BAT,
      EntityType.BLAZE,
      EntityType.CAT,
      EntityType.CAVE_SPIDER,
      EntityType.COD,
      EntityType.COW,
      EntityType.CHICKEN,
      EntityType.CREEPER,
      EntityType.DONKEY,
      EntityType.DROWNER,
      EntityType.ENDERMAN,
      EntityType.ENDERMITE,
      EntityType.ENDER_DRAGON,
      EntityType.GHAST,
      EntityType.GUARDIAN,
      EntityType.HORSE,
      EntityType.HUSK,
      EntityType.IRON_GOLEM,
      EntityType.LAVA_SLIME,
      EntityType.LLAMA,
      EntityType.PANDA,
      EntityType.PIG,
      EntityType.PIG_ZOMBIE,
      EntityType.PILLIGER,
      EntityType.RAVAGER,
      EntityType.SHEEP,
      EntityType.SHULKER,
      EntityType.SNOW_GOLEM,
      EntityType.SPIDER,
      EntityType.SQUID,
      EntityType.STRAY,
      EntityType.TURTLE,
      EntityType.WHITCH,
      EntityType.PHANTOM,
      EntityType.SKELETON,
      EntityType.SPIDER,
      EntityType.ZOMBIE,
      EntityType.WITHER
];

MachineRegistry.registerElectricMachine(BlockID.mob_crusher, {
  defaultValues: {
    progress: 0,
    power_tier: 1,
    energy_storage: 51000,
    energy_consumption: 40,
    work_time: 25,
    minX: 0,
    minY: -1,
    minZ: -1,
    maxX: 1,
    maxY: 2,
    maxZ: 1,
    scanZ: 0,
    scanY: 0,
    scanX: 0
  },

  getGuiScreen: function() {
    return guiMC;
  },

  getTier: function() {
    return this.data.power_tier;
  },

  init: function() {
    this.liquidStorage.setLimit("essence", 8);
  },

  getLiquidFromItem: MachineRegistry.getLiquidFromItem,

  tick: function() {
    StorageInterface.checkHoppers(this);

    if (this.data.energy >= this.data.energy_consumption) {
      this.scan();
    }
    var slot1 = this.container.getSlot("slotLiquid1");
    var slot2 = this.container.getSlot("slotLiquid2");
    this.getLiquidFromItem("essence", slot1, slot2);

    var energyStorage = this.getEnergyStorage();
    this.data.energy = Math.min(this.data.energy, energyStorage);
    //     this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), "RF", energyStorage - this.data.energy, this.getTier());

    this.container.setScale("energyScale", this.data.energy / energyStorage);
    this.container.setScale("progressScale", this.data.progress);
    this.liquidStorage.updateUiScale("scaleLiquid", "essence");
    this.container.setText("textAmount", this.liquidStorage.getAmount("essence") * 1000 + " mB");
  },

  scan: function() {
    this.data.scanX++;
    if (this.data.scanX > this.data.maxX) {
      this.data.scanX = this.data.minX;
      this.data.scanZ++;
      if (this.data.scanZ > this.data.maxZ) {
        this.data.scanZ = this.data.maxZ;
        this.data.scanY++;
        if (this.data.scanY > this.data.maxY) {
          this.data.scanY = this.data.maxY;
        }
      }
    }

    for (let c in VanillaMobs) {
      var ent = VanillaMobs[c];
      let ENTITY_ARR = Entity.getAllInRange(this.x + this.data.scanX, this.y + this.data.scanY, this.z + this.data.scanZ, 0);
      for (let i in ENTITY_ARR) {
        if (ENTITY_ARR[i] === ent) {
          this.data.progress += 1 / this.data.work_time;
          if (this.data.progress >= 1) {
            Entity.damageEntity(ENTITY_ARR, 350);
            this.data.energy -= this.data.energy_consumption;
            this.data.progress = 0;
            this.liquidStorage.addLiquid("essence", 0.5);
          } else {
            this.data.progress = 0;
          }
        }
      }
    }

  },
  /*
	
         

        if (ENTITY_ARR[i] === ent) {
            return true
            break;
        }
    }
    return false;
}

	putItem: function(item){
        for(var i = 0; i < 2; i++){
            var slot = this.container.getSlot("slotOutput" + i);
            if(!slot.id || slot.id == item.id && slot.count < Item.getMaxStack(item.id)){
                var add = Math.min(Item.getMaxStack(item.id) - slot.count, item.count);
                slot.id = item.id;
                slot.count += add;
                slot.data = item.data;
                item.count -= add;
            }
        }
    },
	
    isInvFull: function(){
        for(var i = 0; i < 1; i++){
            var slot = this.container.getSlot("slotOutput" + i);
            var maxStack = Item.getMaxStack(slot.id);
            if(!slot.id || slot.count < maxStack) return false;
        }
        return true;
    },
	*/


  getEnergyStorage: function() {
    return this.data.energy_storage;
  },

  energyReceive: MachineRegistry.basicEnergyReceiveFunc
});