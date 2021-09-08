MachineRegistry.MachineUI = function (obj) {
    let ui = UI.TabbedWindow({
        location: obj.location || {
            x: 0,
            y: 0
        }
    });


    let tabIndex = 7;

    ui.setTab(6, {
        icon: {
            type: "image",
            x: -30,
            y: -30,
            width: 60,
            height: 60,
            bitmap: obj.tabIcon || "icons.nope"
        }
    }, obj);

    if (!obj.redstoneDisabled) {
        ui.setTab(tabIndex, {
            icon: {
                type: "image",
                x: -30,
                y: -30,
                width: 60,
                height: 60,
                bitmap: "icons.redstone"
            }
        }, {});
    }

    if (!obj.inventoryDisabled) {
        let inventory = new UI.Window({
            location: {
                x: 120,
                y: 35,
                width: 250,
                height: UI.getScreenHeight() - 70,
                scrollY: 562
            },

            drawing: [],
            elements: {}
        });
        inventory.setDynamic(false);
        inventory.setInventoryNeeded(true);

        let x = 0;
        let y = 0;
        let slotSize = 250;

        for (let i = 0; i < 36; i++) {
            inventory.getContent().elements["__invSlot" + i] = {
                type: "invSlot",
                x: x,
                y: y,
                size: 251,
                index: i + 9
            };

            x += slotSize;
            if (x >= slotSize * 4) {
                x = 0;
                y += slotSize;
            }
        }

        ui.setTabEventListener(6, {
            onOpen: function () {
                MachineRegistry.invContainer.openAs(inventory);
            },

            onClose: function () {
                MachineRegistry.invContainer.close();
            }
        });
    }

    return ui;
};