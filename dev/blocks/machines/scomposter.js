IDRegistry.genBlockID("sewage_composter");
Block.createBlock("sewage_composter", [
  {
    name: "Sewage Composter",
    texture: [
           [side.top, 0],
           [side.top, 0],
           ["sewage_composter_side", 0],
           ["sewage_composter_side", 0],
           ["sewage_composter_side", 0],
           ["sewage_composter_side", 0]
        ],
    inCreative: true
    }
]);




var guiSC = new UI.StandartWindow({

  standart: {

    header: { text: { text: "Sewage Composter" } },
    inventory: { standart: true },
    background: { standart: true }
  },

  drawing: [
    { type: "bitmap", x: 550, y: 158, bitmap: "arrow_bg", scale: 3.2 },
    { type: "bitmap", x: 660, y: 135, bitmap: "rf_scale", scale: 3.2 }
	],

  elements: {
    "slotResult": { type: "slot", x: 600, y: 150, size: 60 },
    "progressScale": { type: "scale", x: 550, y: 158, direction: 0, value: .5, bitmap: "arrow_full", scale: 3.2 },

    "scaleSewage": { type: "scale", x: 410, y: 90, direction: 1, value: .5, bitmap: "gui_water_scale", scale: 3.2 },

    "slotSewage0": {
      type: "slot",
      x: 350,
      y: 250,
      isValid: function(id, count, data) {
        return LiquidLib.getItemLiquid(id, data) == "sewage";
      }
    },
    "slotSewage1": { type: "slot", x: 350, y: 185, isValid: function() { return false; } },

    "energyScale": { type: "scale", x: 660, y: 135, direction: 1, value: .5, bitmap: "rf_scale_full", scale: 3.2 }
  }
});



MachineRegistry.registerElectricMachine(BlockID.sewage_composter, {

  defaultValues: {
    power_tier: 1,
    energy_storage: 51000,
    energy_consumption: 10,
    work_time: 100,
    progress: 0,
    isActive: false,
  },

  getGuiScreen: function() {
    return guiSC;
  },

  init: function() {
    this.liquidStorage.setLimit("sewage", 8);
  },

  getLiquidFromItem: MachineRegistry.getLiquidFromItem,

  tick: function() {
    StorageInterface.checkHoppers(this);

    var newActive = false;
    var output = this.container.getSlot("slotResult");
    if (this.liquidStorage.getAmount("sewage") >= 2) {
      if (this.data.energy >= this.data.energy_consumption) {
        this.data.energy -= this.data.energy_consumption;
        this.data.progress++;
        newActive = true;
        this.startPlaySound();
      }
      if (this.data.progress >= this.data.work_time) {
        this.liquidStorage.getLiquid("sewage", 2);
        this.data.progress = 0;
        output.id = ItemID.fertilizer;
        output.count += 1;
      }
    }
    else {
      this.data.progress = 0;
    }
    if (!newActive)
      this.stopPlaySound(true);
    this.setActive(newActive);


    var slot1 = this.container.getSlot("slotSewage0");
    var slot2 = this.container.getSlot("slotSewage1");
    this.getLiquidFromItem("sewage", slot1, slot2);

    var energyStorage = this.getEnergyStorage();
    this.data.energy = Math.min(this.data.energy, energyStorage);

    this.container.setScale("progressScale", this.data.progress / this.data.work_time);
    this.liquidStorage.updateUiScale("scaleSewage", "sewage");
    //this.container.setScale("scaleLatex", this.liquidStorage.getAmount("latex") / this.liquidStorage.getLimit("latex"));
    this.container.setScale("energyScale", this.data.energy / energyStorage);
  },

  getEnergyStorage: function() {
    return this.data.energy_storage;
  },

  getStartSoundFile: function() {
    return "Machines/TurnOn.ogg";
  },
  getInterruptSoundFile: function() {
    return "Machines/TurnOff.ogg";
  },

  energyReceive: MachineRegistry.basicEnergyReceiveFunc

});