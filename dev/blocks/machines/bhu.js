const extraui = {
con: new UI.Container(),
win: new UI.Window({
  location: {
   x:0,
   y:0,
   width: 1,
   height: 1
  },
  elements: {slot: {type: "slot", x:0, y:0}},
  drawing: [{type: "background", color: 0}]
 })
};


function DropBlock(x, y, z, id, count, data, extra){
 if(!extra){
  World.drop(x, y+1, z, id, count, data);
  return;
 } else {
  let slot = extraui.con.getSlot("slot");
  slot.id = id;
  slot.data = data;
  slot.count = count;
  slot.extra = extra;
  extraui.con.dropSlot("slot", x, y+1, z);
 }
}

// 2,147,483,647
IDRegistry.genBlockID("black_hole_unit");
Block.createBlockWithRotation("black_hole_unit", [{name: "Black Hole Unit", texture: [[side.top, 0], [blackholes.top, 0], [blackholes.side, 0], [blackholes.side, 0], [blackholes.side, 0], [blackholes.side, 0]], inCreative: true}]);

const guiBHU = new UI.StandartWindow({
 standart: {
  header: {text: {text: "Black Hole Unit"}},
  inventory: {standart: true},
  background: {standart: true}
 },

 elements: {
  "slot": {type: "slot", x: 500, y: 135},
  "slotInput": {type: "slot", x: 500, y: 195},
  "slotOutput": {type: "slot", x: 560, y: 195},
  "name": {type: "text", x: 680, y: 100, text: "Null"},
  "count": {type: "text", x: 680, y: 120, text: "0"},
  "limit": {type: "text", x: 680, y: 140, text: ""}

});

TileEntity.registerPrototype(BlockID.black_hole_unit,{
 defaultValues: {
name: "Null", 
id: 0, 
count: 0, 
data: 0
},

 getGuiScreen: function(){
  return guiBHU;
 },

 tick: function(){
 	
  this.container.setText("name", this.data.name);
  this.container.setText("count", this.data.count+"");
  
  if(this.data.id && this.data.count === 0){
   this.setValue(0, 0);
   this.container.clearSlot("slot");
  }

  let output = this.container.getSlot("slotOutput");
  let input = this.container.getSlot("slotInput");
  let slot = this.container.getSlot("slot");
   if(input.id && (input.id === slot.id||slot.id === 0)){
    slot.id = input.id;
    slot.count = 0;
    this.data.count += input.count;
    slot.data = input.data;
    this.container.clearSlot("slotInput");
    this.setValue(slot.id, slot.data);
   }
   if (this.data.count >= 64){
   	    output.id = this.data.id;
           output.id = 64;
           this.data.count -= 64;
   } else if (this.data.count < 64){
   	    output.id = this.data.id;
           output.id = this.data.count;
           this.data.count -= this.data.count;
           this.data.name = "Null";
   }
      if (this.data.count >= 2147483647 && input.id === slot.id. && input.count >= 1){
      	this.container.setText("limit", "Black Hole Unit is full");
          
      	}
 },

 destroy: function(){
  this.container.clearSlot("slot");
  if(this.data.id === 0){
   World.drop(this.x, this.y, this.z, BlockID.black_hole_unit, 1, 0);
   return;
  }
  const itemextra = new ItemExtraData();
  itemextra.putInt("id", this.data.id);
  itemextra.putInt("data", this.data.data);
  itemextra.putInt("count", this.data.count);
  itemextra.setCustomName("black_hole_unit\n"+this.data.name+"\n"+"Count:"+this.data.count);
  DropBlock(this.x, this.y, this.z, BlockID.black_hole_unit, 1, 0, itemextra);
 },

 setValue: function(id, data){
   this.data.id = id;
   this.data.data = data;
   this.data.name = "Null";
 },

 created: function(){
  const extra = Player.getCarriedItem().extra;
   if(extra === null)return;
  this.data.id = parseInt(extra.getInt("id"));
  this.data.data = parseInt(extra.getInt("data"));
  this.data.count = parseInt(extra.getInt("count"));
  this.container.setSlot("slot", this.data.id, 1, this.data.data);
  this.data.name = Item.getName(this.data.id, this.data.data, "UTF-8");
 }
});