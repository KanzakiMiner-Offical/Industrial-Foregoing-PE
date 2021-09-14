IDRegistry.genBlockID("sewer");

Block.createBlock("sewer", [

  {
    name: "Sewer",
    texture: [
           [side.top, 0],
           [sewer.top, 0],
           [sewer.side, 0],
           [sewer.side, 0],
           [sewer.side, 0],
           [sewer.side, 0]
        ],
    inCreative: true
    }
]);



var SewerAccept = [
    EntityType.CAT,
    EntityType.COW,
    EntityType.CHICKEN,
    EntityType.DONKEY,
    EntityType.HORSE,
    EntityType.LLAMA,
    EntityType.PANDA,
    EntityType.PIG,
    EntityType.SHEEP
  ];


var guiSewer = new UI.StandartWindow({

  standart: {
    header: { text: { text: "Sewer" } },

    background: { color: android.graphics.Color.parseColor("#b3b3b3") },
    inventory: { standart: true }
  },
  drawing: [
    { type: "scale", x: 530, y: 138, direction: 0, bitmap: "progress_background", scale: 3.2 },
    { type: "scale", x: 601, y: 130, direction: 0, bitmap: "rf_scale", scale: 3.2 }
    ],
  elements: {
    "scaleSewage": { type: "scale", x: 420, y: 150, direction: 1, value: 0.5, bitmap: "gui_water_scale", overlay: "gui_liquid_storage_overlay", scale: GUI_SCALE },

    "slot1": {
      type: "slot",
      x: 550,
      y: 280,
      isValid: function(id, count, data) {
        return LiquidLib.getFullItem(id, data, "sewage") ? true : false;
      }
    },

    "slot2": { type: "slot", x: 550, y: 150, isValid: function() { return false; } },
    "energyScale": { type: "scale", x: 600, y: 130, direction: 0, bitmap: "rf_scale_full", scale: 3.2, value: 1 },
    "progressScale": { type: "scale", x: 500, y: 138, direction: 0, bitmap: "progress_background", scale: 3.2, value: 1 }
  }
});

MachineRegistry.registerElectricMachine(BlockID.sewer, {

  defaultValues: {

    progress: 0,
    power_tier: 1,
    energy_storage: 50040,
    energy_consumption: 2,
    work_time: 20,
    minX: 0,
    minY: 0,
    minZ: 0,
    maxX: 0,
    maxY: 1,
    maxZ: 0,
    scanZ: 0,
    scanY: 0,
    scanX: 0
  },

  getGuiScreen: function() {
    return guiSewer;
  },

  getTier: function() {
    return this.data.power_tier;
  },


  init: function() {
    this.liquidStorage.setLimit("sewage", 8);
  },

  addLiquidToItem: MachineRegistry.addLiquidToItem,

  tick: function() {
    StorageInterface.checkHoppers(this);

    if (this.data.energy >= this.data.energy_consumption) {
      this.scan();
    }

    var slot1 = this.container.getSlot("slot1");
    var slot2 = this.container.getSlot("slot2");
    this.addLiquidToItem("sewage", slot1, slot2);

    var energyStorage = this.getEnergyStorage();
    this.data.energy = Math.min(this.data.energy, energyStorage);
    //     this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), "RF", energyStorage - this.data.energy, this.getTier());

    this.container.setScale("energyScale", this.data.energy / energyStorage);
    this.container.setScale("progressScale", this.data.progress);
    this.liquidStorage.updateUiScale("scaleSewage", "sewage");
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

    for (i in SewerAccept) {
      var SA = SewerAccept[i];
      let SEWER_ARR = Entity.getAllInRange(this.x + this.data.scanX, this.y + this.data.scanY, this.z + this.data.scanZ, 1);

      for (let i in SEWER_ARR) {
        if (SEWER_ARR[i] === SA) {
          var SewageAmount = this.liquidStorage.getAmount("sewage");
          if (SewageAmount < 8) {
            this.data.progress += 1 / this.data.work_time;
            if (this.data.progress >= 1) {
              var LiquidSewageAmount = 0.015 * SEWER_ARR.length;
              this.liquidStorage.addLiquid("sewage", LiquidSewageAmount);
              this.data.energy -= this.data.energy_consumption;
              this.data.progress = 0;
            } else {
              this.data.progress = 0;
            }
          }
        }
      }
    }

  },

  getEnergyStorage: function() {
    return this.data.energy_storage;
  },

  energyReceive: MachineRegistry.basicEnergyReceiveFunc

});