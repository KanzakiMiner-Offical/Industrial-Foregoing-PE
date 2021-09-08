/*
BUILD INFO:
  dir: dev
  target: main.js
  files: 13
*/



// file: header.js

// import values
var Color = android.graphics.Color;
var PotionEffect = Native.PotionEffect;
var ParticleType = Native.ParticleType;
var BlockSide = Native.BlockSide;
var EntityType = Native.EntityType;

const bitmap = new android.graphics.Bitmap.createBitmap(16, 16, android.graphics.Bitmap.Config.ARGB_8888);
const canvas = new android.graphics.Canvas(bitmap);
const paint = new android.graphics.Paint();

// load lib

 IMPORT ("StorageInterface");
 IMPORT ("ToolType");
 IMPORT ("EnergyNet");
 IMPORT ("ChargeItem");
 IMPORT ("MachineRender");
 IMPORT ("TileRender");
 IMPORT ("LiquidLib");
 IMPORT ("ToolLib");
 IMPORT ("GuideAPI", "*");
 IMPORT("PipesAPI", "*")




// file: api/core.js

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

	Gear: function(key, name, color){
		let id  = "gear_" + key;
		let path = __dir__ + "assets/items-opaque/gear/" + id + ".png";
		if (!FileTools.isExists(path)) {
			this.coloredDraw("gear", color);
			this.writeImage(path, bitmap);	
		}
		IDRegistry.genItemID(id);

        Item.createItem(id, name + " Gear", {name: id, meta: 0}, {stack: 64});

	}
};
// oak 662d01 stone: 646464 iron ffcc99 gold ffe400 diamond 33cccc
IFCore.Gear("oak" ,"Wood" ,"#662d01");
IFCore.Gear("stone" ,"Stone" ,"#646464");
IFCore.Gear("iron" ,"Iron" ,"#ffcc99");
IFCore.Gear("gold" ,"Gold" ,"#ffe400");
IFCore.Gear("diamond" ,"Diamond" ,"#33cccc");

IDRegistry.genItemID("latexBucket");
Item.createItem("latexBucket", "Latex Bucket", {name: "latexBucket", meta: 0}, {stack: 1});
IDRegistry.genItemID("essenceBucket");
Item.createItem("essenceBucket", "essence Bucket", {name: "essenceBucket", meta: 0}, {stack: 1});


	  LiquidRegistry.registerLiquid("latex", "Latex", ["latex_flow", "latex_still"]);
      LiquidLib.registerItem("latex", VanillaItemID.bucket, ItemID.latexBucket, 1000);
      LiquidRegistry.registerLiquid("essence", "Esssence", ["essence_flow", "essence_still"]);
      LiquidLib.registerItem("essence", VanillaItemID.bucket, ItemID.essenceBucket, 1000);
      
  
LiquidRegistry.getLiquidData("lava").uiTextures.push("gui_lava_texture_55x47");
LiquidRegistry.getLiquidData("water").uiTextures.push("gui_water_texture_55x47");

Callback.addCallback("PreLoaded", function(){
	
Recipes.addShaped({id: ItemID.gear_oak, count: 1, data: 0}, [
		" x ",
		"x x",
		" x "
	], ['x', 280, 0]);
	
Recipes.addShaped({id: ItemID.gear_stone, count: 1, data: 0}, [
		" x ",
		"x#x",
		" x "
	], ['#', ItemID.gear_oak, 0, 'x', 4, 0]);
	
Recipes.addShaped({id: ItemID.gear_iron, count: 1, data: 0}, [
		" x ",
		"x#x",
		" x "
	], ['#', ItemID.gear_stone, 0, 'x', 265, 0]);

Recipes.addShaped({id: ItemID.gear_gold, count: 1, data: 0}, [
		" x ",
		"x#x",
		" x "
	], ['#', ItemID.gear_iron, 0, 'x', 266, 0]);

Recipes.addShaped({id: ItemID.gear_diamond, count: 1, data: 0}, [
		" x ",
		"x#x",
		" x "
	], ['#', ItemID.gear_gold, 0, 'x', 264, 0]);
	
Recipes.addShaped({id: BlockID.machineFrame, count: 1, data: 0}, [
		"x#x",
		"#a#",
		"x#x"
], ['#', 4, -1, 'x', 265, 0, "a", 152, 0]);

Recipes.addShaped({id: BlockID.latex_process, count: 1, data: 0}, [
		"x#x",
		"xax",
		"xyx"
], ['#', 331, 0, 'x', 1, 0, "y", ItemID.gear_iron, 0, "a", BlockID.machineFrame, 0]);

Recipes.addShaped({id: BlockID.tree_extrac, count: 1, data: 0}, [
		"x#x",
		"xax",
		"xyx"
], ['#', 331, 0, 'x', 1, 0, "y", ItemID.gear_iron, 0, "a", 61, 0]);

Recipes.addShaped({id: BlockID.pf_generator, count: 1, data: 0}, [
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

var enchantAp= {
	side: "enchantment_aplicator_side",
	top: "enchantment_aplicator_top",
	front: "enchantment_aplicator_front"
}




// file: api/machine.js


// constants
var GUI_SCALE = 3.2;
var GUI_ENER = 0.6;
// API Machine
var RF = EnergyTypeRegistry.assureEnergyType("Rf", 0.25);
var EU = EnergyTypeRegistry.assureEnergyType("Eu", 1);

let SoundAPI = {
	soundPlayers: [],
	soundsToRelease: [],
	maxPlayersCount: 28,
	
	getFilePath: function(name){
		return __dir__ + "res/sounds/" + name;
	},
	
	isSoundEnabled: function(){
		return Config.soundEnabled && isLevelDisplayed;
	},
	
	addSoundPlayer: function(name, loop, priorized){
		if(this.soundPlayers.length >= this.maxPlayersCount){
			Logger.Log(__name__ + " sound stack is full", "WARNING");
			return null;
		}
		let sound = new Sound(name, priorized);
		sound.setDataSource(this.getFilePath(name));
		sound.setLooping(loop || false);
		sound.prepare();
		this.soundPlayers.push(sound);
		return sound;
	},
	
	addMultiSoundPlayer: function(startingSound, startSound, finishingSound){
		if(this.soundPlayers.length >= this.maxPlayersCount){
			Logger.Log(__name__ + " sound stack is full", "WARNING");
			return;
		}
		let sound = new MultiSound(startingSound, startSound, finishingSound);
		this.soundPlayers.push(sound);
		return sound;
	},
	
	playSound: function(name, loop, disableMultiPlaying){
		if(!this.isSoundEnabled()) {return null;}
		let curSound = null;
		try{
		for(let i in this.soundPlayers){
			let sound = this.soundPlayers[i];
			if(sound.isPlaying()){
				if(sound.name == name && disableMultiPlaying){
					return sound;
				}
			}
			else if(sound.name == name) {
				sound.start();
				return sound;
			}
			else if(!sound.isPreparing && !sound.priorized){
				curSound = new Sound(name, false);
				curSound.setDataSource(this.getFilePath(name));
				curSound.setLooping(loop || false);
				curSound.prepare();
				sound = this.soundPlayers[i];
				if(!sound.isPreparing && !sound.isPlaying()){ // second check after preparing because of multi-threading
					this.soundPlayers[i] = curSound;
					this.soundsToRelease.push(sound);
				} else {
					this.soundPlayers.push(curSound);
				}
				break;
			}
		}
		if(!curSound){
			curSound = this.addSoundPlayer(name, loop, false);
		}
		curSound.start();
		//Game.message("sound "+ name +" started");
		}
		catch(err) {
			Logger.Log("sound "+ name +" start failed", "ERROR");
			Logger.Log(err, "ERROR");
		}
		return curSound;
	},
	
	playSoundAt: function(coord, name, loop, radius){
		if(loop && Entity.getDistanceBetweenCoords(coord, Player.getPosition()) > radius){
			return null;
		}
		let sound = this.playSound(name, loop);
		if(sound){
			sound.setSource(coord, radius);
		}
		return sound;
	},
	
	updateVolume: function(){
		for(let i in this.soundPlayers){
			let sound = this.soundPlayers[i];
			sound.setVolume(sound.volume);
		}
	},
	
	createSource: function(fileName, coord, radius){
		if(!this.isSoundEnabled()) {return null;}
		let curSound = null;
		try{
		for(let i in this.soundPlayers){
			let sound = this.soundPlayers[i];
			if(!sound.isPlaying() && !sound.isPreparing && !sound.priorized){
				curSound = new MultiSound(fileName[0], fileName[1], fileName[2]);
				sound = this.soundPlayers[i];
				if(!sound.isPreparing && !sound.isPlaying()){ // second check after preparing because of multi-threading
					this.soundPlayers[i] = curSound;
					this.soundsToRelease.push(sound);
				} else {
					this.soundPlayers.push(curSound);
				}
				break;
			}
		}
		if(!curSound){
			curSound = this.addMultiSoundPlayer(fileName[0], fileName[1], fileName[2]);
		}
		curSound.setSource(coord, radius);
		curSound.start();
		}
		catch(err) {
			Logger.Log("multi-sound ["+ fileName +"] start failed", "ERROR");
			Logger.Log(err, "ERROR");
		}
		return curSound;
	},
	
	updateSourceVolume: function(sound){
		let s = sound.source;
		let p = Player.getPosition();
		let volume = Math.max(0, 1 - Math.sqrt(Math.pow(p.x - s.x, 2) + Math.pow(p.y - s.y, 2) + Math.pow(p.z - s.z, 2))/s.radius);
		sound.setVolume(volume);
	},
	
	clearSounds: function(){
		for(let i = 0; i < this.soundPlayers.length; i++){
			let sound = this.soundPlayers[i];
			if(sound.isPlaying()){
				sound.stop();
			}
			if(!sound.priorized){
				sound.release();
				this.soundPlayers.splice(i--, 1);
			}
		}
	}
}

function Sound(name, priorized){
	this.name = name;
	this.media = new android.media.MediaPlayer();
	this.priorized = priorized || false;
	this.isPreparing = true;
	
	this.setDataSource = function(path){
		this.media.setDataSource(path);
	}
	
	this.setLooping = function(loop){
		this.media.setLooping(loop);
	}
	
	this.prepare = function(){
		this.media.prepare();
	}
	
	this.isPlaying = function(){
		return this.media.isPlaying();
	}
	
	this.isLooping = function(){
		return this.media.isLooping();
	}
	
	this.start = function(){
		this.media.start();
		this.isPreparing = false;
	}
	
	this.pause = function(){
		this.media.pause();
	}
	
	this.seekTo = function(ms){
		this.media.seekTo(ms);
	}
	
	this.stop = function(){
		this.media.pause();
		this.media.seekTo(0);
	}
	
	this.release = function(){
		this.media.release();
	}
	
	this.setVolume = function(volume){
		this.volume = volume;
		volume *= gameVolume;
		this.media.setVolume(volume, volume);
	}
	
	this.setVolume(1);
	
	this.setSource = function(coord, radius){
		this.source = {x: coord.x + 0.5, y: coord.y + 0.5, z: coord.z + 0.5, radius: radius, dimension: Player.getDimension()};
		SoundAPI.updateSourceVolume(this);
	}
}

function MultiSound(startingSound, startSound, finishingSound){
	this.parent = Sound;
	this.parent(startingSound || startSound, 0, true);
	
	this.startingSound = null;
	this.startSound = null;
	this.finishingSound = null;
	
	this.setDataSource(SoundAPI.getFilePath(startingSound || startSound));
	if(startingSound){
		this.startingSound = this.media;
		this.startSound = new android.media.MediaPlayer();
		this.startSound.setDataSource(SoundAPI.getFilePath(startSound));
		this.startSound.setLooping(true);
		let self = this;
		this.media.setOnCompletionListener(new android.media.MediaPlayer.OnCompletionListener({
			onCompletion: function(mp){
				self.playStartSound();
			}
		}));
		this.startSound.prepareAsync();
	} else {
		this.startSound = this.media;
		this.setLooping(true);
	}
	this.prepare();
	
	if(finishingSound){
		let media = new android.media.MediaPlayer();
		media.setDataSource(SoundAPI.getFilePath(finishingSound));
		media.prepareAsync();
		this.finishingSound = media;
	}
	
	this.playStartSound = function(){
		this.media = this.startSound;
		this.media.start();
	}
	
	this.playFinishingSound = function(){
		if(!this.isFinishing){
			this.media = this.finishingSound;
			this.media.start();
			this.isFinishing = true;
		}
	}
	
	this.release = function(){
		this.startSound.release();
		if(this.startingSound){
			this.startingSound.release();
		}
		if(this.finishingSound){
			this.finishingSound.release();
		}
	}
}

Callback.addCallback("tick", function(){
	for(let i in SoundAPI.soundsToRelease){
		SoundAPI.soundsToRelease[i].release();
	}
	SoundAPI.soundsToRelease = [];
	for(let i in SoundAPI.soundPlayers){
		let sound = SoundAPI.soundPlayers[i];
		if(sound.isPlaying() && sound.source){
			if(sound.source.dimension == Player.getDimension()){
				SoundAPI.updateSourceVolume(sound);
			} else {
				sound.stop();
			}
		}
	}
});

Callback.addCallback("LevelLeft", function(){
	SoundAPI.clearSounds();
});

Callback.addCallback("MinecraftActivityStopped", function() {
	SoundAPI.clearSounds();
});

/*Volume in the settings*/
/*From SoundAPI lib by WolfTeam*/
var settings_path = "/storage/emulated/0/games/com.mojang/minecraftpe/options.txt";
var gameVolume = FileTools.ReadKeyValueFile(settings_path)["audio_sound"];
var prevScreen = false;
Callback.addCallback("NativeGuiChanged", function (screen) {
    var currentScreen = screen.startsWith("screen_world_controls_and_settings") || screen.startsWith("screen_controls_and_settings");
    if(prevScreen && !currentScreen){
        gameVolume = FileTools.ReadKeyValueFile(settings_path)["audio_sound"];
		SoundAPI.updateVolume();
    }
    prevScreen = currentScreen;
});

var MachineRegistry = {
	machineIDs: {},

	isMachine: function(id){
		return this.machineIDs[id];
	},
	
	// Machine Base
	registerPrototype: function(id, Prototype){
		// register ID
		this.machineIDs[id] = true;
		
		// audio
		if(Prototype.getStartSoundFile){
			if(!Prototype.getStartingSoundFile){
				Prototype.getStartingSoundFile = function(){return null;}
			}
			if(!Prototype.getInterruptSoundFile){
				Prototype.getInterruptSoundFile = function(){return null;}
			}
			Prototype.startPlaySound = Prototype.startPlaySound || function(){
				if(!Config.machineSoundEnabled){return;}
				let audio = this.audioSource;
				if(audio && audio.isFinishing){
					audio.stop();
					audio.media = audio.startingSound || audio.startSound;
					audio.start();
					audio.isFinishing = false;
				}
				else if(!this.remove && (!audio || !audio.isPlaying()) && this.dimension == Player.getDimension()){
					this.audioSource = SoundAPI.createSource([this.getStartingSoundFile(), this.getStartSoundFile(), this.getInterruptSoundFile()], this, 16);
				}
			}
			Prototype.stopPlaySound = Prototype.stopPlaySound || function(playInterruptSound){
				let audio = this.audioSource;
				if(audio){
					if(!audio.isPlaying()){
						this.audioSource = null;
					}
					else if(!audio.isFinishing){
						audio.stop();
						if(playInterruptSound){
							audio.playFinishingSound();
						}
					}
				}
			}
		} 
		else {
			Prototype.startPlaySound = Prototype.startPlaySound || function(name){
				if(!Config.machineSoundEnabled){return;}
				let audio = this.audioSource;
				if(!this.remove && (!audio || !audio.isPlaying()) && this.dimension == Player.getDimension()){
					let sound = SoundAPI.playSoundAt(this, name, true, 16);
					this.audioSource = sound;
				}
			}
			Prototype.stopPlaySound = Prototype.stopPlaySound || function(){
				if(this.audioSource && this.audioSource.isPlaying()){
					this.audioSource.stop();
					this.audioSource = null;
				}
			}
		}
		
		
		// machine activation
		if(Prototype.defaultValues && Prototype.defaultValues.isActive !== undefined){
			if(!Prototype.renderModel){
				Prototype.renderModel = this.renderModelWithRotation;
			}
			
			Prototype.setActive = Prototype.setActive || this.setActive;
			
			Prototype.activate = Prototype.activate || function(){
				this.setActive(true);
			}
			Prototype.deactivate = Prototype.deactivate || function(){
				this.setActive(false);
			}
			Prototype.destroy = Prototype.destroy || function(){
				BlockRenderer.unmapAtCoords(this.x, this.y, this.z);
				this.stopPlaySound();
			}
		}
		
		if(!Prototype.init && Prototype.renderModel){
			Prototype.init = Prototype.renderModel;
		}
		
		ToolAPI.registerBlockMaterial(id, "stone", 1, true);
		Block.setDestroyTime(id, 3);
		TileEntity.registerPrototype(id, Prototype);
	},
	
	// RF machines
	registerElectricMachine: function(id, Prototype){
		// wire connection
		ICRender.getGroup("rf-wire").add(id, -1);
		ICRender.getGroup("ic-wire").add(id, -1);
		
		// setup energy values
		if (Prototype.defaultValues){
			Prototype.defaultValues.energy = 0;
			Prototype.defaultValues.energy_receive = 0;
			Prototype.defaultValues.last_energy_receive = 0;
			Prototype.defaultValues.voltage = 0;
			Prototype.defaultValues.last_voltage = 0;
		}
		else{
			Prototype.defaultValues = {
				energy: 0,
				energy_receive: 0,
				last_energy_receive: 0,
				voltage: 0,
				last_voltage: 0
			};
		}
		
		Prototype.getTier = Prototype.getTier || function(){
			return 1;
		}
		
		if(!Prototype.getEnergyStorage){
			Prototype.getEnergyStorage = function(){
				return 0;
			};
		}
		
		if(!Prototype.energyTick){
			Prototype.energyTick = function(){
				this.data.last_energy_receive = this.data.energy_receive;
				this.data.energy_receive = 0;
				this.data.last_voltage = this.data.voltage;
				this.data.voltage = 0;
			};
		}
		
		if (!Prototype.getMaxPacketSize) {
			Prototype.getMaxPacketSize = function(tier){
				return 8 << this.getTier()*2;
			}
		}
		
		Prototype.energyReceive = Prototype.energyReceive || this.basicEnergyReceiveFunc;
		
		this.registerPrototype(id, Prototype);
		// register for energy net
		EnergyTileRegistry.addEnergyTypeForId(id, RF);
		EnergyTileRegistry.addEnergyTypeForId(id, EU);
	},
	
	registerGenerator(id, Prototype){
		Prototype.canReceiveEnergy = function(){
			return false;
		},
	
		Prototype.isEnergySource = function(){
			return true;
		},
		
		Prototype.energyTick = Prototype.energyTick || this.basicEnergyOutFunc;
		
		this.registerElectricMachine(id, Prototype);
	},
	
	registerRFStorage(id, Prototype){
		Prototype.isEnergySource = function(){
			return true;
		},
		
		Prototype.energyReceive = Prototype.energyReceive || this.basicEnergyReceiveFunc;
		
		Prototype.energyTick = Prototype.energyTick || this.basicEnergyOutFunc;
		
		Prototype.isTeleporterCompatible = true;
		
		this.registerElectricMachine(id, Prototype);
	},
	
	// standard functions
	setStoragePlaceFunction: function(id, fullRotation){
		Block.registerPlaceFunction(BlockID[id], function(coords, item, block){
			var place = World.canTileBeReplaced(block.id, block.data) ? coords : coords.relative;
			World.setBlock(place.x, place.y, place.z, item.id, 0);
			World.playSound(place.x, place.y, place.z, "dig.stone", 1, 0.8)
			var rotation = TileRenderer.getBlockRotation(fullRotation);
			var tile = World.addTileEntity(place.x, place.y, place.z);
			tile.data.meta = rotation;
			TileRenderer.mapAtCoords(place.x, place.y, place.z, item.id, rotation);
			if(item.extra){
				tile.data.energy = item.extra.getInt("energy");
			}
		});
	},
	
	setFacing: function(coords){
		if(Entity.getSneaking(player)){
			var facing = coords.side ^ 1;
		} else {
			var facing = coords.side;
		}
		if(facing != this.data.meta){
			this.data.meta = facing;
			this.renderModel();
			return true;
		}
		return false;
	},
	
	renderModel: function(){
		if(this.data.isActive){
			TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, 0);
		} else {
			BlockRenderer.unmapAtCoords(this.x, this.y, this.z);
		}
	},
	
	renderModelWithRotation: function(){
		TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, this.data.meta + (this.data.isActive? 4 : 0));
	},
	
	renderModelWith6Sides: function(){
		TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, this.data.meta + (this.data.isActive? 6 : 0));
	},
	
	setActive: function(isActive){
		if(this.data.isActive != isActive){
			this.data.isActive = isActive;
			this.renderModel();
		}
	},
	
	basicEnergyOutFunc: function(type, src){
		this.data.last_energy_receive = this.data.energy_receive;
		this.data.energy_receive = 0;
		this.data.last_voltage = this.data.voltage;
		this.data.voltage = 0;
		var output = this.getMaxPacketSize();
		if(this.data.energy >= output){
			this.data.energy += src.add(output) - output;
		}
	},
	
	basicEnergyReceiveFunc: function(type, amount, voltage) {
		var maxVoltage = this.getMaxPacketSize();
		if(voltage > maxVoltage){
			var add = Math.min(maxVoltage, this.getEnergyStorage() - this.data.energy);
		} else {
			var add = Math.min(amount, this.getEnergyStorage() - this.data.energy);
		}
		this.data.energy += add;
		this.data.energy_receive += add;
		this.data.voltage = Math.max(this.data.voltage, voltage);
		return add;
	},
	
	getLiquidFromItem: function(liquid, inputItem, outputItem, hand){
		if(hand) outputItem = {id: 0, count: 0, data: 0};
		var empty = LiquidLib.getEmptyItem(inputItem.id, inputItem.data);
		if(empty && (!liquid && this.interface.canReceiveLiquid(empty.liquid) || empty.liquid == liquid) && !this.liquidStorage.isFull(empty.liquid)){
			if(outputItem.id == empty.id && outputItem.data == empty.data && outputItem.count < Item.getMaxStack(empty.id) || outputItem.id == 0){
				var liquidLimit = this.liquidStorage.getLimit(empty.liquid);
				var storedAmount = this.liquidStorage.getAmount(liquid).toFixed(3);
				var count = Math.min(hand? inputItem.count : 1, parseInt((liquidLimit - storedAmount) / empty.amount));
				if(count > 0){
					this.liquidStorage.addLiquid(empty.liquid, empty.amount * count);
					inputItem.count -= count;
					outputItem.id = empty.id;
					outputItem.data = empty.data;
					outputItem.count += count;
					if(!hand) this.container.validateAll();
				}
				else if(inputItem.count == 1 && empty.storage){
					var amount = Math.min(liquidLimit - storedAmount, empty.amount);
					this.liquidStorage.addLiquid(empty.liquid, amount);
					inputItem.data += amount * 1000;
				}
				if(hand){
					if(outputItem.id){
						Player.addItemToInventory(outputItem.id, outputItem.count, outputItem.data);
					}
					if(inputItem.count == 0) inputItem.id = inputItem.data = 0;
					Player.setCarriedItem(inputItem.id, inputItem.count, inputItem.data);
					return true;
				}
			}
		}
	},
	
	addLiquidToItem: function(liquid, inputItem, outputItem){
		var amount = this.liquidStorage.getAmount(liquid).toFixed(3);
		if(amount > 0){
			var full = LiquidLib.getFullItem(inputItem.id, inputItem.data, liquid);
			if(full && (outputItem.id == full.id && outputItem.data == full.data && outputItem.count < Item.getMaxStack(full.id) || outputItem.id == 0)){
				if(amount >= full.amount){
					this.liquidStorage.getLiquid(liquid, full.amount);
					inputItem.count--;
					outputItem.id = full.id;
					outputItem.data = full.data;
					outputItem.count++;
					this.container.validateAll();
				}
				else if(inputItem.count == 1 && full.storage){
					if(inputItem.id == full.id){
						amount = this.liquidStorage.getLiquid(liquid, full.amount);
						inputItem.data -= amount * 1000;
					} else {
						amount = this.liquidStorage.getLiquid(liquid, full.storage);
						inputItem.id = full.id;
						inputItem.data = (full.storage - amount)*1000;
					}
				}
			}
		}
	},
	
	isValidRFItem: function(id, count, data, container){
		var level = container.tileEntity.getTier();
		return ChargeItemRegistry.isValidItem(id, "Rf", level);
	},
	
	isValidRFStorage: function(id, count, data, container){
		var level = container.tileEntity.getTier();
		return ChargeItemRegistry.isValidStorage(id, "Rf", level);
	},
	
	updateGuiHeader: function(gui, text){
		var header = gui.getWindow("header");
		header.contentProvider.drawing[2].text = Translation.translate(text);
	}
}

var transferByTier = {
	1: 32,
	2: 256,
	3: 2048,
	4: 8192
}

// base

Block.createSpecialType({
    base: 1,
    solid: true,
    destroytime: 5,
    explosionres: 30,
    lightopacity: 15,
    renderlayer: 2,
    sound: "stone"
}, "machine");

var MachineRecipeRegistry = {
	recipeData: {},
	
	registerRecipesFor: function(name, data, validateKeys){
		if(validateKeys){
			var newData = {};
			for(var key in data){
				if(key.indexOf(":") != -1){
					var keyArray = key.split(":");
					var newKey = eval(keyArray[0]) + ":" + keyArray[1];
				} else {
					var newKey = eval(key);
				}
				newData[newKey] = data[key];
			}
			data = newData;
		}
		this.recipeData[name] = data;
	},
	
	addRecipeFor: function(name, input, result){
		var recipes = this.requireRecipesFor(name, true);
		if(Array.isArray(recipes)){
			recipes.push({input: input, result: result});
		}
		else {
			recipes[input] = result;
		}
	},
	
	requireRecipesFor: function(name, createIfNotFound){
		if(!this.recipeData[name] && createIfNotFound){
			this.recipeData[name] = {};
		}
		return this.recipeData[name];
	},
	
	getRecipeResult: function(name, key1, key2){
		var data = this.requireRecipesFor(name);
		if(data){
			return data[key1] || data[key1+":"+key2];
		}
	},
	
	hasRecipeFor: function(name, key1, key2){
		return this.getRecipeResult(name, key1, key2)? true : false;
	}
}

var UpgradeAPI = {
	data: {},
	
	getUpgradeData: function(id){
		return this.data[id];
	},
	
	isUpgrade: function(id){
		return UpgradeAPI.data[id]? true : false;
	},
	
	isValidUpgrade: function(id, count, data, container){
		var upgrades = container.tileEntity.upgrades;
		var upgradeData = UpgradeAPI.getUpgradeData(id);
		if(upgradeData && (!upgrades || upgrades.indexOf(upgradeData.type) != -1)){
			return true;
		}
		return false;
	},

	registerUpgrade: function(id, type, func){
		this.data[id] = {type: type, func: func};
	},

	callUpgrade: function(item, machine, container, data){
		var upgrades = machine.upgrades;
		var upgrade = this.getUpgradeData(item.id);
		if(upgrade && (!upgrades || upgrades.indexOf(upgrade.type) != -1)){
			upgrade.func(item, machine, container, data);
		}
	},
	
	getUpgrades: function(machine, container){
		var upgrades = [];
		for(var slotName in container.slots){
			if(slotName.match(/Upgrade/)){
				var slot = container.getSlot(slotName);
				if(slot.id > 0){
					var find = false;
					for(var i in upgrades){
						var item = upgrades[i];
						if(item.id == slot.id && item.data == slot.data){
							item.count += slot.count;
							find = true;
							break;
						}
					}
					if(!find){
						item = {id: slot.id, count: slot.count, data: slot.data};
						upgrades.push(item);
					}
				}
			}
		}
		return upgrades;
	},

	executeUpgrades: function(machine){
		var container = machine.container;
		var data = machine.data;
		var upgrades = this.getUpgrades(machine, container);
		for(var i in upgrades){
			this.callUpgrade(upgrades[i], machine, container, data);
		}
		StorageInterface.checkHoppers(machine);
	},
}





// file: api/config.js

let Config = {
	reload: function(){
		this.soundEnabled = __config__.getBool("sound_enabled");
		this.machineSoundEnabled = __config__.getBool("machine_sounds");
		this.enableMapping = __config__.getBool("enableMapping");
		
		var lang = FileTools.ReadKeyValueFile("games/com.mojang/minecraftpe/options.txt").game_language;
		this.language = (lang || "en_US").substring(0, 2);
	}
}

Config.reload();

var player;
Callback.addCallback("LevelLoaded", function(){
	Config.reload();
	player = Player.get();
});

isLevelDisplayed = false;
Callback.addCallback("LevelDisplayed", function(){
	isLevelDisplayed = true;
});
Callback.addCallback("LevelLeft", function(){
	isLevelDisplayed = false;
});

 
 




// file: blocks/machines/tfe.js

IDRegistry.genBlockID("tree_extrac");
Block.createBlock("tree_extrac", [
    {
        name: "Tree Fluid Extractor", texture: [
           [side.top,0], 
           [side.top, 0],
           [side.side, 0],
           [side.side, 0],
           ["tree_fluid_extractor", 0],
           [side.side, 0]
        ], inCreative: true
    }
]);

var guiTFE = new UI.StandartWindow({
	standart: {
		header: {text: {text: Translation.translate("Tree Fluid Extractor")}},
		inventory: {standart: true},
		background: {standart: true}
	},

	drawing: [
		{type: "bitmap", x: 449, y: 149, bitmap: "3", scale: 0.75}
	],
	
	elements: {
		"textAmount": {type: "text", x: 500, y: 230, width: 300, height: 30, text: "0 mB"},
		
		"progressScale": {type: "scale", x: 450, y: 150, direction: 0, value: .5, bitmap: "4", scale: 0.75},
		"scaleLatex": {type: "scale", x: 520, y: 150, direction: 1, value: 0.5, bitmap: "gui_water_scale", overlay: "gui_liquid_storage_overlay", scale: GUI_SCALE},
		"slotLatex0": {type: "slot", x: 550, y: 280, isValid: function(id, count, data){
            return LiquidLib.getFullItem(id, data, "latex") ? true : false;
        }},
        
		"slotLatex1": {type: "slot", x: 550, y: 150, isValid: function(){return false;}}
	}
});

MachineRegistry.registerPrototype(BlockID.tree_extrac, {
	defaultValues:{
		
		progress: 0,
		isActive: false,
	},
	
	getGuiScreen: function(){
       return guiTFE;
    },
	
	init: function(){
		this.liquidStorage.setLimit("latex", 8);
	},
	
	addLiquidToItem: MachineRegistry.addLiquidToItem,
	
    tick: function(){
		StorageInterface.checkHoppers(this);
		
		var newActive = false;
		if(World.getBlockID(this.x,this.y,this.z+1)==17 || World.getBlockID(this.x,this.y,this.z+1)==162){
			newActive = true;
			this.data.progress ++;
			if(this.data.progress >= 100){
				this.liquidStorage.addLiquid("latex", 1);
				this.data.progress = 0;
				World.destroyBlock(this.x,this.y,this.z + 1, false);
			}
		}
		
		else {
			this.data.progress = 0;
		}
		if(this.liquidStorage.getAmount("latex") >= 8){
			newActive = false;
			this.data.progress = 0;
			}
		this.setActive(newActive);
		
		
		var slot1 = this.container.getSlot("slotLatex0");
		var slot2 = this.container.getSlot("slotLatex1");
		this.addLiquidToItem("latex", slot1, slot2);
		
		this.container.setScale("progressScale", this.data.progress / 100);
		this.liquidStorage.updateUiScale("scaleLatex", "latex");
		this.container.setText("textAmount", this.liquidStorage.getAmount("latex")*1000 + "mB");
    }

});

StorageInterface.createInterface(BlockID.water_conden, {
	slots: {
		"slotLatex0": {input: true},
		"slotLatex1": {output: true}
	},
	isValidInput: function(item){
		return LiquidLib.getFullItem(item.id, item.data, "latex")? true : false;
	},
	canReceiveLiquid: function(liquid, side){ return false; },
	canTransportLiquid: function(liquid, side){ return true; }
});




// file: blocks/machines/lpu.js

IDRegistry.genBlockID("latex_process");
Block.createBlock("latex_process", [
    {
        name: "Latex Processing Unit", texture: [
           [side.top,0], 
           [side.top, 0],
           [side.side, 0],
           ["latex_process", 0],
           [side.side, 0],
           [side.side, 0]
        ], inCreative: true
    }
]);

TileRenderer.setStandartModel(BlockID.tree_extrac, [[side.top, 0], [side.top, 0], [side.side, 0], ["tree_fluid_extractor", 0], [side.side, 0], [side.side, 0]]);
TileRenderer.registerRotationModel(BlockID.tree_extrac, 0, [[side.top, 0], [side.top, 0], [side.side, 0], ["tree_fluid_extractor", 0], [side.side, 0], [side.side, 0]]);
TileRenderer.registerRotationModel(BlockID.tree_extrac, 4, [[side.top, 0], [side.top, 0], [side.side, 0], ["tree_fluid_extractor", 0], [side.side, 0], [side.side, 0]]);

/*
var custom_UI = new UI.StandartWindow({
	standart: {header: {text: {text: "Created With UIEditor"}},
	background: {color: android.graphics.Color.parseColor("#b3b3b3")}, inventory: {standart: true}},
	drawing: [],
	elements: {
		"slot_0": {type: "slot", x: 350, y: 250, size: 60, visual: false, bitmap: "custom.slot_default", needClean: false, isTransparentBackground: false},
		"scale_0": {type: "scale", x: 354, y: 90, direction: 0, bitmap: "custom.latex_flow", scale: 3.2, value: 1},
		"slot_1": {type: "slot", x: 440, y: 250, size: 60, visual: false, bitmap: "custom.slot_default", needClean: false, isTransparentBackground: false},
		"slot_2": {type: "slot", x: 600, y: 150, size: 60, visual: false, bitmap: "custom.slot_default", needClean: false, isTransparentBackground: false},
		"scale_1": {type: "scale", x: 420, y: 60, direction: 0, bitmap: "custom.scale", scale: 3.2, value: 1},
		"scale_2": {type: "scale", x: 530, y: 158, direction: 0, bitmap: "custom.progress_background", scale: 3.2, value: 1},
		"scale_3": {type: "scale", x: 430, y: 140, direction: 0, bitmap: "custom.gui_water_scale", scale: 3.2, value: 1},
	}
});
*/
var guiLPU = new UI.StandartWindow({
	standart: {
		header: {text: {text: Translation.translate("Latex Processing Unit")}},
		inventory: {standart: true},
		background: {standart: true}
	},

	drawing: [
		{type: "bitmap", x: 550, y: 158, bitmap: "arrow_bg", scale: GUI_SCALE},
		{type: "bitmap", x: 660, y: 135, bitmap: "rf_scale", scale: GUI_SCALE}
	
	],
	
	elements: {
		"slotResult": {type: "slot", x: 600, y: 150, size: 60},
		"progressScale": {type: "scale", x: 550, y: 158, direction: 0, value: .5, bitmap: "arrow_full", scale: GUI_SCALE},
		
		"scaleLatex": {type: "scale", x: 410, y: 90,  direction: 1, value: .5, bitmap: "gui_water_scale", scale: GUI_SCALE},
		
		"slotLatex0": {type: "slot", x: 350, y: 250, isValid: function(id, count, data){
            return LiquidLib.getItemLiquid(id, data) == "latex";
        }},
		"slotLatex1": {type: "slot", x: 350, y: 185, isValid: function(){return false;}},


       "scaleWater": {type: "scale", x: 520, y: 140, direction: 1, value: .5, bitmap: "gui_water_scale", scale: GUI_SCALE},
       
		"slotWater0": {type: "slot", x: 460, y: 250, isValid: function(id, count, data){
            return LiquidLib.getItemLiquid(id, data) == "water";
        }},
		"slotWater1": {type: "slot", x: 460, y: 185, isValid: function(){return false;}},
		
        "energyScale": {type: "scale", x: 660, y: 135, direction: 1, value: .5, bitmap: "rf_scale_full", scale: GUI_SCALE}
	}
});

MachineRegistry.registerElectricMachine(BlockID.latex_process, {
	defaultValues:{
		power_tier: 1,
		energy_storage: 20000,
		energy_consumption: 5,
		work_time: 40,
		progress: 0,
		isActive: false,
	},
	
	getGuiScreen: function(){
       return guiLPU;
    },
	
	init: function(){
		this.liquidStorage.setLimit("water", 10);
		this.liquidStorage.setLimit("latex", 8);
		this.renderModel();
	},
	
	getLiquidFromItem: MachineRegistry.getLiquidFromItem,
	
    tick: function(){
		StorageInterface.checkHoppers(this);
		
		var newActive = false;
		var output = this.container.getSlot("slotResult");
		if(this.liquidStorage.getAmount("latex") >= 0.075 && this.liquidStorage.getAmount("water") >= 1){
			if(this.data.energy >= this.data.energy_consumption){
				this.data.energy -= this.data.energy_consumption;
				this.data.progress ++;
				newActive = true;
				this.startPlaySound();
			}
			if(this.data.progress >= this.data.work_time){
				this.liquidStorage.getLiquid("latex", 0.075);
				this.liquidStorage.getLiquid("water", 1);
				this.data.progress = 0;
				output.id = ItemID.tiny_dry_rubber;
				output.count++;
			}
		}
		else {
			this.data.progress = 0;
		}
		if(!newActive)
			this.stopPlaySound(true);
		this.setActive(newActive);
		
		
		var slot1 = this.container.getSlot("slotWater0");
		var slot2 = this.container.getSlot("slotWater1");
		this.getLiquidFromItem("water", slot1, slot2);
		
		var slot1 = this.container.getSlot("slotLatex0");
		var slot2 = this.container.getSlot("slotLatex1");
		this.getLiquidFromItem("latex", slot1, slot2);
		
		var energyStorage = this.getEnergyStorage();
		this.data.energy = Math.min(this.data.energy, energyStorage);
		
		this.container.setScale("progressScale", this.data.progress / this.data.work_time);
		this.liquidStorage.updateUiScale("scaleLatex", "latex");
		this.liquidStorage.updateUiScale("scaleWater", "water");
		//this.container.setScale("scaleLatex", this.liquidStorage.getAmount("latex") / this.liquidStorage.getLimit("latex"));
		this.container.setScale("energyScale", this.data.energy / energyStorage);
    },
	
	getEnergyStorage: function(){
		return this.data.energy_storage;
	},
	
	getStartSoundFile: function(){
		return "Machines/TurnOn.ogg";
    },
	getInterruptSoundFile: function(){
		return "Machines/TurnOff.ogg";
    },
    
	renderModel: MachineRegistry.renderModelWithRotation,
	energyReceive: MachineRegistry.basicEnergyReceiveFunc
	
});

TileRenderer.setRotationPlaceFunction(BlockID.latex_process, true);

StorageInterface.createInterface(BlockID.latex_process, {
	slots: {
		"slotWater0": {input: true},
		"slotWater1": {output: true},
		"slotLatex0": {input: true},
		"slotLatex1": {output: true}
	},
	canReceiveLiquid: function(liquid){
		return liquid == "water" || liquid == "latex";
	},
	canTransportLiquid: function(liquid){ return false; },
	getLiquidStored: function(storage){
		return storage == "input" ? "water" : "latex";
	}
});




// file: blocks/machines/pfg.js

IDRegistry.genBlockID("pf_generator");
Block.createBlock("pf_generator", [
    {
        name: "Petrified Fuel Generator", texture: [
           [side.top,0], 
           [side.top, 0],
           [side.side, 0],
           ["petrified_fuel_generator", 0],
           [side.side, 0],
           [side.side, 0]
        ], inCreative: true
    }
]);

TileRenderer.setStandartModel(BlockID.pf_generator, [[side.top, 0], [side.top, 0], [side.side, 0], ["petrified_fuel_generator", 0], [side.side, 0], [side.side, 0]]);
TileRenderer.registerRotationModel(BlockID.pf_generator, 0, [[side.top, 0], [side.top, 0], [side.side, 0], ["petrified_fuel_generator", 0], [side.side, 0], [side.side, 0]]);
TileRenderer.registerRotationModel(BlockID.pf_generator, 4, [[side.top, 0], [side.top, 0], [side.side, 0], ["petrified_fuel_generator", 0], [side.side, 0], [side.side, 0]]);

var guiPFG = new UI.StandartWindow({
	standart: {
		header: {text: {text: Translation.translate("Petrified Fuel Generator")}},
		inventory: {standart: true},
		background: {standart: true}
	},
	
	drawing: [
		{type: "bitmap", x: 530, y: 144, bitmap: "energy_bar_background", scale: GUI_SCALE},
		{type: "bitmap", x: 450, y: 150, bitmap: "fire_background", scale: GUI_SCALE},
	],
	
	elements: {
		"energyScale": {type: "scale", x: 530 + GUI_SCALE * 4, y: 144, direction: 0, value: 0.5, bitmap: "energy_bar_scale", scale: GUI_SCALE},
		"burningScale": {type: "scale", x: 450, y: 150, direction: 1, value: 0.5, bitmap: "fire_scale", scale: GUI_SCALE},
		"slotEnergy": {type: "slot", x: 441, y: 75, isValid: function(id){return ChargeItemRegistry.isValidItem(id, "Rf", 1);}},
		"slotFuel": {type: "slot", x: 441, y: 212,
			isValid: function(id, count, data){
				return Recipes.getFuelBurnDuration(id, data) > 0;
			}
		},
		"textInfo1": {type: "text", x: 642, y: 142, width: 300, height: 30, text: "0/"},
		"textInfo2": {type: "text", x: 642, y: 172, width: 300, height: 30, text: "100000"}
	}
});

MachineRegistry.registerGenerator(BlockID.pf_generator, {
	defaultValues: {
		meta: 0,
		burn: 0,
		burnMax: 0,
		isActive: false
	},
	
	getGuiScreen: function(){
		return guiPFG;
	},
	
	getFuel: function(slotName){
		var fuelSlot = this.container.getSlot(slotName);
		if (fuelSlot.id > 0){
			var burn = Recipes.getFuelBurnDuration(fuelSlot.id, fuelSlot.data);
			if (burn && !LiquidRegistry.getItemLiquid(fuelSlot.id, fuelSlot.data)){
				fuelSlot.count--;
				this.container.validateSlot(slotName);
				
				return burn;
			}
		}
		return 0;
	},
	
	tick: function(){
		StorageInterface.checkHoppers(this);
		var energyStorage = this.getEnergyStorage();
		
		if(this.data.burn <= 0 && this.data.energy + 10 < energyStorage){
			this.data.burn = this.data.burnMax = this.getFuel("slotFuel") / 4;
		}
		if(this.data.burn > 0 && 
		  (!this.data.isActive && this.data.energy + 100 <= energyStorage ||
		  this.data.isActive && this.data.energy + 10 <= energyStorage)){
			this.data.energy += 10;
			this.data.burn--;
			this.activate();
			this.startPlaySound("Machines/Furnace.ogg");
		} else {
			this.deactivate();
			this.stopPlaySound();
		}
		
		this.data.energy -= ChargeItemRegistry.addEnergyTo(this.container.getSlot("slotEnergy"), "Rf", this.data.energy, 1);
		
		this.container.setScale("burningScale", this.data.burn / this.data.burnMax || 0);
		this.container.setScale("energyScale", this.data.energy / energyStorage);
		this.container.setText("textInfo1", this.data.energy + "/");
	},
	
	getEnergyStorage: function(){
		return 100000;
	},
	
	energyTick: function(type, src){
		var output = Math.min(32, this.data.energy);
		this.data.energy += src.add(output) - output;
	},
	
	renderModel: MachineRegistry.renderModelWithRotation
	
});

TileRenderer.setRotationPlaceFunction(BlockID.pf_generator);

StorageInterface.createInterface(BlockID.pf_generator, {
	slots: {
		"slotFuel": {input: true}
	},
	isValidInput: function(item){
		return Recipes.getFuelBurnDuration(item.id, item.data) > 0;
	}
});




// file: blocks/machines/waterc.js


IDRegistry.genBlockID("water_conden");
Block.createBlock("water_conden", [
    {
        name: "Water Condensator", texture: [
           [side.top,0], 
           [water.top, 0],
           [water.side, 0],
           [water.side, 0],
           [water.side, 0],
           [water.side, 0]
        ], inCreative: true
    }
]);
/*
TileRenderer.setStandartModel(BlockID.water_conden, [[side.top, 0], [water.top, 0], [water.side, 0], [water.side 0], [water.side, 0], [water.side, 0]]);
TileRenderer.registerRotationModel(BlockID.water_conden, 0, [[side.top, 0], [water.top, 0], [water.side, 0], [water.side, 0], [water.side, 0], [water.side, 0]]);
TileRenderer.registerRotationModel(BlockID.water_conden, 4, [[side.top, 0], [water.top, 0], [water.side, 0], [water.side, 0], [water.side, 0], [water.side, 0]]);
*/

var guiWC = new UI.StandartWindow({
	standart: {
		header: {text: {text: Translation.translate("Water Condensator")}},
		inventory: {standart: true},
		background: {standart: true}
	},

	drawing: [
	{type: "image", x: 480, y: 350, bitmap: "3", scale: 0.75},
	],

	elements: {
		"progressScale": {type: "scale", x: 480, y: 350, direction: 0, bitmap: "4", scale: 0.75, value: 1},
		"textAmount": {type: "text", x: 500, y: 230, width: 300, height: 30, text: "0 mB"},
		"liquidScale": {type: "scale", x: 493, y: 171, direction: 1, value: 0.5, bitmap: "gui_water_scale", overlay: "gui_liquid_storage_overlay", scale: GUI_SCALE},
		"slotLiquid1": {type: "slot", x: 550, y: 280,
			isValid: function(id, count, data){
				return LiquidLib.getFullItem(id, data, "water")? true : false;
			}
		},
		"slotLiquid2": {type: "slot", x: 550, y: 150, isValid: function(){return false;}}
		
	}
});

MachineRegistry.registerPrototype(BlockID.water_conden, {
	defaultValues: {
		progress: 0,
		isActive: false
	},
	
	getGuiScreen: function(){
       return guiWC;
    },
	
	init: function(){
		this.liquidStorage.setLimit("water", 8);
	},
	
	addLiquidToItem: MachineRegistry.addLiquidToItem,
	
    tick: function(){
		StorageInterface.checkHoppers(this);
		
		var newActive = false;
		if(World.getBlockID(this.x+1,this.y,this.z)==9 || World.getBlockID(this.x-1,this.y,this.z)==9 || World.getBlockID(this.x,this.y,this.z+1)==9 || World.getBlockID(this.x,this.y,this.z-1)==9){
			newActive = true;
			this.data.progress ++;
			this.container.setScale("progressScale", this.data.progress / 10);
			if(this.data.progress >= 10){
				this.liquidStorage.addLiquid("water", 0.1);
				this.data.progress = 0;
			}
		}
		else {
			newActive = true;
			this.data.progress ++;
			this.container.setScale("progressScale", this.data.progress / 40);
			if(this.data.progress >= 40){
				this.liquidStorage.addLiquid("water", 0.01);
				this.data.progress = 0;
			}
		}
		if(this.liquidStorage.getAmount("water") >= 8){
			newActive = false;
			this.data.progress = 0;
			}
		this.setActive(newActive);
		
		
		var slot1 = this.container.getSlot("slotLiquid1");
		var slot2 = this.container.getSlot("slotLiquid2");
		this.addLiquidToItem("water", slot1, slot2);
	
		this.liquidStorage.updateUiScale("liquidScale", "water");
		this.container.setText("textAmount", this.liquidStorage.getAmount("water")*1000 + "mB");
	}
	
});

TileRenderer.setRotationPlaceFunction(BlockID.water_conden);

StorageInterface.createInterface(BlockID.water_conden, {
	slots: {
		"slotLiquid1": {input: true},
		"slotLiquid2": {output: true}
	},
	isValidInput: function(item){
		return LiquidLib.getFullItem(item.id, item.data, "water")? true : false;
	},
	canReceiveLiquid: function(liquid, side){ return false; },
	canTransportLiquid: function(liquid, side){ return true; }
});




// file: blocks/machines/test.js

IDRegistry.genBlockID("mob_crusher");
Block.createBlock("mob_crusher", [
    {
        name: "Mob Crusher", texture: [
           [side.top,0], 
           [side.top, 0],
           [side.side, 0],
           [side.side, 0],
           ["mob_relocator", 0],
           [side.side, 0]
        ], inCreative: true
    }
]);

var guiMC = new UI.StandartWindow({
	standart: {
		header: {text: {text: Translation.translate("Mob Crusher")}},
		inventory: {standart: true},
		background: {standart: true}
	},

	drawing: [
	    {type: "bitmap", x: 700, y: 135, bitmap: "rf_scale", scale: GUI_SCALE},
		{type: "bitmap", x: 449, y: 149, bitmap: "3", scale: 0.75}
	],
	
	elements: {
		"textAmount": {type: "text", x: 500, y: 230, width: 300, height: 30, text: "0 mB"},
		
		"progressScale": {type: "scale", x: 450, y: 150, direction: 0, value: .5, bitmap: "4", scale: 0.75},
		"scaleLiquid": {type: "scale", x: 520, y: 150, direction: 1, value: 0.5, bitmap: "gui_water_scale", overlay: "gui_liquid_storage_overlay", scale: GUI_SCALE},
		"slotLiquid1": {type: "slot", x: 550, y: 280, isValid: function(id, count, data){
            return LiquidLib.getFullItem(id, data, "essence") ? true : false;
        }},
        
		"slotLiquid2": {type: "slot", x: 550, y: 150, isValid: function(){return false;}},
		"slotOutput0": {type: "slot", x: 630, y: 130, size: 60},
		"slotOutput1": {type: "slot", x: 630, y: 190, size: 60},
       "energyScale": {type: "scale", x: 700, y: 135, direction: 1, value: .5, bitmap: "rf_scale_full", scale: GUI_SCALE}
	}
});
var VanillaMobs = [
      EntityType.BAT,
      EntityType.BLAZE,
      EntityType.CAT,
      EntityType.CAVE_SPIDER,
      EntityType.COD,
      EntityType.COW,
      EntityType.CHICKEN,
      EntityType.CREEPER,
      EntityType.DONKEY,
      EntityType.DROWNER,
      EntityType.ENDERMAN,
      EntityType.ENDERMITE,
      EntityType.ENDER_DRAGON,
      EntityType.GHAST,
      EntityType.GUARDIAN,
      EntityType.HORSE,
      EntityType.HUSK,
      EntityType.IRON_GOLEM,
      EntityType.LAVA_SLIME,
      EntityType.LLAMA,
      EntityType.PANDA,
      EntityType.PIG,
      EntityType.PIG_ZOMBIE,
      EntityType.PILLIGER,
      EntityType.RAVAGER,
      EntityType.SHEEP,
      EntityType.SHULKER,
      EntityType.SNOW_GOLEM,
      EntityType.SPIDER,
      EntityType.SQUID,
      EntityType.STRAY,
      EntityType.TURTLE,
      EntityType.WHITCH,
      EntityType.PHANTOM,
      EntityType.SKELETON,
      EntityType.SPIDER,
      EntityType.ZOMBIE,
      EntityType.WITHER
];

MachineRegistry.registerElectricMachine(BlockID.mob_crusher, {
    defaultValues: {
    	progress: 0,
        power_tier: 1,
        energy_storage: 51000,
        energy_consumption: 40,
		work_time: 25,
		minX: 0,
		minY: -1,
		minZ: -1,
        maxX: 1,
        maxY: 2,
        maxZ: 1,
        scanZ: 0,
        scanY: 0,
        scanX: 0
    },
	
    getGuiScreen: function(){
        return guiMC;
    },
	
    getTier: function(){
        return this.data.power_tier;
    },
    
    init: function(){
		this.liquidStorage.setLimit("essence", 8);
	},
	
	getLiquidFromItem: MachineRegistry.getLiquidFromItem,

    tick: function(){
        StorageInterface.checkHoppers(this);

        if(this.data.energy >= this.data.energy_consumption) {
        this.scan();
        }
        var slot1 = this.container.getSlot("slotLiquid1");
		var slot2 = this.container.getSlot("slotLiquid2");
		this.getLiquidFromItem("essence", slot1, slot2);

        var energyStorage = this.getEnergyStorage();
        this.data.energy = Math.min(this.data.energy, energyStorage);
   //     this.data.energy += ChargeItemRegistry.getEnergyFrom(this.container.getSlot("slotEnergy"), "RF", energyStorage - this.data.energy, this.getTier());

        this.container.setScale("energyScale", this.data.energy / energyStorage);
        this.container.setScale("progressScale", this.data.progress);
		this.liquidStorage.updateUiScale("scaleLiquid", "essence");
		this.container.setText("textAmount", this.liquidStorage.getAmount("essence") * 1000 + " mB");
	},
	
	scan: function(){
        this.data.scanX++;
        if (this.data.scanX > this.data.maxX) {
            this.data.scanX = this.data.minX;
            this.data.scanZ++;
            if (this.data.scanZ > this.data.maxZ) {
                this.data.scanZ =this.data.maxZ;
                this.data.scanY++;
                if (this.data.scanY > this.data.maxY) {
                    this.data.scanY = this.data.maxY;
                }
            }
        }
        
      for(let c in VanillaMobs){
		var ent = VanillaMobs[c];
		  let ENTITY_ARR = Entity.getAllInRange(this.x + scanZ, this.y + scanY, this.z + scanZ, 0);
		    for (let i in ENTITY_ARR) {
		      if(ENTITY_ARR[i] === ent){
        this.data.progress += 1/this.data.work_time;
        if(this.data.progress >= 1){
				Entity.damageEntity(ENTITY_ARR, 300);
				this.data.energy -= this.data.energy_consumption;
				this.data.progress = 0;
                this.liquidStorage.addLiquid("essence", 0.5);
		   } else {
			this.data.progress = 0;
			    }
			}
         }
       }
       
    },
	/*
	
         

        if (ENTITY_ARR[i] === ent) {
            return true
            break;
        }
    }
    return false
} 

	putItem: function(item){
        for(var i = 0; i < 2; i++){
            var slot = this.container.getSlot("slotOutput" + i);
            if(!slot.id || slot.id == item.id && slot.count < Item.getMaxStack(item.id)){
                var add = Math.min(Item.getMaxStack(item.id) - slot.count, item.count);
                slot.id = item.id;
                slot.count += add;
                slot.data = item.data;
                item.count -= add;
            }
        }
    },
	
    isInvFull: function(){
        for(var i = 0; i < 1; i++){
            var slot = this.container.getSlot("slotOutput" + i);
            var maxStack = Item.getMaxStack(slot.id);
            if(!slot.id || slot.count < maxStack) return false;
        }
        return true;
    },
	*/
    
	
    getEnergyStorage: function(){
        return this.data.energy_storage;
    },
    
    energyReceive: MachineRegistry.basicEnergyReceiveFunc
});




// file: blocks/frame.js

IDRegistry.genBlockID("machineFrame");
Block.createBlock("machineFrame", [
    {
        name: "Machine Case", texture: [
           ["case",0],
        ], inCreative: true
    }
]);




// file: blocks/liquidCable.js


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




// file: items/plastic.js

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




// file: items/slime.js

IDRegistry.genItemID("pinkSlime");
Item.createItem("pinkSlime", "Pink Slime", {name:"pink_slime"})




