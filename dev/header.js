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