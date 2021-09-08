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

  getFilePath: function(name) {
    return __dir__ + "res/sounds/" + name;
  },

  isSoundEnabled: function() {
    return Config.soundEnabled && isLevelDisplayed;
  },

  addSoundPlayer: function(name, loop, priorized) {
    if (this.soundPlayers.length >= this.maxPlayersCount) {
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

  addMultiSoundPlayer: function(startingSound, startSound, finishingSound) {
    if (this.soundPlayers.length >= this.maxPlayersCount) {
      Logger.Log(__name__ + " sound stack is full", "WARNING");
      return;
    }
    let sound = new MultiSound(startingSound, startSound, finishingSound);
    this.soundPlayers.push(sound);
    return sound;
  },

  playSound: function(name, loop, disableMultiPlaying) {
    if (!this.isSoundEnabled()) { return null; }
    let curSound = null;
    try {
      for (let i in this.soundPlayers) {
        let sound = this.soundPlayers[i];
        if (sound.isPlaying()) {
          if (sound.name == name && disableMultiPlaying) {
            return sound;
          }
        }
        else if (sound.name == name) {
          sound.start();
          return sound;
        }
        else if (!sound.isPreparing && !sound.priorized) {
          curSound = new Sound(name, false);
          curSound.setDataSource(this.getFilePath(name));
          curSound.setLooping(loop || false);
          curSound.prepare();
          sound = this.soundPlayers[i];
          if (!sound.isPreparing && !sound.isPlaying()) { // second check after preparing because of multi-threading
            this.soundPlayers[i] = curSound;
            this.soundsToRelease.push(sound);
          } else {
            this.soundPlayers.push(curSound);
          }
          break;
        }
      }
      if (!curSound) {
        curSound = this.addSoundPlayer(name, loop, false);
      }
      curSound.start();
      //Game.message("sound "+ name +" started");
    }
    catch (err) {
      Logger.Log("sound " + name + " start failed", "ERROR");
      Logger.Log(err, "ERROR");
    }
    return curSound;
  },

  playSoundAt: function(coord, name, loop, radius) {
    if (loop && Entity.getDistanceBetweenCoords(coord, Player.getPosition()) > radius) {
      return null;
    }
    let sound = this.playSound(name, loop);
    if (sound) {
      sound.setSource(coord, radius);
    }
    return sound;
  },

  updateVolume: function() {
    for (let i in this.soundPlayers) {
      let sound = this.soundPlayers[i];
      sound.setVolume(sound.volume);
    }
  },

  createSource: function(fileName, coord, radius) {
    if (!this.isSoundEnabled()) { return null; }
    let curSound = null;
    try {
      for (let i in this.soundPlayers) {
        let sound = this.soundPlayers[i];
        if (!sound.isPlaying() && !sound.isPreparing && !sound.priorized) {
          curSound = new MultiSound(fileName[0], fileName[1], fileName[2]);
          sound = this.soundPlayers[i];
          if (!sound.isPreparing && !sound.isPlaying()) { // second check after preparing because of multi-threading
            this.soundPlayers[i] = curSound;
            this.soundsToRelease.push(sound);
          } else {
            this.soundPlayers.push(curSound);
          }
          break;
        }
      }
      if (!curSound) {
        curSound = this.addMultiSoundPlayer(fileName[0], fileName[1], fileName[2]);
      }
      curSound.setSource(coord, radius);
      curSound.start();
    }
    catch (err) {
      Logger.Log("multi-sound [" + fileName + "] start failed", "ERROR");
      Logger.Log(err, "ERROR");
    }
    return curSound;
  },

  updateSourceVolume: function(sound) {
    let s = sound.source;
    let p = Player.getPosition();
    let volume = Math.max(0, 1 - Math.sqrt(Math.pow(p.x - s.x, 2) + Math.pow(p.y - s.y, 2) + Math.pow(p.z - s.z, 2)) / s.radius);
    sound.setVolume(volume);
  },

  clearSounds: function() {
    for (let i = 0; i < this.soundPlayers.length; i++) {
      let sound = this.soundPlayers[i];
      if (sound.isPlaying()) {
        sound.stop();
      }
      if (!sound.priorized) {
        sound.release();
        this.soundPlayers.splice(i--, 1);
      }
    }
  }
}

function Sound(name, priorized) {
  this.name = name;
  this.media = new android.media.MediaPlayer();
  this.priorized = priorized || false;
  this.isPreparing = true;

  this.setDataSource = function(path) {
    this.media.setDataSource(path);
  }

  this.setLooping = function(loop) {
    this.media.setLooping(loop);
  }

  this.prepare = function() {
    this.media.prepare();
  }

  this.isPlaying = function() {
    return this.media.isPlaying();
  }

  this.isLooping = function() {
    return this.media.isLooping();
  }

  this.start = function() {
    this.media.start();
    this.isPreparing = false;
  }

  this.pause = function() {
    this.media.pause();
  }

  this.seekTo = function(ms) {
    this.media.seekTo(ms);
  }

  this.stop = function() {
    this.media.pause();
    this.media.seekTo(0);
  }

  this.release = function() {
    this.media.release();
  }

  this.setVolume = function(volume) {
    this.volume = volume;
    volume *= gameVolume;
    this.media.setVolume(volume, volume);
  }

  this.setVolume(1);

  this.setSource = function(coord, radius) {
    this.source = { x: coord.x + 0.5, y: coord.y + 0.5, z: coord.z + 0.5, radius: radius, dimension: Player.getDimension() };
    SoundAPI.updateSourceVolume(this);
  }
}

function MultiSound(startingSound, startSound, finishingSound) {
  this.parent = Sound;
  this.parent(startingSound || startSound, 0, true);

  this.startingSound = null;
  this.startSound = null;
  this.finishingSound = null;

  this.setDataSource(SoundAPI.getFilePath(startingSound || startSound));
  if (startingSound) {
    this.startingSound = this.media;
    this.startSound = new android.media.MediaPlayer();
    this.startSound.setDataSource(SoundAPI.getFilePath(startSound));
    this.startSound.setLooping(true);
    let self = this;
    this.media.setOnCompletionListener(new android.media.MediaPlayer.OnCompletionListener({
      onCompletion: function(mp) {
        self.playStartSound();
      }
    }));
    this.startSound.prepareAsync();
  } else {
    this.startSound = this.media;
    this.setLooping(true);
  }
  this.prepare();

  if (finishingSound) {
    let media = new android.media.MediaPlayer();
    media.setDataSource(SoundAPI.getFilePath(finishingSound));
    media.prepareAsync();
    this.finishingSound = media;
  }

  this.playStartSound = function() {
    this.media = this.startSound;
    this.media.start();
  }

  this.playFinishingSound = function() {
    if (!this.isFinishing) {
      this.media = this.finishingSound;
      this.media.start();
      this.isFinishing = true;
    }
  }

  this.release = function() {
    this.startSound.release();
    if (this.startingSound) {
      this.startingSound.release();
    }
    if (this.finishingSound) {
      this.finishingSound.release();
    }
  }
}

Callback.addCallback("tick", function() {
  for (let i in SoundAPI.soundsToRelease) {
    SoundAPI.soundsToRelease[i].release();
  }
  SoundAPI.soundsToRelease = [];
  for (let i in SoundAPI.soundPlayers) {
    let sound = SoundAPI.soundPlayers[i];
    if (sound.isPlaying() && sound.source) {
      if (sound.source.dimension == Player.getDimension()) {
        SoundAPI.updateSourceVolume(sound);
      } else {
        sound.stop();
      }
    }
  }
});

Callback.addCallback("LevelLeft", function() {
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
Callback.addCallback("NativeGuiChanged", function(screen) {
  var currentScreen = screen.startsWith("screen_world_controls_and_settings") || screen.startsWith("screen_controls_and_settings");
  if (prevScreen && !currentScreen) {
    gameVolume = FileTools.ReadKeyValueFile(settings_path)["audio_sound"];
    SoundAPI.updateVolume();
  }
  prevScreen = currentScreen;
});

var MachineRegistry = {
  machineIDs: {},

  isMachine: function(id) {
    return this.machineIDs[id];
  },

  // Machine Base
  registerPrototype: function(id, Prototype) {
    // register ID
    this.machineIDs[id] = true;

    // audio
    if (Prototype.getStartSoundFile) {
      if (!Prototype.getStartingSoundFile) {
        Prototype.getStartingSoundFile = function() { return null; }
      }
      if (!Prototype.getInterruptSoundFile) {
        Prototype.getInterruptSoundFile = function() { return null; }
      }
      Prototype.startPlaySound = Prototype.startPlaySound || function() {
        if (!Config.machineSoundEnabled) { return; }
        let audio = this.audioSource;
        if (audio && audio.isFinishing) {
          audio.stop();
          audio.media = audio.startingSound || audio.startSound;
          audio.start();
          audio.isFinishing = false;
        }
        else if (!this.remove && (!audio || !audio.isPlaying()) && this.dimension == Player.getDimension()) {
          this.audioSource = SoundAPI.createSource([this.getStartingSoundFile(), this.getStartSoundFile(), this.getInterruptSoundFile()], this, 16);
        }
      }
      Prototype.stopPlaySound = Prototype.stopPlaySound || function(playInterruptSound) {
        let audio = this.audioSource;
        if (audio) {
          if (!audio.isPlaying()) {
            this.audioSource = null;
          }
          else if (!audio.isFinishing) {
            audio.stop();
            if (playInterruptSound) {
              audio.playFinishingSound();
            }
          }
        }
      }
    }
    else {
      Prototype.startPlaySound = Prototype.startPlaySound || function(name) {
        if (!Config.machineSoundEnabled) { return; }
        let audio = this.audioSource;
        if (!this.remove && (!audio || !audio.isPlaying()) && this.dimension == Player.getDimension()) {
          let sound = SoundAPI.playSoundAt(this, name, true, 16);
          this.audioSource = sound;
        }
      }
      Prototype.stopPlaySound = Prototype.stopPlaySound || function() {
        if (this.audioSource && this.audioSource.isPlaying()) {
          this.audioSource.stop();
          this.audioSource = null;
        }
      }
    }


    // machine activation
    if (Prototype.defaultValues && Prototype.defaultValues.isActive !== undefined) {
      if (!Prototype.renderModel) {
        Prototype.renderModel = this.renderModelWithRotation;
      }

      Prototype.setActive = Prototype.setActive || this.setActive;

      Prototype.activate = Prototype.activate || function() {
        this.setActive(true);
      }
      Prototype.deactivate = Prototype.deactivate || function() {
        this.setActive(false);
      }
      Prototype.destroy = Prototype.destroy || function() {
        BlockRenderer.unmapAtCoords(this.x, this.y, this.z);
        this.stopPlaySound();
      }
    }

    if (!Prototype.init && Prototype.renderModel) {
      Prototype.init = Prototype.renderModel;
    }

    ToolAPI.registerBlockMaterial(id, "stone", 1, true);
    Block.setDestroyTime(id, 3);
    TileEntity.registerPrototype(id, Prototype);
  },

  // RF machines
  registerElectricMachine: function(id, Prototype) {
    // wire connection
    ICRender.getGroup("rf-wire").add(id, -1);
    ICRender.getGroup("ic-wire").add(id, -1);

    // setup energy values
    if (Prototype.defaultValues) {
      Prototype.defaultValues.energy = 0;
      Prototype.defaultValues.energy_receive = 0;
      Prototype.defaultValues.last_energy_receive = 0;
      Prototype.defaultValues.voltage = 0;
      Prototype.defaultValues.last_voltage = 0;
    }
    else {
      Prototype.defaultValues = {
        energy: 0,
        energy_receive: 0,
        last_energy_receive: 0,
        voltage: 0,
        last_voltage: 0
      };
    }

    Prototype.getTier = Prototype.getTier || function() {
      return 1;
    }

    if (!Prototype.getEnergyStorage) {
      Prototype.getEnergyStorage = function() {
        return 0;
      };
    }

    if (!Prototype.energyTick) {
      Prototype.energyTick = function() {
        this.data.last_energy_receive = this.data.energy_receive;
        this.data.energy_receive = 0;
        this.data.last_voltage = this.data.voltage;
        this.data.voltage = 0;
      };
    }

    if (!Prototype.getMaxPacketSize) {
      Prototype.getMaxPacketSize = function(tier) {
        return 8 << this.getTier() * 2;
      }
    }

    Prototype.energyReceive = Prototype.energyReceive || this.basicEnergyReceiveFunc;

    this.registerPrototype(id, Prototype);
    // register for energy net
    EnergyTileRegistry.addEnergyTypeForId(id, RF);
    EnergyTileRegistry.addEnergyTypeForId(id, EU);
  },

  registerGenerator(id, Prototype) {
    Prototype.canReceiveEnergy = function() {
        return false;
      },

      Prototype.isEnergySource = function() {
        return true;
      },

      Prototype.energyTick = Prototype.energyTick || this.basicEnergyOutFunc;

    this.registerElectricMachine(id, Prototype);
  },

  registerRFStorage(id, Prototype) {
    Prototype.isEnergySource = function() {
        return true;
      },

      Prototype.energyReceive = Prototype.energyReceive || this.basicEnergyReceiveFunc;

    Prototype.energyTick = Prototype.energyTick || this.basicEnergyOutFunc;

    Prototype.isTeleporterCompatible = true;

    this.registerElectricMachine(id, Prototype);
  },

  // standard functions
  setStoragePlaceFunction: function(id, fullRotation) {
    Block.registerPlaceFunction(BlockID[id], function(coords, item, block) {
      var place = World.canTileBeReplaced(block.id, block.data) ? coords : coords.relative;
      World.setBlock(place.x, place.y, place.z, item.id, 0);
      World.playSound(place.x, place.y, place.z, "dig.stone", 1, 0.8)
      var rotation = TileRenderer.getBlockRotation(fullRotation);
      var tile = World.addTileEntity(place.x, place.y, place.z);
      tile.data.meta = rotation;
      TileRenderer.mapAtCoords(place.x, place.y, place.z, item.id, rotation);
      if (item.extra) {
        tile.data.energy = item.extra.getInt("energy");
      }
    });
  },

  setFacing: function(coords) {
    if (Entity.getSneaking(player)) {
      var facing = coords.side ^ 1;
    } else {
      var facing = coords.side;
    }
    if (facing != this.data.meta) {
      this.data.meta = facing;
      this.renderModel();
      return true;
    }
    return false;
  },

  renderModel: function() {
    if (this.data.isActive) {
      TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, 0);
    } else {
      BlockRenderer.unmapAtCoords(this.x, this.y, this.z);
    }
  },

  renderModelWithRotation: function() {
    TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, this.data.meta + (this.data.isActive ? 4 : 0));
  },

  renderModelWith6Sides: function() {
    TileRenderer.mapAtCoords(this.x, this.y, this.z, this.blockID, this.data.meta + (this.data.isActive ? 6 : 0));
  },

  setActive: function(isActive) {
    if (this.data.isActive != isActive) {
      this.data.isActive = isActive;
      this.renderModel();
    }
  },

  basicEnergyOutFunc: function(type, src) {
    this.data.last_energy_receive = this.data.energy_receive;
    this.data.energy_receive = 0;
    this.data.last_voltage = this.data.voltage;
    this.data.voltage = 0;
    var output = this.getMaxPacketSize();
    if (this.data.energy >= output) {
      this.data.energy += src.add(output) - output;
    }
  },

  basicEnergyReceiveFunc: function(type, amount, voltage) {
    var maxVoltage = this.getMaxPacketSize();
    if (voltage > maxVoltage) {
      var add = Math.min(maxVoltage, this.getEnergyStorage() - this.data.energy);
    } else {
      var add = Math.min(amount, this.getEnergyStorage() - this.data.energy);
    }
    this.data.energy += add;
    this.data.energy_receive += add;
    this.data.voltage = Math.max(this.data.voltage, voltage);
    return add;
  },

  getLiquidFromItem: function(liquid, inputItem, outputItem, hand) {
    if (hand) outputItem = { id: 0, count: 0, data: 0 };
    var empty = LiquidLib.getEmptyItem(inputItem.id, inputItem.data);
    if (empty && (!liquid && this.interface.canReceiveLiquid(empty.liquid) || empty.liquid == liquid) && !this.liquidStorage.isFull(empty.liquid)) {
      if (outputItem.id == empty.id && outputItem.data == empty.data && outputItem.count < Item.getMaxStack(empty.id) || outputItem.id == 0) {
        var liquidLimit = this.liquidStorage.getLimit(empty.liquid);
        var storedAmount = this.liquidStorage.getAmount(liquid).toFixed(3);
        var count = Math.min(hand ? inputItem.count : 1, parseInt((liquidLimit - storedAmount) / empty.amount));
        if (count > 0) {
          this.liquidStorage.addLiquid(empty.liquid, empty.amount * count);
          inputItem.count -= count;
          outputItem.id = empty.id;
          outputItem.data = empty.data;
          outputItem.count += count;
          if (!hand) this.container.validateAll();
        }
        else if (inputItem.count == 1 && empty.storage) {
          var amount = Math.min(liquidLimit - storedAmount, empty.amount);
          this.liquidStorage.addLiquid(empty.liquid, amount);
          inputItem.data += amount * 1000;
        }
        if (hand) {
          if (outputItem.id) {
            Player.addItemToInventory(outputItem.id, outputItem.count, outputItem.data);
          }
          if (inputItem.count == 0) inputItem.id = inputItem.data = 0;
          Player.setCarriedItem(inputItem.id, inputItem.count, inputItem.data);
          return true;
        }
      }
    }
  },

  addLiquidToItem: function(liquid, inputItem, outputItem) {
    var amount = this.liquidStorage.getAmount(liquid).toFixed(3);
    if (amount > 0) {
      var full = LiquidLib.getFullItem(inputItem.id, inputItem.data, liquid);
      if (full && (outputItem.id == full.id && outputItem.data == full.data && outputItem.count < Item.getMaxStack(full.id) || outputItem.id == 0)) {
        if (amount >= full.amount) {
          this.liquidStorage.getLiquid(liquid, full.amount);
          inputItem.count--;
          outputItem.id = full.id;
          outputItem.data = full.data;
          outputItem.count++;
          this.container.validateAll();
        }
        else if (inputItem.count == 1 && full.storage) {
          if (inputItem.id == full.id) {
            amount = this.liquidStorage.getLiquid(liquid, full.amount);
            inputItem.data -= amount * 1000;
          } else {
            amount = this.liquidStorage.getLiquid(liquid, full.storage);
            inputItem.id = full.id;
            inputItem.data = (full.storage - amount) * 1000;
          }
        }
      }
    }
  },

  isValidRFItem: function(id, count, data, container) {
    var level = container.tileEntity.getTier();
    return ChargeItemRegistry.isValidItem(id, "Rf", level);
  },

  isValidRFStorage: function(id, count, data, container) {
    var level = container.tileEntity.getTier();
    return ChargeItemRegistry.isValidStorage(id, "Rf", level);
  },

  updateGuiHeader: function(gui, text) {
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

  registerRecipesFor: function(name, data, validateKeys) {
    if (validateKeys) {
      var newData = {};
      for (var key in data) {
        if (key.indexOf(":") != -1) {
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

  addRecipeFor: function(name, input, result) {
    var recipes = this.requireRecipesFor(name, true);
    if (Array.isArray(recipes)) {
      recipes.push({ input: input, result: result });
    }
    else {
      recipes[input] = result;
    }
  },

  requireRecipesFor: function(name, createIfNotFound) {
    if (!this.recipeData[name] && createIfNotFound) {
      this.recipeData[name] = {};
    }
    return this.recipeData[name];
  },

  getRecipeResult: function(name, key1, key2) {
    var data = this.requireRecipesFor(name);
    if (data) {
      return data[key1] || data[key1 + ":" + key2];
    }
  },

  hasRecipeFor: function(name, key1, key2) {
    return this.getRecipeResult(name, key1, key2) ? true : false;
  }
}

var UpgradeAPI = {
  data: {},

  getUpgradeData: function(id) {
    return this.data[id];
  },

  isUpgrade: function(id) {
    return UpgradeAPI.data[id] ? true : false;
  },

  isValidUpgrade: function(id, count, data, container) {
    var upgrades = container.tileEntity.upgrades;
    var upgradeData = UpgradeAPI.getUpgradeData(id);
    if (upgradeData && (!upgrades || upgrades.indexOf(upgradeData.type) != -1)) {
      return true;
    }
    return false;
  },

  registerUpgrade: function(id, type, func) {
    this.data[id] = { type: type, func: func };
  },

  callUpgrade: function(item, machine, container, data) {
    var upgrades = machine.upgrades;
    var upgrade = this.getUpgradeData(item.id);
    if (upgrade && (!upgrades || upgrades.indexOf(upgrade.type) != -1)) {
      upgrade.func(item, machine, container, data);
    }
  },

  getUpgrades: function(machine, container) {
    var upgrades = [];
    for (var slotName in container.slots) {
      if (slotName.match(/Upgrade/)) {
        var slot = container.getSlot(slotName);
        if (slot.id > 0) {
          var find = false;
          for (var i in upgrades) {
            var item = upgrades[i];
            if (item.id == slot.id && item.data == slot.data) {
              item.count += slot.count;
              find = true;
              break;
            }
          }
          if (!find) {
            item = { id: slot.id, count: slot.count, data: slot.data };
            upgrades.push(item);
          }
        }
      }
    }
    return upgrades;
  },

  executeUpgrades: function(machine) {
    var container = machine.container;
    var data = machine.data;
    var upgrades = this.getUpgrades(machine, container);
    for (var i in upgrades) {
      this.callUpgrade(upgrades[i], machine, container, data);
    }
    StorageInterface.checkHoppers(machine);
  },
}