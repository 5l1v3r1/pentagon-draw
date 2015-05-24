var PENTAGON_SIZE = 0.05;
var MOVE_DELAY = 1000;
var PENTAGON_IMAGE_SIZE = 100;

function Pentagon(x, y) {
  this.x = x;
  this.y = y;
  this.distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

Pentagon.prototype.position = function(distance) {
  if (distance >= this.distance) {
    return [this.x, this.y];
  } else {
    var pct = distance / this.distance;
    return [this.x * pct, this.y * pct];
  }
};

function ScreenLayout(pentagons) {
  this.screenSize = Math.min(window.innerWidth, window.innerHeight);
  this.pentagons = pentagons;
  this.elements = [];
  this.startTime = new Date().getTime();
  var pentagonSize = Math.round(PENTAGON_SIZE * this.screenSize);
  var pentagonImage = pentagonImageURL();
  for (var i = pentagons.length; i > 0; --i) {
    var element = document.createElement('img');
    element.src = pentagonImageURL();
    element.width = pentagonSize;
    element.height = pentagonSize;
    element.style.position = 'fixed';
    element.style.left = Math.round(window.innerWidth/2 - pentagonSize/2) +
      'px';
    element.style.top = Math.round(window.innerHeight/2 - pentagonSize/2) +
      'px';
    element.style.webkitTransform = 'translate3d(0, 0, 0) rotate(0deg)';
    document.body.appendChild(element);
    this.elements.push(element);
  }
}

ScreenLayout.prototype.requestAnimationFrame = function() {
  if ('function' === typeof window.requestAnimationFrame) {
    window.requestAnimationFrame(this.tick.bind(this));
  } else {
    setTimeout(this.tick.bind(this), 1000/60);
  }
};

ScreenLayout.prototype.tick = function() {
  var elapsed = new Date().getTime() - this.startTime;
  var distance = Math.pow(Math.sin(Math.max(elapsed - MOVE_DELAY, 0) / 2000), 2)*1.25;
  var angle = (elapsed / 2) % 360;
  for (var i = 0, len = this.elements.length; i < len; ++i) {
    var pentagon = this.pentagons[i];
    var element = this.elements[i];
    var position = pentagon.position(distance);
    var transform = 'translate3d(' +
      (position[0]*this.screenSize/2).toFixed(5) + 'px, ' +
      (position[1]*this.screenSize/2).toFixed(5) + 'px, 0px) rotate(' +
      angle.toFixed(5) + 'deg)';
    element.style.transform = transform;
    element.style.webkitTransform = transform;
  }
  this.requestAnimationFrame();
};

function pentagonImageURL() {
  var canvas = document.createElement('canvas');
  canvas.width = PENTAGON_IMAGE_SIZE;
  canvas.height = PENTAGON_IMAGE_SIZE;
  
  var context = canvas.getContext('2d');
  context.fillStyle = 'rgba(255, 255, 255, 0.5)';
  context.beginPath();
  for (var angle = 0; angle < 360; angle += 360/5) {
    var x = Math.cos(angle * Math.PI / 180)*PENTAGON_IMAGE_SIZE/2 +
      PENTAGON_IMAGE_SIZE/2;
    var y = Math.sin(angle * Math.PI / 180)*PENTAGON_IMAGE_SIZE/2 +
      PENTAGON_IMAGE_SIZE/2;
    if (angle === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.closePath();
  context.fill();
  
  return canvas.toDataURL('image/png');
}

window.addEventListener('load', function() {
  var pentagons = [];
  for (var x = -0.9; x <= 0.9; x += 0.3) {
    for (var y = -0.9; y <= 0.9; y += 0.3) {
      pentagons.push(new Pentagon(x, y));
    }
  }
  new ScreenLayout(pentagons).tick();
});
