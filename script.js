var PENTAGON_SIZE = 0.025;
var MOVE_DELAY = 1000;
var PENTAGON_IMAGE_SIZE = 100;

var LOWER_ALPHA_THRESHOLD = 0.01;
var UPPER_ALPHA_THRESHOLD = 0.8;

function Pentagon(x, y, alpha) {
  this.x = x;
  this.y = y;
  this.alpha = alpha;
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
  for (var i = pentagons.length-1; i >= 0; --i) {
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
    element.style.opacity = pentagons[i].alpha.toFixed(5);
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
  var distance = Math.pow(Math.sin(Math.max(elapsed - MOVE_DELAY, 0) / 2000), 2)*Math.sqrt(2);
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
  context.fillStyle = 'white';
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

function pentagonsForCanvas(canvas, context) {
  var size = canvas.width;
  var imageData = context.getImageData(0, 0, size, size);
  var sampleSize = PENTAGON_SIZE * size;
  var pentagons = [];
  for (var i = 0; i < 1; i += PENTAGON_SIZE) {
    var x = Math.floor(size * i);
    for (var j = 0; j < 1; j += PENTAGON_SIZE) {
      var y = Math.floor(size * j);
      var avg = averageAlpha(imageData, x, y, Math.floor(sampleSize));
      if (avg < LOWER_ALPHA_THRESHOLD) {
        continue;
      } else if (avg > UPPER_ALPHA_THRESHOLD) {
        avg = UPPER_ALPHA_THRESHOLD;
      }
      var scaledX = 2*(x+sampleSize/2)/size - 1;
      var scaledY = 2*(y+sampleSize/2)/size - 1;
      pentagons.push(new Pentagon(scaledX, scaledY, avg));
    }
  }
  return pentagons;
}

function averageAlpha(imageData, startX, startY, size) {
  var sum = 0;
  for (var x = startX; x < startX + size; ++x) {
    for (var y = startY; y < startY + size; ++y) {
      var index = 4 * (x+y*imageData.width);
      sum += imageData.data[index + 3] / 255;
    }
  }
  return sum / (size * size);
}

window.addEventListener('load', function() {
  var canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;

  var context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.font = '140px sans-serif';
  context.fillText('Hi', 35, 150);

  new ScreenLayout(pentagonsForCanvas(canvas, context)).tick();
});
