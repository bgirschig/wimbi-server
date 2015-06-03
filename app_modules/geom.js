function posFromSensors(sensors){
  computedPositions = [];

  // find all suitable sensor pairs
  // a pair is two DIFFERENT sensors with a NON-NULL value
  for(var i=0; i<sensors.length; i++){             // loop 1...
    for(var j=i; j<sensors.length; j++){           // ... loop 2
      if(i!=j && sensors[i].lastComputed!=null && sensors[j].lastComputed!=null){        // filter suitable pairs

        var trilateratedPos = intersect(sensors[i], sensors[j]);
        if( trilateratedPos.error == null) computedPositions.push( trilateratedPos[0] ); // one point found
      
      }
    }
  }

  console.log("computedPositions: ",computedPositions);

  var tx=0, ty=0, s = computedPositions.length;
  for(var i=0;i<s;i++){
    tx+=computedPositions[i].x;
    ty+=computedPositions[i].y;
  }
  if(s==0) return null;
  return {x:tx/s, y:ty/s}
}

// trilateration function, adapted from:
// http://stackoverflow.com/questions/12219802/a-javascript-function-that-returns-the-x-y-points-of-intersection-between-two-ci
function intersect(s1, s2){ // sensor 1,2 ; distance 1,2
  var d1 = s1.lastComputed;
  var d2 = s2.lastComputed;

  var dx,dy,d,a,x2,y2,h,rx,ry;
  var pair = s1.id+"<->"+s2.id;


  // distance (decomposed, then linear)
  dx = s2.x-s1.x;
  dy = s2.y-s1.y;
  d = Math.sqrt(sq(dx)+sq(dy));

  // does this pair have solution(s) ?
  if(d > d1+d2) return {error:1, msg:"sensors too far appart or values too small", pair:pair};
  if(d < Math.abs(d1-d2)) return {error:2, msg:"sensor values are too different. They are 'concentric'", pair:pair};
  

  // point2(x2,y2) is the intersection between the line between the two possible solutions and the line between the two sensors
  a = (sq(d1) - sq(d2) + sq(d)) / (2.0 * d) ;
  x2 = s1.x + (dx*a/d);
  y2 = s1.y + (dy*a/d);

  // ?
  h = Math.sqrt( sq(d1) - sq(a) );
  rx = -dy*(h/d);
  ry = dx*(h/d);

  // return values
  return [
    {x: x2-rx, y: y2-ry, pair:pair},
    {x: x2+rx, y: y2+ry, pair:pair}
  ]
}

module.exports.posFromSensors = posFromSensors;