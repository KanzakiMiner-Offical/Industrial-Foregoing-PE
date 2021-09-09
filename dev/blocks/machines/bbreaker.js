// block_destroyer_back
IDRegistry.genBlockID("block_destroyer");
Block.createBlock("block_destroyer", [
  {
    name: "Block Breaker",
    texture: [
           ["block_destroyer_top", 0],
           ["block_destroyer_top", 0],
           [side.side, 0],
           [side.side, 0],
           ["block_destroyer_back", 0],
           [side.side, 0]
        ],
    inCreative: true
    }
]);

var guiBD = new UI.StandartWindow({

  standart: {
    header: { text: { text: "Block Breaker" } },

    background: { color: android.graphics.Color.parseColor("#b3b3b3") },
    inventory: { standart: true }
  },
  drawing: [
    { type: "scale", x: 530, y: 138, direction: 0, bitmap: "progress_background", scale: 3.2, value: 1 },
    { type: "scale", x: 700, y: 130, direction: 0, bitmap: "rf_scale", scale: 3.2, value: 1 }
    ],
  elements: {
    "energyScale": { type: "scale", x: 700, y: 130, direction: 0, bitmap: "rf_scale_full", scale: 3.2, value: 1 },
    "progressScale": { type: "scale", x: 530, y: 138, direction: 0, bitmap: "progress_background", scale: 3.2, value: 1 }
  }
});

MachineRegistry.registerElectricMachine(BlockID.block_destroyer, {

  defaultValues: {
    power_tier: 1,
    energy_storage: 50100,
    energy_consumption: 20,
    work_time: 5,
    progress: 0,
    isActive: false,
  },

  getGuiScreen: function() {
    return guiBP;
  },

  tick: function() {
    StorageInterface.checkHoppers(this);

    var newActive = false;
    var CheckBlock = World.getBlockID(this.x, this.y, this.z + 1);
    if (CheckBlock != 0) {
      if (this.data.energy >= this.data.energy_consumption) {
        this.data.energy -= this.data.energy_consumption;
        this.data.progress++;
        newActive = true;
      }
      if (this.data.progress >= this.data.work_time) {
        World.destroyBlock(this.x, this.y, this.z + 1, true);
        this.data.progress = 0;
      }
    }
    else {
      this.data.progress = 0;

    }
    if (!newActive)
      this.setActive(newActive);


    var energyStorage = this.getEnergyStorage();
    this.data.energy = Math.min(this.data.energy, energyStorage);

    this.container.setScale("progressScale", this.data.progress / this.data.work_time);

    this.container.setScale("energyScale", this.data.energy / energyStorage);
  },

  getEnergyStorage: function() {
    return this.data.energy_storage;
  },

  energyReceive: MachineRegistry.basicEnergyReceiveFunc

});