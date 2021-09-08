
PAPI.registerLiquidTexture("latex", ["fluid_latex", 0]);

IDRegistry.genBlockID("pipePink");
Block.createBlock("pipePink", [
	{name: "Pink Slime Pipe", texture: [["pink", 0]], inCreative: true}
]);
IDRegistry.genBlockID("pipeExPink");
Block.createBlock("pipeExPink", [
	{name: "Pink Slime Extrac Pipe", texture: [["pink", 1]], inCreative: true}
]);

PAPI.registerPipe(BlockID.pipePink, 350, 0.5, ["foregoing-pipe"], Config.enableMapping, -1, true, 750, {"lava":true})

PAPI.registerPipe(BlockID.pipeExPink, 500, 0.5, PAPI.groups, Config.enableMapping, -1, true, 1000, {"lava":true})
TileEntity.registerPrototype(BlockID.pipeExPink, PAPI.registerExtractor(BlockID.pipePink, 100))
