
//cdnjs.cloudflare.com/ajax/libs/react/0.14.7/react.min.js
//cdnjs.cloudflare.com/ajax/libs/react/0.14.7/react-dom.min.js
// + babel

// FCC: Build a Roguelike Dungeon Crawler Game
// User Story: I have health, a level, and a weapon. I can pick up a better weapon. I can pick up health items.
// User Story: All the items and enemies on the map are arranged at random.
// User Story: I can move throughout a map, discovering items.
// User Story: I can move anywhere within the map's boundaries, but I can't move through an enemy until I've beaten it.
// User Story: Much of the map is hidden. When I take a step, all spaces that are within a certain number of spaces from me are revealed.
// User Story: When I beat an enemy, the enemy goes away and I get XP, which eventually increases my level.
// User Story: When I fight an enemy, we take turns damaging each other until one of us loses. I do damage based off of my level and my weapon. The enemy does damage based off of its level. Damage is somewhat random within a range.
// User Story: When I find and beat the boss, I win.
// User Story: The game should be challenging, but theoretically winnable.


// Roguelike Random Map Generator
var RogueMap = (function() {
  var _xDimension = 100,
      _yDimension = 20,
      _maxRooms = 12,
      _mapArray = [],
      _rooms = [];
  
  var setDimensions = function(x, y) {
    _xDimension = x;
    _yDimension = y;
  };
  
  var getDimensions = function() {
    return {
      x: _xDimension,
      y: _yDimension
    };
  };
  
  var _initMapArray = function() {
    _mapArray = [];
    for (let i = 0; i < _yDimension; i++) {
      _mapArray[i] = [];
      for (let j = 0; j < _xDimension; j++) {
        _mapArray[i][j] = '#';
      }
    }
  };
  
  var _addRooms = function() {
    var roomCounter = 0,
        roomPlaceable,
        roomSizeX,
        roomSizeY,
        roomLocationX,
        roomLocationY;
    
        _rooms = []; // array of room objects?
    
    while(roomCounter < _maxRooms) {
      roomPlaceable = true;
      
      roomSizeX = Math.floor(Math.random() * 9 * 2 + 3); // x dimensions between 3 and 11
      roomSizeY = Math.floor(Math.random() * 9 + 3); // y dimensions between 3 and 11
      
      
      // +1 for keeping border on left and top
      roomLocationX = Math.floor(Math.random() * _xDimension + 1); // x location between 0 and _xDimension
      roomLocationY = Math.floor(Math.random() * _yDimension + 1); // y location between 0 and _yDimension
      
      
      // check if the generated room location + size is out of bounds; +1 is for keeping at least one layer on the outside
      if (roomLocationX + roomSizeX + 1 > _xDimension ||
          roomLocationY + roomSizeY + 1 > _yDimension)
        continue;
      
      
      // labels for breaking out of a higher order loop
      // the -1/+1 is for checking the bounds too so that no rooms are side by side.
      loop1:
      for (let i = roomLocationY - 1; i < roomLocationY + roomSizeY + 1; i++) {
        loop2:
        for (let j = roomLocationX - 1; j < roomLocationX + roomSizeX + 1; j++) {
          if (_mapArray[i][j] === '.') {
            roomPlaceable = false;
            break loop1;
          }   
        }
      }
      
      if (roomPlaceable) {
        for (let i = roomLocationY; i < roomLocationY + roomSizeY; i++) {
          for (let j = roomLocationX; j < roomLocationX + roomSizeX; j++) {
            _mapArray[i][j] = '.';
          }
        }
        roomCounter++;
        _rooms.push({
          roomNumber: roomCounter, // 1 to max rooms
          X: roomLocationX,
          Y: roomLocationY,
          sizeX: roomSizeX,
          sizeY: roomSizeY,
        //  connectionTo: null
        });
      }
    }
  };
  
  var _connectRooms = function() {
    var connectFromX, connectFromY, connectToX, connectToY;
    // connection arrows; connect all rooms to 
    // for each room find closest room and arrow to that room
    
    _rooms.sort(function(a, b) {
      return (a.X > b.X) ? 1 : ((b.X > a.X) ? -1 : 0);
    });
    
    _rooms.forEach(function(room, index, rooms) {
      // find the closest room:
      // check difference in x between current room and all unarrowed rooms...
      // if it is completely to the right, then arrow right
      if (index < rooms.length - 1) {
        if (room.X + room.sizeX <= rooms[index+1].X) {
          connectFromY = room.Y + Math.floor(Math.random() * room.sizeY);
          connectFromX = room.X + room.sizeX;

          connectToY = rooms[index+1].Y + Math.floor(Math.random() * rooms[index+1].sizeY);
          connectToX = rooms[index+1].X;

          // if the line can be drawn straight, draw the straight line
          if (connectToY > room.Y && connectToY < room.Y + room.sizeY) {
            for (let x = connectFromX; x < connectToX; x++) {
              _mapArray[connectToY][x] = '.';
            }
          }
          // else if line cannot be drawn straight, include one kink
          else {
            
            connectToX = rooms[index+1].X + Math.floor(Math.random() * rooms[index+1].sizeX);
            
            for (let x = connectFromX; x < connectToX + 1; x++) {
              _mapArray[connectFromY][x] = '.';
            }
            for (let y = 0; y < Math.abs(connectToY - connectFromY); y++) {
              if (connectToY > connectFromY) {
                _mapArray[y + connectFromY][connectToX] = '.';
              }
              else _mapArray[y + connectToY][connectToX] = '.';
            }
          }
        }

        // otherwise arrow up or down to reach said box.
        else {
          // find x connection point and draw vertical line
          
          connectFromY = room.Y + Math.floor(Math.random() * room.sizeY);
          connectToY = rooms[index+1].Y + Math.floor(Math.random() * rooms[index+1].sizeY);
          
          do {
            connectFromX = room.X + Math.floor(Math.random() * room.sizeX);
            connectToX = rooms[index+1].X + Math.floor(Math.random() * rooms[index+1].sizeX);
          } while (connectFromX !== connectToX);
          
          if (connectFromY > connectToY) {
            for (let y = connectToY; y < connectFromY; y++) {
              _mapArray[y][connectFromX] = '.';
            }
          }
          else {
             for (let y = connectFromY; y < connectToY; y++) {
              _mapArray[y][connectFromX] = '.';
            }
          }    
        }
      }    
    });
  };

  return {
    generateMap: function() {
      _initMapArray();
      _addRooms();
      _connectRooms();
      
      return _mapArray;
    },
    
    getDimensions: getDimensions()
  }
  
})();


var rogueMap = RogueMap.generateMap();

var Map = React.createClass({
  
  getInitialState: function() {
    return {
      pLocation: this.getUsableLocation('@'),
      e1Location: this.getUsableLocation('e'),
      e2Location: this.getUsableLocation('e'),
      e3Location: this.getUsableLocation('e'), 
      e4Location: this.getUsableLocation('e'),
      hp1Location: this.getUsableLocation('p'),
      hp2Location: this.getUsableLocation('p'),
      wLocation: this.getUsableLocation('w'),
      doorLocation: this.getUsableLocation('>')
    }
  },
  
  resetState: function() {
    rogueMap = RogueMap.generateMap();
    this.setState({  
      pLocation: this.getUsableLocation('@'),
      e1Location: this.getUsableLocation('e'),
      e2Location: this.getUsableLocation('e'),
      e3Location: this.getUsableLocation('e'), 
      e4Location: this.getUsableLocation('e'),
      hp1Location: this.getUsableLocation('p'),
      hp2Location: this.getUsableLocation('p'),
      wLocation: this.getUsableLocation('w'),
      doorLocation: this.getUsableLocation('>')
    });  
  },
  
  getUsableLocation: function(entity) {
    var x, y, usablePosition;
    
    do {
      usablePosition = true;
      // keep rolling position until it has all surrounding positions open      
      x = Math.floor(Math.random() * RogueMap.getDimensions.x);
      y = Math.floor(Math.random() * RogueMap.getDimensions.y);
      
   //   loop1:
      for (let i = -1; i < 2 && usablePosition; i++) {
        for (let j = -1; j < 2 && usablePosition; j++) { 
          // if it is out of bounds
          if (y + i > RogueMap.getDimensions.y ||
              x + j > RogueMap.getDimensions.x ||
              y + i < 0 ||
              x + j < 0) {
            usablePosition = false;
         //   break loop1;
          }
          
          // if position is not usable
          else if (rogueMap[y + i][x + j] !== '.') {
            usablePosition = false;
         //   break loop1;
          }
        }
      }
    } while (!usablePosition);
    
    if (this.props.dlevel === 4 && entity === '>') {
      rogueMap[y][x] = 'B';
    }
    else rogueMap[y][x] = entity;
    
    return {
      X: x,
      Y: y     
    };
  },
  
  processMovement: function(event) {
    var positionContent, positionX, positionY, enemyNumber;
    var moveable = false;
    
    switch (event) {
      case 'left': {
        positionContent = rogueMap[this.state.pLocation.Y][this.state.pLocation.X - 1]; 
        positionX = this.state.pLocation.X - 1;
        positionY = this.state.pLocation.Y;
      }
        break;
        
      case 'up': {
        positionContent = rogueMap[this.state.pLocation.Y - 1][this.state.pLocation.X]; 
        positionX = this.state.pLocation.X;
        positionY = this.state.pLocation.Y - 1;
      }
        break;
        
      case 'right': {
        positionContent = rogueMap[this.state.pLocation.Y][this.state.pLocation.X + 1]; 
        positionX = this.state.pLocation.X + 1;
        positionY = this.state.pLocation.Y;
      }
        break;
        
      case 'down': {
        positionContent = rogueMap[this.state.pLocation.Y + 1][this.state.pLocation.X]; 
        positionX = this.state.pLocation.X;
        positionY = this.state.pLocation.Y + 1;
      }
        break;
    }
 
    if (this.state.e1Location.X === positionX && this.state.e1Location.Y === positionY) {
      enemyNumber = 'e1';
    }
    else if (this.state.e2Location.X === positionX && this.state.e2Location.Y === positionY) {
      enemyNumber = 'e2';
    }
    else if (this.state.e3Location.X === positionX && this.state.e3Location.Y === positionY) {
      enemyNumber = 'e3';
    }
    else if (this.state.e4Location.X === positionX && this.state.e4Location.Y === positionY) {
      enemyNumber = 'e4';
    }
    
    
    switch (positionContent) {
      case '#': return false; break;
      case '.': return true; break;
      case 'p': { this.props.processInteraction('p'); return true; } break;
      case 'e': { return this.props.processInteraction('e', enemyNumber); } break;
      case 'w': { this.props.processInteraction('w'); return true; } break;
      case '>': { this.props.processInteraction('>'); this.resetState(); return; } break;
      case 'B': { return this.props.processInteraction('B'); } break;

    }
  },
  
  handlePress: function(event) {
    
    // keypress left
    if (event.keyCode === 37 && rogueMap[this.state.pLocation.Y][this.state.pLocation.X - 1] !== '#') {
      if(this.processMovement('left')) {
        rogueMap[this.state.pLocation.Y][this.state.pLocation.X] = '.';
        rogueMap[this.state.pLocation.Y][this.state.pLocation.X - 1] = '@';
        this.setState({ pLocation: { X: this.state.pLocation.X - 1, Y: this.state.pLocation.Y } });
      }
    }
    
    // keypress up
    else if (event.keyCode === 38 && rogueMap[this.state.pLocation.Y - 1][this.state.pLocation.X] !== '#') {
      if(this.processMovement('up')) {
        rogueMap[this.state.pLocation.Y][this.state.pLocation.X] = '.';
        rogueMap[this.state.pLocation.Y - 1][this.state.pLocation.X] = '@';
        this.setState({ pLocation: { X: this.state.pLocation.X, Y: this.state.pLocation.Y - 1 } });
      }
    }
    
    // keypress right
    else if (event.keyCode === 39 && rogueMap[this.state.pLocation.Y][this.state.pLocation.X + 1] !== '#') {
      if(this.processMovement('right')) {
        rogueMap[this.state.pLocation.Y][this.state.pLocation.X] = '.';
        rogueMap[this.state.pLocation.Y][this.state.pLocation.X + 1] = '@';
        this.setState({ pLocation: { X: this.state.pLocation.X + 1, Y: this.state.pLocation.Y } });
      }
    }
    
    // keypress down
    else if (event.keyCode === 40 && rogueMap[this.state.pLocation.Y + 1][this.state.pLocation.X] !== '#') {
      if(this.processMovement('down')) {
        rogueMap[this.state.pLocation.Y][this.state.pLocation.X] = '.';
        rogueMap[this.state.pLocation.Y + 1][this.state.pLocation.X] = '@';
        this.setState({ pLocation: { X: this.state.pLocation.X, Y: this.state.pLocation.Y + 1 } });
      }
    }
  },
  
  componentDidMount: function() {   
    document.addEventListener('keydown', this.handlePress);
  },
  
  render: function() {
    var self = this;
    return (
      <div onKeyPress={this.handlePress} className='map'>
        {
          rogueMap.map(function(y, yIndex) {
            return <div key={yIndex}>
              {
                y.map(function(x, xIndex) {
                 // if the p is within its area, then show color, otherwise color is black.
                 
                  if (Math.sqrt(Math.pow(self.state.pLocation.X - xIndex, 2) + Math.pow(self.state.pLocation.Y - yIndex, 2)) < 5) {
                    var pColor = { color: 'yellow' };
                    var groundColor = { color: '#606060' };
                    var tileColor = { color: '#333' };
                    var enemyColor = { color: 'red' };
                    var potionColor = { color: 'green' };
                    var weaponColor = { color: 'silver' };
                    var doorColor = { color: 'blue' };
                    var bossColor = { color: 'maroon' };


                    switch(x) {
                      case '@': return (<span style={pColor}>@</span>); break;
                      case '.': return (<span style={groundColor}>.</span>); break;
                      case '#': return (<span style={tileColor}>#</span>); break;
                      case 'e': return (<span style={enemyColor}>e</span>); break;
                      case 'p': return (<span style={potionColor}>p</span>); break;
                      case 'w': return (<span style={weaponColor}>w</span>); break;
                      case '>': return (<span style={doorColor}>></span>); break;
                      case 'B': return (<span style={bossColor}>B</span>); break;
                    }
                  }
                  else return <span key={xIndex}>{x}</span>;              
                })
              }  
            </div>;
          })
        }
      </div>
    );
  }
});

var Rogue = React.createClass({
  
  getInitialState: function() {
    return {
      level: 1,
      health: 25,
      totalHP: 25,
      weapon: 'bare fists',
      weapons: ['bare fists', 'brass knuckles', 'nunchucks', 'large trout', 'excalibur'],
      exp: 0,
      expNeeded: 100,
      damage: 4,
      dlevel: 1,
      
      e1HP: 25,
      e2HP: 25,
      e3HP: 25,
      e4HP: 25,
      BHP: 1000,
    }
  },
  
  processInteraction: function(entity, enemy) {
    switch (entity) {
      case 'p': {
        if (this.state.health/this.state.totalHP > 0.5)
          this.setState({ health: this.state.totalHP });
        else this.setState({ health: Math.floor(this.state.health + this.state.totalHP * 0.5) });
      };
      break;
        
      case 'w': { 
        this.setState({ weapon: this.state.weapons[this.state.weapons.indexOf(this.state.weapon) + 1],
                        damage: 5 * (this.state.weapons.indexOf(this.state.weapon) + 2) * this.state.level });
      };
      break;
        
      case 'e': {
        // check which enemy it is:
        switch (enemy) {
          case 'e1': this.setState({ e1HP: this.state.e1HP - (Math.floor(Math.random() * this.state.damage) + Math.floor(Math.random() * this.state.damage)) }); break;
          case 'e2': this.setState({ e2HP: this.state.e2HP - (Math.floor(Math.random() * this.state.damage) + Math.floor(Math.random() * this.state.damage)) }); break;
          case 'e3': this.setState({ e3HP: this.state.e3HP - (Math.floor(Math.random() * this.state.damage) + Math.floor(Math.random() * this.state.damage)) }); break;
          case 'e4': this.setState({ e4HP: this.state.e4HP - (Math.floor(Math.random() * this.state.damage) + Math.floor(Math.random() * this.state.damage)) }); break;
        }

        this.setState({ health: this.state.health - Math.floor(Math.random() * 3 * this.state.dlevel) });
        
        if (this.state.health <= 0) {
          this.props.displayOutcome('loss');
        }
        
        switch (enemy) {
          case 'e1': if (this.state.e1HP <= 0) { 
            this.handleExpGain();            
            return true;
          }; 
          break;
            
          case 'e2': if (this.state.e2HP <= 0) {
            this.handleExpGain();
            return true;
          } 
          break;
            
          case 'e3': if (this.state.e3HP <= 0) {
            this.handleExpGain();
            return true;
          }
          break;
            
          case 'e4': if (this.state.e4HP <= 0) {
            this.handleExpGain();
            return true;
          }
          break;
        }
      };
      break;
      
      case 'B': {
        this.setState({ BHP: this.state.BHP - (Math.floor(Math.random() * this.state.damage) + Math.floor(Math.random() * this.state.damage)) });
        this.setState({ health: this.state.health - Math.floor(Math.random() * 10) });
        
        if (this.state.health <= 0) {
          this.props.displayOutcome('loss');
        }
        
        if (this.state.BHP <= 0) {
          this.handleExpGain();
          this.props.displayOutcome('win');
          return true;
        }
        
      }
      break;
      
      case '>': {
        
        if (this.state.dlevel < 5) {  
          this.setState({ dlevel: this.state.dlevel + 1,
                          e1HP: this.state.e1HP * 2,
                          e2HP: this.state.e2HP * 2,
                          e3HP: this.state.e3HP * 2,
                          e4HP: this.state.e4HP * 2 });
        }     
      }
      break;
    }
  },
  
  handleExpGain: function() {
    if (this.state.exp + 50 * this.state.dlevel >= this.state.expNeeded) {
      this.setState({ level: this.state.level + 1,
                      exp: this.state.exp + 50 * this.state.dlevel - this.state.expNeeded,
                      expNeeded: this.state.expNeeded + 100,
                      totalHP: this.state.totalHP + 10,
                      health: this.state.totalHP,
                      damage: 5 * (this.state.weapons.indexOf(this.state.weapon) + 1) * (this.state.level + 1) });

    }
    else this.setState({ exp: this.state.exp + 50 * this.state.dlevel });
  },
  
  render: function() {
    return (
      <div className='rogue'>
        <div className='info-panel'>
          <div className='title'>
            <div className='title--text'><span className='title--text1'>t</span><span className='title--text2'>rogue</span></div>
          </div>
          <div className='stats'>
            <div className='stats--title'>Player Stats</div>
            <div><span className='stats--attr'>Level</span>: {this.state.level}</div>
            <div><span className='stats--attr'>HP</span>: {this.state.health}/{this.state.totalHP}</div>
            <div><span className='stats--attr'>Weapon</span>: {this.state.weapon}</div>
            <div><span className='stats--attr'>Damage</span>: {this.state.damage}-{this.state.damage * 2}</div>
            <div><span className='stats--attr'>Exp</span>: {this.state.exp}/{this.state.expNeeded}</div>
          </div>
          <div className='legend'>
            <div className='legend--title'>Legend</div>
            <div><span className='legend--player'>@</span>: player</div>
            <div><span className='legend--enemy'>e</span>: enemy</div>
            <div><span className='legend--boss'>B</span>: boss (level 4)</div>
            <div><span className='legend--weapon'>w</span>: weapon upgrade</div>
            <div><span className='legend--potion'>p</span>: potion</div>
            <div><span className='legend--staircase'>></span>: staircase</div>
          </div>
          <div className='dungeon'>
            <div className='dungeon--title'>Dungeon</div>
            <div className='dungeon--level'><span className='dungeon--attr'>Level</span>: {this.state.dlevel}</div>
          </div>
        </div>
        <Map processInteraction={this.processInteraction} dlevel={this.state.dlevel} />
      </div>
    );
  }
});

var Game = React.createClass({
  getInitialState: function() {
    return {
      win: '',
      loss: ''
    }
  },
  
  handleOutcome: function(outcome) {
    if (outcome === 'loss')
      this.setState({ loss: 'You lose!' });
    else if (outcome === 'win')
      this.setState({ win: 'You win!' });
  },
  
  render: function() {
    return (
      <div className='game'>
        <div className='outcome outcome--win'>{this.state.win}</div>
        <div className='outcome outcome--loss'>{this.state.loss}</div>
        <Rogue displayOutcome={this.handleOutcome} />
      </div>
    );
  }
});

ReactDOM.render(<Game />, document.getElementById('app'));
