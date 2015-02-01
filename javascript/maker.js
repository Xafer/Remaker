//Setting up the scenes
var scene = new THREE.Scene();
var overlayScene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

camera.rotation.order = "YXZ";//Changing rotation order for proper camera controls.

var renderer = new THREE.WebGLRenderer({"alpha" : true});
var overlayRenderer = new THREE.WebGLRenderer({"alpha" : true});

renderer.setSize( window.innerWidth, window.innerHeight );
overlayRenderer.setSize( window.innerWidth, window.innerHeight );

var bgColor = new THREE.Color(0x000000);

renderer.setClearColor(bgColor,0);//Setting render background to transparent
overlayRenderer.setClearColor(bgColor,0);

document.getElementById("display").appendChild( renderer.domElement );//Adding the model display
document.getElementById("display").appendChild( overlayRenderer.domElement );//Adding the overlayed display

//Classes

function Model() //Used model
{
    this["_author"] = "";//Author's name
    this["_name"] = "";//Unique identifier
    this["_description"] = "";//Item description. Can be whatever.
    this["parts"] = [];//Array containing parts
    this["lights"] = [];//Array containing lights
    this["systems"] = [];//Array containing particle systems
    this["sceneObject"] = new THREE.Group();//Object used to display the model on the scene. It groups the parts.
    
    //this.addPart = function(pos,scale,rot,color)
    
    //this.removePart = function(part)
    
    //this.movePart = function(part, axis, local, amount)
    
    scene.add(this["sceneObject"]);
}

//Variable instatiation

//Generation
var baseGeometry = new THREE.BoxGeometry(1,1,1);

//Main
var selection = new Array();

var model = new Model();

//Importation/exportations

function importModel(file)
{
    var importedModel;
    
    if(file[0] == '{')
    {
        importJSON(file);
    }
    
    function importJSON(json)
    {
        var loadedModel;//Json from which the model is loaded
        
        var sceneModel = new Model();//The currently empty imported model
        
        loadedModel = JSON.parse(json);
        
        //Loading parts
        
        var partLength = loadedModel.parts.length;
        
        for(var i = 0; i < partLength; i++)
        {
            var part = loadedModel.parts[i];//Attribute the current part to the variable
            
            var partPosition = new THREE.Vector3(part.position[0], // Assign the position attributes of the part into an object
                                                 part.position[1],
                                                 part.position[2]);
            
            var partScale = new THREE.Vector3(part.size[0], //Assign the scale attributes of the part into an object
                                              part.size[1],
                                              part.size[2]);
            
            var partRotation;//Instatiate the rotation variable, see below
            
            if(part.rotation.length == 3)//If the rotation is in euler
            {
                partRotation = new THREE.Euler(part.rotation[0], //Assign it in a Euler-format object
                                               part.rotation[1],
                                               part.rotation[2]);
            }
            else
            {
                partRotation = new THREE.Quaternion(part.rotation[0], //Assign it in a quaternion
                                                    part.rotation[1],
                                                    part.rotation[2],
                                                    part.rotation[3]);
            }
            
            var partColor = new THREE.Color();//Instanciate a color object
            
            partColor.setRGB(part.color[0], // Assign the different channel values
                             part.color[1],
                             part.color[2]);
            
            model.addPart(partPosition, partScale, partRotation, partColor);
        }
    }
    
    function importN8(){}
}

function exportModel()
{
    var JSON = "";
    return JSON;
}

//Visualisation

//Manipulation functions

Model.prototype.addPart = function(position,scale,rotation,color)//Create a new part
{
    //Initialise the variables in case they have not been assigned a value firsthand
    
    if(color == undefined)color = new THREE.Color(Math.floor(0xffffff * Math.random()));
    
    if(position == undefined)position = new THREE.Vector3();
    if(scale == undefined)scale = new THREE.Vector3(1,1,1);//Must be 1,1,1 or error occurs and the part scale is 0,0,0 by default (infinitely small)
    if(rotation == undefined)rotation = new THREE.Quaternion();
    
    var geometry = baseGeometry;//Copies the geomatry of the base object, notable a 1x1x1 cube.
    
    var material = new THREE.MeshBasicMaterial({color : color});//Set the material color depending on final color
    
    var part = new THREE.Mesh(geometry,material);
    
    //Assigning the part's attributes
    
    part.position.copy(position);
    part.scale.copy(scale);
    part.rotation.copy(rotation);
    
    //Adding the part to the model
    
    this["parts"].push(part);//Add the part to the array of parts of the model
    
    this["sceneObject"].add(part);//Add the part to the group of object on the scene
}

Model.prototype.removePart = function(part)
{
    var index = this.parts.indexOf(part);//Get the index of the part in the array
    this["parts"].splice(index,1);//Remove the part from the array
    
    this["sceneObject"].remove(part);//Remove the part from the model and the scene.
}

Model.prototype.movePart = function(part, axis, local, amount)
{
    var movement = new THREE.Vector3();
    
    movement[axis] = amount;//Assign the amount to the axis
    
    if(local)
        movement.applyQuaternion(part.quaternion);//Rotates the movement vector to the current part's orientation
    
    part.position.add(movement);
}

//Main loops

var render = function ()
{
    renderer.render(scene, camera);//Renders the scene in which the models reside
    overlayRenderer.render(overlayScene,camera);//Renders the scene in which the overlay resides
};

function main()
{
    render();//Triggers the render
    requestAnimationFrame(main);//Loop main at optimal speed
}

//Initiations

function init()//Initiate what need to be initiated
{
    main();//Starts the main loop.
}

init();//Begins the application