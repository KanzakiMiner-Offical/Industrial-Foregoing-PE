IDRegistry.genBlockID("lava_fabricator");
Block.createBlock("lava_fabricator", [
  {
    name: "Lava Fabricator",
    texture: [
           ["lava_fab", 1],
           [side.top, 0],
           [side.side, 0],
           ["lava_fab", 0],
           [side.side, 0],
           [side.side, 0]
        ],
    inCreative: true
    }
]);

TileRenderer.setStandartModel(BlockID.lava_fabricator, [["lava_fab", 1], [side.top, 0], [side.side, 0], ["lava_fab", 0], [side.side, 0], [side.side, 0]]);
TileRenderer.registerRotationModel(BlockID.lava_fabricator, 0, [["lava_fab", 1], [side.top, 0], [side.side, 0], ["lava_fab", 0], [side.side, 0], [side.side, 0]]);
TileRenderer.registerRotationModel(BlockID.lava_fabricator, 4, [["lava_fab", 1], [side.top, 0], [side.side, 0], ["lava_fab", 0], [side.side, 0], [side.side, 0]]);

var guiLF = new UI.StandartWindow({
  standart: {
    header: { text: { text: Translation.translate("Lava Fabricator") } },
    inventory: { standart: true },
    background: { standart: true }
  },

  drawing: [
    { type: "bitmap", x: 390, y: 80, bitmap: "arrow_bg", scale: GUI_SCALE }
	],

  elements: {
    "progressScale": { type: "scale", x: 492, y: 150, direction: 0, value: .5, bitmap: "arrow_full", scale: GUI_SCALE },
    "lavaScale": { type: "scale", x: 483, y: 179, direction: 1, value: .5, bitmap: "gui_water_scale", scale: GUI_SCALE },
    "slotLava0": {
      type: "slot",
      x: 400,
      y: 162,
      isValid: function(id, count, data) {
        return LiquidLib.getItemLiquid(id, data) == "lava";
      }
    },
    "slotLava1": { type: "slot", x: 400, y: 222, isValid: function() { return false; } },
    "energyScale": { type: "scale", x: 800, y: 135, direction: 1, value: .5, bitmap: "rf_scale_full", scale: GUI_SCALE }
    //"button": {type: "button", x: 572, y: 210, bitmap: "button_up", scale: GUI_SCALE, clicker: {
    //onClick: function(container, tile){
    //tile.data.run = true
    //}
    //}}
  }
});


MachineRegistry.registerElectricMachine(BlockID.lava_fabricator, {
  defaultValues: {
    power_tier: 1,
    energy_storage: 20000,
    energy_consumption: 5000,
    work_time: 100,
    progress: 0,
    isActive: false,
    //run: false,
  },

  getGuiScreen: function() {
    return guiLF;
  },

  init: function() {
    this.liquidStorage.setLimit("lava", 8);

  },

  addLiquidToItem: MachineRegistry.addLiquidToItem,

  tick: function() {
    StorageInterface.checkHoppers(this);

    var newActive = false;

    //    if(this.data.run = true){
    if (this.data.energy >= this.data.energy_consumption && this.data.progress == 0) {
      this.data.progress++;
      if (this.data.progress >= this.data.work_time) {
        this.data.progress = 0;
        this.data.energy -= this.data.energy_consumption;
        this.liquidStorage.addLiquid("lava", 1);
      }

      newActive = true;
      this.startPlaySound();
      //}
    }
    if (!newActive)
      this.stopPlaySound(true);
    this.setActive(newActive);


    var slot1 = this.container.getSlot("slotLava0");
    var slot2 = this.container.getSlot("slotLava1");
    this.addLiquidToItem("lava", slot1, slot2);


    this.container.setScale("progressScale", this.data.progress / this.data.work_time);
    this.liquidStorage.updateUiScale("lavaScale", "lava");
  },


  getEnergyStorage: function() {
    return this.data.energy_storage;
  },

  getStartSoundFile: function() {
    return "Machines/Lava.ogg";
  },
  getInterruptSoundFile: function() {
    return "Machines/TurnOff.ogg";
  },

  energyReceive: MachineRegistry.basicEnergyReceiveFunc
});

TileRenderer.setRotationPlaceFunction(BlockID.lava_fabricator, true);

StorageInterface.createInterface(BlockID.lava_fabricator, {
  slots: {
    "slotLava0": { input: true },
    "slotLava1": { output: true }
  },
  canReceiveLiquid: function(liquid, side) {
    return liquid == "lava";
  },
  canTransportLiquid: function(liquid, side) {
    return true;
  }
});