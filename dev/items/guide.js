IDRegistry.genItemID("manual");
Item.createItem("manual", "Industrial Foregoing's Manual", {name: "book_manual", meta: 0}, {stack: 1});


GuideAPI.registerGuide("manual", { 
item: ItemID.manual, 
debug: false, 
textures: { 
background: "book_back", 
nextLink: "next_page", 
preLink: "pre_page", 
close: "cancel", 
}, 




pages: {
      "first": {
                preLink: "first",
                nextLink: "first",
                left: {
                    controller: PageControllers.BASIC_PAGE,         
                    elements: [
                    
                        {text: "Industrial Foregoing's Manual", size: 30},
                        {text: "Industrial Foregoing Pe- Beta Version", size: 18},
                        {text: "", size: 30},
                        {text: "The mod has a large tech tree with many various machines," , size: 18},
                        {text:  "utilities, tools and components, used for generating,", size: 18},
                        {text:  "energy, farming, storage, and many other things.", size: 18},
                    ]
                },
                
                right: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                    {text: "================", size: 23},
                    {text: "Getting Start", size: 27, link: "gs"},     
                    {text: "================", size: 23},
                    {text: "Generators", size: 27, link: "gen"},  
                    {text: "================", size: 23},
                    {text: "Comming Soon", size: 27},    
                    {text: "================", size: 23},
                    ]
                }
            },
  
        "gs": {
                preLink: "first",    	
                nextLink: "gs",
                left: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                    {text: "Industrial Foregoing's Manual", size: 30},
                    {text: "Getting Started", size: 20},
                    
                    ]
                },
                
                right: {
                    controller: PageControllers.BASIC_PAGE,
                    elements: [
                        {text: "================", size: 23},
                        {text: "Tree Fluid Extractor", size: 25, link: "tfe"},
                        {text: "================", size: 23},
                        {text: "Latex Processing Unit", size: 25, link: "lpu"},
                        ]
                }
            },
       "tfe": {
            	preLink: "gs",    	
                nextLink: "lpu",
                left: {
                    controller: PageControllers.ITEM_PAGE,
                    items: [
                        {id: BlockID.tree_extrac}
                    ],
                    elements: [
                    {text: "Tree Fluid Extractor", size: 24},
                    {text: "To get started you need to place a Tree Fluid Extractor in front of a log to collect Latex and pump into Latex Processing Unit with some water to get Tiny Rubber", size: 18}, 
                    ]
                },
                
                right: {
                    controller: PageControllers.GRID_3x3_PAGE,
                    title: "This is pattern recipe for it",
                    recipes: [
                    {
                    grid: [
                    ["a", "#", "a"],
                    ["a", "z", "a"],
                    ["a", "i", "a"]
                    ],
                    materials: {
                     "a": {id: 1, data: 0},
                     "#": {id: 331, data: 0},
                     "z": {id: 61, data: 0},
                     "i": {id: ItemID.gear_iron, data: 0},
 
                    },
                    result: {id: BlockID.tree_extrac, count: 1}
                    }
                    ],
                    elements: []
                 }
             },
          "lpu": {
            	preLink: "gs",    	
                nextLink: "gs",
                left: {
                    controller: PageControllers.ITEM_PAGE,
                    items: [
                        {id: BlockID.latex_process}
                    ],
                    elements: [
                    {text: "Latex Processing Unit", size: 24},
                    {text: "§aWhen provided with §eEnergy, §bWater §aand §fLatex §awill produce tiny dry rubber.It will consume 75mb of latex and 1000mb of water to produce 1 tiny dry rubber.", size: 18}, 
                    {text: "§eNOTE: Machines accept RF, EU", size: 18},
                    ]
                },
                right: {
                    controller: PageControllers.GRID_3x3_PAGE,
                     title: "This is pattern recipe for it",
                     recipes: [
                     {
                     grid: [
                     ["a", "#", "a"],
                     ["a", "z", "a"],
                     ["a", "i", "a"]
                     ],
                     materials: {
                      "a": {id: 1, data: 0},
                      "#": {id: 331, data: 0},
                      "z": {id: BlockID.machineFrame, data: 0},
                      "i": {id: ItemID.gear_iron, data: 0},
 
                     },
                     result: {id: BlockID.latex_process, count: 1}
                     }
                     ],
                     elements: []
                     }
                 },
          "gen": {
               preLink: "gs",
               nextLink: "pfg",
               left: {
                 controller: PageControllers.ITEM_PAGE,
     
                 elements: [
                   { text: "Coming soon......", size: 24 },
                         ]
               },
     
               right: {
                 controller: PageControllers.BASIC_PAGE,
                 elements: [
                   {
                     text: "Comming Soon",
                     size: 27},
                   { text: "Petrified Fuel Generator", size: 25, link: "pfg" },
                         ]
               }
             },
      "pfg": {
            	preLink: "gen",    	
                nextLink: "gen",
                left: {
                    controller: PageControllers.ITEM_PAGE,
                    items: [
                        {id: BlockID.pf_generator}
                    ],
                    elements: [
                    {text: "Petrified Fuel Generator", size: 24},
                    {text: "§aWhen provided with any solid fuel will produce power. The RF/tick is decided from its burn time, the more burn time the fuel has the more RF/tick it will produce.", size: 18}, 
                    {text: "§eNOTE: All fuels burn the same time.", size: 18},
                    ]
                },
                
                right: {
                    controller: PageControllers.GRID_3x3_PAGE,
 title: "This is pattern recipe for it",
 recipes: [
 {
 grid: [
 ["a", "x", "a"],
 ["e", "#", "e"],
 ["a", "b", "a"]
 ],
 materials: {
  "a": {id: ItemID.plastic, data: 0},
  "#": {id: BlockID.machineFrame, data: 0},
  "x": {id: 254., data: 0},
  "e": {id: ItemID.gear_gold, data: 0},
  "b": {id: 61, data: 0},
 
 },
 result: {id: BlockID.pf_generator, count: 1}
 }
 ],
 elements: [
 ],
 }
}

   }
});