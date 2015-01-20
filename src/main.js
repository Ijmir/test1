/*global famous*/
// import dependencies
var Engine = famous.core.Engine;
var Modifier = famous.core.Modifier;
var Transform = famous.core.Transform;
var ImageSurface = famous.surfaces.ImageSurface;
var Surface = famous.core.Surface;
var Transitionable = famous.transitions.Transitionable;
var Timer = famous.utilities.Timer;

var MouseSync = famous.inputs.MouseSync;
var TouchSync = famous.inputs.TouchSync;
var GenericSync = famous.inputs.GenericSync;

GenericSync.register({
	mouse: MouseSync,
	touch: TouchSync
});



var tasks = {};

// create the main context
var mainContext = Engine.createContext();

// your app here
var appModifier = new Modifier();
var appSurface = new Surface({
	properties: {
		backgroundColor: 'grey'
	}
})

// events
appSurface.on('dblclick', function(data){
	var transX = new Transitionable(data.x - 50);
	var transY = new Transitionable(data.y - 50);
	
	var taskModifier = new Modifier({
		transform: function(){ 
			return Transform.translate(transX.get(), transY.get(), 0);
		} 
	});
	var taskSurface = new Surface({
		size: [100, 100],
		guid: getGuid(),
		properties: {
			backgroundColor: 'pink',
			boxShadow: '10px 10px 10px'
		}
	});
	
	tasks[taskSurface.guid] = {
		surface: taskSurface,
		modifier: taskModifier,
		transX: transX,
		transY: transY,
		sync: function(){
			var sync = new GenericSync(['mouse', 'touch'], {
				direction: GenericSync.DIRECTION_XY
			});
			var intervalId;
			sync.on('start', function(data) {
				console.log('start');
				if (intervalId) Timer.clear(intervalId);
			});			
			sync.on('update', function(data) {				
				var curX = transX.get() + data.delta[0];
				var curY = transY.get() + data.delta[1];
				curX >= 0 ?	transX.set(Math.min(curX, window.innerWidth - 100)) : transX.set(0) 
				curY >= 0 ? transY.set(Math.min(curY, window.innerHeight - 100)) : transY.set(0)
			});
			sync.on('end', function(data) {
				//console.log(data);
				var velModX = 1;
				var velModY = 1;
				var velocityFactor = 100;

				intervalId = Timer.setInterval(function() {	
				//taskModifier.setTransform(function() {			
					var curX = transX.get() + velModX * data.velocity[0] * velocityFactor;
					var curY = transY.get() + velModY * data.velocity[1] * velocityFactor;

					if (curX > window.innerWidth - 100) {
						velModX = -velModX;
						curX = transX.get() + velModX * data.velocity[0] * velocityFactor;
					} else if (curX < 0) {
						velModX = -velModX;
						curX = transX.get() + velModX * data.velocity[0] * velocityFactor;
					} 
					if (curY > window.innerHeight - 100) {
						velModY = -velModY;
						curY = transY.get() + velModY * data.velocity[1] * velocityFactor;
					} else if (curY < 0) {
						velModY = -velModY;
						curY = transY.get() + velModY * data.velocity[1] * velocityFactor;
					} 
					
					transX.set(curX);
					transY.set(curY);					
				}, 20);
			})
			return sync;
		}()
	}
	taskSurface.pipe(tasks[taskSurface.guid].sync);
	

	mainContext.add(taskModifier).add(taskSurface);	
});



mainContext.add(appModifier).add(appSurface);

var getGuid = function(){
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
}