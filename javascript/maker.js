//Setting up the scenes
var scene = new THREE.Scene();
var overlayScene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer({"alpha" : true});
var overlayRenderer = new THREE.WebGLRenderer({"alpha" : true});

renderer.setSize( window.innerWidth, window.innerHeight );
overlayRenderer.setSize( window.innerWidth, window.innerHeight );

var bgColor = new THREE.Color(0x000000);

renderer.setClearColor(bgColor,0);
overlayRenderer.setClearColor(bgColor,0);

document.getElementById("display").appendChild( renderer.domElement );
document.getElementById("display").appendChild( overlayRenderer.domElement );

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
    
    scene.add(this["sceneObject"]);
}

//Variable instatiation

//Generation
var baseGeometry = new THREE.BoxGeometry(1,1,1);

//Main
var selection = new Array();

var model = new Model();

//Importation/exportations
function importModel(JSON)
{
    function importJSON(){}
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
    if(scale == undefined)scale = new THREE.Vector3(1,1,1);
    if(rotation == undefined)rotation = new THREE.Quaternion();
    
    var geometry = baseGeometry;//Copies the geomatry of the base object, notable a 1x1x1 cube.
    
    var material = new THREE.MeshBasicMaterial(color);//Set the material color depending on final color
    
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
    renderer.render(scene, camera);
    overlayRenderer.render(overlayScene,camera);
};

function main()
{
    render();
    requestAnimationFrame(main);
}

//Initiations

function init()
{
    main();
}

init();