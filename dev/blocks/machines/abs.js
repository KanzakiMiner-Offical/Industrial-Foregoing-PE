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
var AnimalGrow = [];


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

