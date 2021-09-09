IDRegistry.genBlockID("animal_separator");

Block.createBlock("animal_separator", [

  {
    name: "Anminal Baby Separator",
    texture: [
           [side.top, 0],
           [side.top, 0],
           [animalSelector.back, 0],
           [animalSelector.front, 0],
           [animalSelector.side, 0],
           [animalSelector.side, 0]
        ],
    inCreative: true
    }
]);


var AnimalBaby = [];
var AnimalGrow = [
    EntityType.CAT,
    EntityType.COD,
    EntityType.COW,
    EntityType.CHICKEN,
    EntityType.CREEPER,
    EntityType.DONKEY,
    EntityType.HORSE,
    EntityType.LLAMA,
    EntityType.PANDA,
    EntityType.PIG,
    EntityType.SHEEP,
    EntityType.TURTLE
  ];


var guiABS = new UI.StandartWindow({

  standart: {
    header: { text: { text: "Anminal Baby Separator" } },

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

MachineRegistry.registerElectricMachine(BlockID.mob_crusher, {

  defaultValues: {

    progress: 0,
    power_tier: 1,
    energy_storage: 51000,
    energy_consumption: 40,
    work_time: 25,
    minX: 0,
    minY: 0,
    minZ: -1,
    maxX: 0,
    maxY: 1,
    maxZ: 0,
    scanX: 0,
    scanY: 0,
    scanZ: 0
  },

  getGuiScreen: function() {
    return guiMC;
  },

  getTier: function() {
    return this.data.power_tier;
  },

  tick: function() {
    StorageInterface.checkHoppers(this);

    if (this.data.energy >= this.data.energy_consumption) {
      this.scan();
    }

    var energyStorage = this.getEnergyStorage();
    this.data.energy = Math.min(this.data.energy, energyStorage);
    //     this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), "RF", energyStorage - this.data.energy, this.getTier());

    this.container.setScale("energyScale", this.data.energy / energyStorage);
    this.container.setScale("progressScale", this.data.progress);
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

    for (i in AnimalGrow) {
      var AG = AnimalGrow[i];
      let ANIMAL_ARR = Entity.getAllInRange(this.x + this.data.scanX, this.y + this.data.scanY, this.z + this.data.scanZ, 0);

      for (let i in ANIMAL_ARR) {
        if (ENTITY_ARR[i] === AG) {
          var AnimalAges = Entity.getAge(ENTITY_ARR[i]);
          if (AnimalAges <= 0) {
            this.data.progress += 1 / this.data.work_time;
            if (this.data.progress >= 1) {
              Entity.setPotion(ENTITY_ARR[i], this.x + 1, this.y, this.z + 1);
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