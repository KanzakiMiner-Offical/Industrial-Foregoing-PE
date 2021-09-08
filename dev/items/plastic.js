IDRegistry.genItemID("tiny_dry_rubber");
IDRegistry.genItemID("dry_rubber");
IDRegistry.genItemID("plastic");

Item.createItem("tiny_dry_rubber", "Tiny Dry Rubber", {name: "tiny_rubber", meta: 0}, {stack: 64});
Item.createItem("dry_rubber", "Dry Rubber", {name: "rubber", meta: 0}, {stack: 64});
Item.createItem("plastic", "Plastic", {name: "plastic", meta: 0}, {stack: 64});

Callback.addCallback("PreLoaded", function(){
	Recipes.addShaped({id: ItemID.dry_rubber, count: 1, data: 0}, [
		"ccc",
		"ccc",
		"ccc"
	], ['c', ItemID.tiny_dry_rubber, 0]);
	
	Recipes.addFurnace(ItemID.dry_rubber, ItemID.plastic, 0);
});