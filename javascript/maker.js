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
var baseGeometry = new THREE.BoxGeometry(1,1,1);//new THREE.BoxGeometry(1,1,1);

//Main
var selection = new Array();

var model = new Model();

var cameraCenterPoint = new THREE.Vector3();
var centerPointDest = new THREE.Vector3();

var transformType = "translate";

var zoomFactor = 3;
var lastMousePos = new THREE.Vector2();

//Importation/exportations

function importModel(file)
{
    var importedModel;
    
    if(file[0] == '{')//If the file is a compatible JSON
    {
        importJSON(file);
    }
    
    function importJSON(json)
    {
        
        //When referring to the json's propreties, I use identidier keys, e.x.: part["proprety"] rather than part.proprety
        
        var loadedModel;//Json from which the model is loaded
        
        var sceneModel = new Model();//The currently empty imported model
        
        loadedModel = JSON.parse(json);
        
        //Loading parts
        
        var partLength = loadedModel["parts"].length;
        
        for(var i = 0; i < partLength; i++)
        {
            var part = loadedModel["parts"][i];//Attribute the current part to the variable
            
            var partPosition = new THREE.Vector3(part["position"][0], // Assign the position attributes of the part into an object
                                                 part["position"][1],
                                                 part["position"][2]);
            
            var partScale = new THREE.Vector3(part["size"][0], //Assign the scale attributes of the part into an object
                                              part["size"][1],
                                              part["size"][2]);
            
            var partRotation;//Instatiate the rotation variable, see below
            
            if(part["rotation"].length == 3)//If the rotation is in euler
            {
                partRotation = new THREE.Euler(part["rotation"][0], //Assign it in a Euler-format object
                                               part["rotation"][1],
                                               part["rotation"][2]);
            }
            else
            {
                partRotation = new THREE.Quaternion(part["rotation"][0], //Assign it in a quaternion
                                                    part["rotation"][1],
                                                    part["rotation"][2],
                                                    part["rotation"][3]);
            }
            
            var partColor = new THREE.Color();//Instanciate a color object
            
            partColor.setRGB(part["color"][0], // Assign the different channel values
                             part["color"][1],
                             part["color"][2]);
            
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

function getMiddlePos(partArray)
{
    var minPos = new THREE.Vector3();
    var maxPos = new THREE.Vector3();
    
    minPos.copy(partArray[0].position);//Making sure the values are not bigger or smaller than any of the parts
    maxPos.copy(partArray[0].position);
    
    var resulting = new THREE.Vector3();
    
    var arrayLength = partArray.length;
    
    for(var i = 0; i < partArray.length; i++)
    {
        var partPosition = partArray[i].position;
        
        minPos.x = Math.min(minPos.x, partPosition.x);
        minPos.y = Math.min(minPos.y, partPosition.y);
        minPos.z = Math.min(minPos.z, partPosition.z);
        
        maxPos.x = Math.max(maxPos.x, partPosition.x);
        maxPos.y = Math.max(maxPos.y, partPosition.y);
        maxPos.z = Math.max(maxPos.z, partPosition.z);
    }
    
    resulting.addVectors(minPos,maxPos);
    resulting.multiplyScalar(0.5);
    
    return resulting;
}

function updateCameraCenterDest()//Changing the camera destination after smoothing
{
    var newCenterPosition;
    
    if(selection.length == 0)
        newCenterPosition = getMiddlePos(model.parts);
    else
        newCenterPosition = getMiddlePos(selection);
    
    centerPointDest.copy(newCenterPosition);
}

function updateCameraCenterPoint()//Smoothing between selections
{
    var middleRate = 0.2;
    
    var resulting = new THREE.Vector3();
    
    resulting.subVectors(centerPointDest,cameraCenterPoint);
    
    resulting.multiplyScalar(middleRate);
    
    cameraCenterPoint.add(resulting);
}

function rotateCamera()
{
    var subbedMovement = new THREE.Vector2();
    var speed = 2;
    
    subbedMovement.subVectors(mouse.position,mouse.lastPosition);
    
    camera.rotation.y -= subbedMovement.x/1000 * speed;
    camera.rotation.x -= subbedMovement.y/1000 * speed;
}

function updateCameraPosition()
{
    var distanceFactor = Math.cos(camera.rotation.x) * zoomFactor;
    
    camera.position.x = Math.sin(camera.rotation.y) * distanceFactor + cameraCenterPoint.x;
    camera.position.y = -Math.sin(camera.rotation.x) * zoomFactor + cameraCenterPoint.y;
    camera.position.z = Math.cos(camera.rotation.y) * distanceFactor + cameraCenterPoint.z;
}

//Interractivity functions

function setTransformationType(type)
{
    transformType = type;
    //Todo: change the current gizmo appearance
}

//Selection functions

function getSelectableAt(vec2)
{
    var raycaster = new THREE.Raycaster();//Create a raycaster
    raycaster.setFromCamera( vec2, camera);//Create the ray to use depending on the mouse position and the camera's attributes (position & rotation)
    
    var intersectParts = raycaster.intersectObjects(model.parts);//Cast a ray to see if a block was clicked on
    
    if(intersectParts.length > 0)
    {
        var part = intersectParts[0].object;//Assign the first object in the display list of the raycaster
        
        var pos = selection.indexOf(part);//Index of the part in the array (-1 if not there)
        
        if(keys.ctrl)
        {
            if(pos < 0)//If it's not already in the list
                addToSelection(part);
            else//Else, deselect it
                removeFromSelection(part);
        }
        else
        {
            pos = selection.indexOf(part);//Index of the part in the array (-1 if not there)
            
            if(pos < 0)//If it's not already in the list
                setSelection(part);
            else//Else, deselect it
                clearSelection()
        }
    }
    else
    {
        clearSelection();
    }
    
    console.log(selection);
}

function setSelection(part)
{
    selection = [part];
    updateCameraCenterDest();
}

function addToSelection(part)
{
    selection.push(part);
    updateCameraCenterDest();
}

function removeFromSelection(part)
{
    var pos = selection.indexOf(part);
    selection.splice(pos,1);
    updateCameraCenterDest();
}

function clearSelection()
{
    selection = [];
    updateCameraCenterDest();
}

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
    
    updateCameraCenterDest();
}

Model.prototype.removePart = function(part)
{
    var index = this.parts.indexOf(part);//Get the index of the part in the array
    this["parts"].splice(index,1);//Remove the part from the array
    
    this["sceneObject"].remove(part);//Remove the part from the model and the scene.
    
    updateCameraCenterDest();
}

Model.prototype.movePart = function(part, axis, amount, local)
{
    var movement = new THREE.Vector3();
    
    movement[axis] = amount;//Assign the amount to the axis
    
    if(local)
        movement.applyQuaternion(part.quaternion);//Rotates the movement vector to the current part's orientation
    
    part.position.add(movement);
    
    updateCameraCenterDest();
}

Model.prototype.rotatePart = function(part, axis, amount, local)
{
    var q = new THREE.Quaternion();
    q[axis] = Math.sin(amount);
    q.w = Math.cos(amount);
    
    var newRelativePosition = new THREE.Vector3();
    
    newRelativePosition.subVectors(part.position,centerPointDest);
    
    newRelativePosition.applyQuaternion(q);
    
    var newPosition = new THREE.Vector3();
    
    newPosition.addVectors(newRelativePosition,centerPointDest);
    
    newPosition.z *= -1;
    
    part.quaternion.multiply(q);
    part.position.copy(newPosition);
}

Model.prototype.scalePart = function(part, axis, amount)
{
    part.scale[axis] += amount;
    part.scale[axis] = Math.max(part.scale[axis] , 0);
}

//Main loops

function render()
{
    renderer.render(scene, camera);//Renders the scene in which the models reside
    overlayRenderer.render(overlayScene,camera);//Renders the scene in which the overlay resides
}

function handleCamera()
{
    updateCameraCenterPoint();//Smooth animation for the camera
    updateCameraPosition();
}

function main()
{
    handleCamera();
    render();//Triggers the render
    requestAnimationFrame(main);//Loop main at optimal speed
}

//Initiations

function init()//Initiate what need to be initiated
{
    main();//Starts the main loop.
    //Temporary debug for fancyness and demonstration.
    importModel(a);//Import the demo model
    updateCameraCenterDest();
}

init();//Begins the application