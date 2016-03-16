var GameObject = require('../GameObject');
var Tags = require('../Statics/Tags');

var GM = require('../GameMaster');

// Class Joint : GameObject
var Joint = function(x, y) {
    this.jid = GM.assignJointID();

    GameObject.call(this, "_J" + this.jid, Tags.joint, x, y);
    // var
    var that = this;
    this.nbs = [];
    this.dest = null;

    this.distances = [];
    GM.slots.forEach(function(slot) {
        that.distances.push(slot.transform.DistanceTo(that.transform));
    });
}
Joint.prototype = new GameObject();
// functions
Joint.prototype.AttachTo = function(joint) {
    this.nbs.push(joint);
    joint.nbs.push(this);

    if (joint.dest == null) {
        joint.dest = this;
    }
}
Joint.prototype.Next = function() {
    return this.dest;
}

Joint.prototype.findPath = function(from, to) {
    var list = new Array();
    for(var i = 0; i < this.nbs.length; i++) {
        if (this.nbs[i].visited)
            continue;
        
        if (this.nbs[i] == to)
        {
            console.log([this, to]);
            return [this, to];
        }
        else if (this.nbs[i] == from)
            continue;
        else
            list.push(this.nbs[i]);
    }
    for(var i = 0; i < list.length; i++) {
        var path = list[i].findPath(this, to);
        list[i].visited = true;
        if(path != null) {
            path.unshift(this);
            return path;
        }
    }
    return null;
};

Joint.prototype.GetNearesTower = function(range) {
    var tower = null;
    var d = 9999;
    for(var i = 0; i < this.distances.length; i++) {
        if(GM.slots[i].tower != null) {
            if(this.distances[i] <= range && this.distances[i] < d) {
                tower = GM.slots[i].tower;
                d = this.distances[i];
            }
        }
    }
    return tower;
}
Joint.prototype.GetDistances = function() {
    return this.distances;
}
Joint.prototype.SteppedBy = function(unit) {
    //Notice all the towers
    for(var i = 0; i < this.distances.length; i++) {
        if (GM.slots[i].tower != null) {
            if (this.distances[i] <= GM.slots[i].tower.range) {
                GM.slots[i].tower.Sight(unit);
                
                //DEBUG
                console.log("Tower: " + GM.slots[i].tower.name + " sight " + unit.name);
                //DEBUG
            }
        }
    }
}

function findPathTo(j, at) {
    var path = new Array();
    
    GM.joints.forEach(function(joint) {
        joint.visited = false;
    })
    
    if(at == j) return j;
    var list = new Array();
    for(var i = 0; i < at.nbs.length; i++) {
        if(at.nbs[i] != j)
            list.push(at.nbs[i]);
        else
            return [j];
    }
    for(var i = 0; i< list.length; i++) {
        var p = list[i].findPath(at, j);
        list[i].visited = true;
        if(p != null)
            path = p;
    }
    return path;
}

function findNearest(at, maxDistance) {
    var d = maxDistance;
    var j = null;
    
    GM.joints.forEach(function(joint) {
        var nd = at.DistanceTo(joint.transform);
        if (nd < d) {
            j = joint;
            d = nd;
        }
    })

    return j;
}

module.exports = Joint;