// block_placer_side
IDRegistry.genBlockID("block_placer");
Block.createBlock("block_placer", [
  {
    name: "Block Placer",
    texture: [
           ["block_placer_top", 0],
           ["block_placer_top", 0],
           [side.side, 0],
           [side.side, 0],
           ["block_placer_side", 0],
           [side.side, 0]
        ],
    inCreative: true
    }
]);

var guiBP = new UI.StandartWindow({

  standart: {
    header: { text: { text: "Block Placer" } },

    background: { color: android.graphics.Color.parseColor("#b3b3b3") },
    inventory: { standart: true }
  },
  drawing: [
    { type: "scale", x: 530, y: 138, direction: 0, bitmap: "progress_background", scale: 3.2 },
    { type: "scale", x: 700, y: 130, direction: 0, bitmap: "rf_scale", scale: 3.2 }
    ],
  elements: {

    "inputSlot": {
      type: "slot",
      x: 400,
      y: 162
    },
    "energyScale": { type: "scale", x: 700, y: 130, direction: 0, bitmap: "rf_scale_full", scale: 3.2, value: 1 },
    "progressScale": { type: "scale", x: 530, y: 138, direction: 0, bitmap: "progress_background", scale: 3.2, value: 1 }
  }
});

var BanList = [
  0,
  260,
  262,
  393,
  363,
  369,
  377,
  352,
  340,
  261,
  281,
  297,
  336
  ];

MachineRegistry.registerElectricMachine(BlockID.block_placer, {

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
    var input = this.container.getSlot("inputSlot");
    for (i in BanList) {
      var ban = BanList[i];
      if (input.id != ban) {
        if (this.data.energy >= this.data.energy_consumption) {
          this.data.energy -= this.data.energy_consumption;
          this.data.progress++;
          newActive = true;
        }
        if (this.data.progress >= this.data.work_time) {
          World.setBlock(this.x, this.y, this.z + 1, input.id, input.data);
          this.data.progress = 0;
        }
      }
      else {
        this.data.progress = 0;
      }
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