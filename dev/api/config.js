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

 
 