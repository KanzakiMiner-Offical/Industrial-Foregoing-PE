const IFCore = {

  bmp: {
    gear: FileTools.ReadImage(__dir__ + "base/gear_base.png"),
  },

  coloredDraw: function(image, color) {
    paint.setColorFilter(new android.graphics.PorterDuffColorFilter(android.graphics.Color.parseColor(color), android.graphics.PorterDuff.Mode.MULTIPLY));
    canvas.drawBitmap(this.bmp[image], 0, 0, paint);
  },

  writeImage: function(path, bitmap) {
    const file = new java.io.File(path);
    file.getParentFile().mkdirs();
    file.createNewFile();
    FileTools.WriteImage(path, bitmap);
  },

  Gear: function(key, name, color) {
    let id = "gear_" + key;
    let path = __dir__ + "assets/items-opaque/gear/" + id + ".png";
    if (!FileTools.isExists(path)) {
      this.coloredDraw("gear", color);
      this.writeImage(path, bitmap);
    }
    IDRegistry.genItemID(id);

    Item.createItem(id, name + " Gear", { name: id, meta: 0 }, { stack: 64 });

  }
};
// oak 662d01 stone: 646464 iron ffcc99 gold ffe400 diamond 33cccc
IFCore.Gear("oak", "Wood", "#662d01");
IFCore.Gear("stone", "Stone", "#646464");
IFCore.Gear("iron", "Iron", "#ffcc99");
IFCore.Gear("gold", "Gold", "#ffe400");
IFCore.Gear("diamond", "Diamond", "#33cccc");

IDRegistry.genItemID("latexBucket");
Item.createItem("latexBucket", "Latex Bucket", { name: "latexBucket", meta: 0 }, { stack: 1 });
IDRegistry.genItemID("essenceBucket");
Item.createItem("essenceBucket", "Essence Bucket", { name: "essenceBucket", meta: 0 }, { stack: 1 });
IDRegistry.genItemID("sewageBucker");
Item.createItem("sewageBucker", "Sewage Bucket", { name: "sewageBucker", meta: 0 }, { stack: 1 });


LiquidRegistry.registerLiquid("sewage", "Sewage", ["sewage_flow", "sewage_still"]);
LiquidLib.registerItem("sewage", VanillaItemID.bucket, ItemID.sewageBucker, 1000);
LiquidRegistry.registerLiquid("latex", "Latex", ["latex_flow", "latex_still"]);
LiquidLib.registerItem("latex", VanillaItemID.bucket, ItemID.latexBucket, 1000);
LiquidRegistry.registerLiquid("essence", "Esssence", ["essence_flow", "essence_still"]);
LiquidLib.registerItem("essence", VanillaItemID.bucket, ItemID.essenceBucket, 1000);


LiquidRegistry.getLiquidData("lava").uiTextures.push("gui_lava_texture_55x47");
LiquidRegistry.getLiquidData("water").uiTextures.push("gui_water_texture_55x47");

Callback.addCallback("PreLoaded", function() {

  Recipes.addShaped({ id: ItemID.gear_oak, count: 1, data: 0 }, [
		" x ",
		"x x",
		" x "
	], ['x', 280, 0]);

  Recipes.addShaped({ id: ItemID.gear_stone, count: 1, data: 0 }, [
		" x ",
		"x#x",
		" x "
	], ['#', ItemID.gear_oak, 0, 'x', 4, 0]);

  Recipes.addShaped({ id: ItemID.gear_iron, count: 1, data: 0 }, [
		" x ",
		"x#x",
		" x "
	], ['#', ItemID.gear_stone, 0, 'x', 265, 0]);

  Recipes.addShaped({ id: ItemID.gear_gold, count: 1, data: 0 }, [
		" x ",
		"x#x",
		" x "
	], ['#', ItemID.gear_iron, 0, 'x', 266, 0]);

  Recipes.addShaped({ id: ItemID.gear_diamond, count: 1, data: 0 }, [
		" x ",
		"x#x",
		" x "
	], ['#', ItemID.gear_gold, 0, 'x', 264, 0]);

  Recipes.addShaped({ id: BlockID.machineFrame, count: 1, data: 0 }, [
		"x#x",
		"#a#",
		"x#x"
], ['#', 4, -1, 'x', 265, 0, "a", 152, 0]);

  Recipes.addShaped({ id: BlockID.latex_process, count: 1, data: 0 }, [
		"x#x",
		"xax",
		"xyx"
], ['#', 331, 0, 'x', 1, 0, "y", ItemID.gear_iron, 0, "a", BlockID.machineFrame, 0]);

  Recipes.addShaped({ id: BlockID.tree_extrac, count: 1, data: 0 }, [
		"x#x",
		"xax",
		"xyx"
], ['#', 331, 0, 'x', 1, 0, "y", ItemID.gear_iron, 0, "a", 61, 0]);

  Recipes.addShaped({ id: BlockID.pf_generator, count: 1, data: 0 }, [
		"axa",
		"e#e",
		"aba"
	], ['b', 61, 0, 'a', ItemID.plastic, 0, 'x', 254, 0, 'e', ItemID.gear_gold, 0, '#', BlockID.machineFrame, 0]);
});

var side = {
  side: "side",
  top: "top"
}

var water = {
  top: "water_condensator",
  side: "water_con_side"
}

var blackholes = {
  side: "black_hole_unit_side",
  top: "black_hole_unit_top",
  sidetank: "black_hole_tank_side"
}

var enchantAp = {
  side: "enchantment_aplicator_side",
  top: "enchantment_aplicator_top",
  front: "enchantment_aplicator_front"
}


var animalSelector = {
  side: "animal_independence_selector_side",
  front: "animal_independence_selector_front",
  back: "animal_independence_selector_back"
}

var sewer = {
  side: "sewer_side",
  top: "sewer_top"
}