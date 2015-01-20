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
				console.log(1000.0/data.velocity[0]);
				console.log(1000.0/data.velocity[1]);
				var velModX = data.velocity[0] >= 0 ? 1 : -1;
				var velModY = data.velocity[1] >= 0 ? 1 : -1;
				var velocityFactor = 100;

				!function handleX(){
					var destination = velModX === 1 ? window.innerWidth - 100 : 0;
					var relativeTime = Math.abs(destination - transX.get()) / window.innerWidth;
					transX.set(destination, { duration: Math.abs(100.0/data.velocity[0]*relativeTime), curve: function(x){return x;}}, handleX);
					velModX = -velModX;					
				}();

				!function handleY(){
					var destination = velModY === 1 ? window.innerHeight - 100 : 0;	
					var relativeTime = Math.abs(destination - transY.get()) / window.innerHeight;									 
					transY.set(destination, { duration: Math.abs(100.0/data.velocity[1]*relativeTime), curve: function(x){return x;}}, handleY);
					velModY = -velModY;					
				}();				
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