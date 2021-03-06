var GameObject = require('../GameObject');
var Tags = require('../Statics/Tags');

var GM = require('../GameMaster');

// Class RoadSign : GameObject
// variables
var RoadSign = function (id, x, y, joint, froms, GM) {
    this.rid = id

    GameObject.call(this, "_RS" + this.rid, Tags.roadsign, x, y, GM);
    // var
    this.joint = joint;
    this.dests = [];
    this.joint.nbs.forEach((j) => {
        this.dests.push(j);
    })
    
    for (var i = 0; i < froms.length; i++) {
        var index = this.joint.nbs.indexOf(froms[i]);
        if(index >= 0)
            this.dests.splice(this.joint.nbs.indexOf(froms[i]), 1);
    }

    this.currentDestIndex = 0;
    // this.rotations = rotations;

}
RoadSign.prototype = new GameObject();
// functions
RoadSign.prototype.Turn = function() {
    //DEBUGING
    if(this.GM.debug)
        console.log("RoadSign " + this.rid + " changed from " + this.dests[this.currentDestIndex].jid);
    //DEBUGING

    this.currentDestIndex = (this.currentDestIndex + 1) % this.dests.length;
    this.joint.dest = this.dests[this.currentDestIndex];

    //DEBUGING
    if(this.GM.debug)
        console.log("to " + this.dests[this.currentDestIndex].jid);
    //DEBUGING
    
    return {dx: this.joint.dest.transform.x - this.joint.transform.x, dy: this.joint.dest.transform.y - this.joint.transform.y};
}

module.exports = RoadSign;