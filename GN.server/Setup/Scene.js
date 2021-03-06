var Slot = require('../RoadSystem/Slot');
var Joint = require('../RoadSystem/Joint');
var RoadSign = require('../RoadSystem/RoadSign');
var Blocker = require('../Blocker');

var Scene = function(GM) {
    this.GM = GM;
}

Scene.prototype.LoadMap = function(MapID, end) {
    var map = new Object();
    
    var that = this;
    
    // Load the joints from the map data stored in file
    var fs = require('fs');
    fs.readFile('./GN.server/data/map/' + MapID, 'utf8', function(err, data) {
        if(err) {
            console.log('Unable to read map ' + MapID);
            if(end) {
                return end(true, err);
            } else { return false; }
        }
        map = JSON.parse(data);
        
        // Send the map to client
        if(map != undefined)
            that.GM.GEM.emit('map-data', map);
        
        // Slot
        // Load the slots into GameMaster
        if(map.slots != undefined) {
            // Travesal of all slots data
            map.slots.forEach(function(s) {
                // Push new slot
                that.GM.slots.push(new Slot(that.GM.assignSlotID(), s.x, s.y, that.GM));
            });
        }
        
        // Blocker Slot
        if(map.blockers != undefined) {
            // Travesal of all blockers data
            map.blockers.forEach(function(b) {
                // Create slot for the blocker
                var newSlot = new Slot(that.GM.assignSlotID(), b.x, b.y, that.GM);
                b.useSlot = newSlot.sid;
                that.GM.slots.push(newSlot);
            });
        }
        
        // Joint
        // Load the joints into GameMaster
        if(map.joints != undefined) {
            // Travesal of all joints data
            map.joints.forEach(function(j) {
                // Push new joint
                that.GM.joints.push(new Joint(that.GM.assignJointID(), j.x, j.y, that.GM));
                // Connect to the attach joint
                for(var i = 0; i < j.attach.length; i++) {
                    that.GM.joints[j.id].AttachTo(that.GM.joints[j.attach[i]]);
                }
            });
        }
        
        // Build blocker
        // Load the blockers into GameMaster
        if(map.blockers != undefined) {
            // Travesal of all blockers data
            map.blockers.forEach(function(b) {
                // Get the location from the bound joint
                var j = that.GM.joints[b.bindJoint].dest.dest;
                // Create new blocker
                var newBlocker = new Blocker("Blocker-" + b.id, that.GM.assignBlockerID(), j.transform.x, j.transform.y, that.GM.joints[b.bindJoint], that.GM.slots[b.useSlot], that.GM);
                // Build blocker on slot;
                that.GM.slots[b.useSlot].BuildTower(newBlocker);
                that.GM.blockers.push(newBlocker);
            });
        }
        
        // RoadSign
        // Load the roadSigns into GameMaster
        if(map.roadSigns != undefined) {
            // Travesal of all joints data
            map.roadSigns.forEach(function(r) {
                // Exclude the coming joint
                var exclJoints = new Array();
                if(r.froms.length > 0) {
                    for(var i = 0; i < r.froms.length; i++) {
                        exclJoints.push(that.GM.joints[r.froms[i]]);
                    }
                }
                // Push new joint
                that.GM.roadSigns.push(new RoadSign(that.GM.assignSignID(), r.x, r.y, that.GM.joints[r.bindJoint], exclJoints, that.GM));
            });
        }
        
        if(map.entryJoint != undefined) {
            that.GM.entryJoint = that.GM.joints[map.entryJoint.id];
        } else {
            console.log("The entry joint of map is not defined.");
            if(that.GM.joints[0] != null) {
                that.GM.entryJoint = that.GM.joints[0];
                console.log("Use the first joint instead.");
            } else {
                console.log("The map is invalid.");
            }
        }
        
        if(map.goals != undefined) {
            that.GM.life = 0;
            map.goals.forEach(function(g) {
               // Push the new goal
               that.GM.goals.push({id: g.id, jid: g.bindJoint, life: g.life});
               // Add life point
               that.GM.life += g.life;
            });
            that.GM.maxlife = that.GM.life;
        } else {
            console.log("The goal of map is not defined.");
            if(that.GM.joints[that.GM.joints.length - 1] != null) {
                that.GM.goals.push(that.GM.joints[that.GM.joints.length - 1]);
                console.log("Use the last joint instead.");
            } else {
                console.log("The map is invalid.");
            }
        }
        
        if(end)
            return end(false, null);
    });
}

module.exports = Scene;