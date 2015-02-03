var keys =
{
    x : false,
    c : false,
    shift : false,
    ctrl : false
};

var mouse =
{
    left : false,
    right : false,
    position : new THREE.Vector2(),
    lastPosition : new THREE.Vector2()
};

var ratio =
{
    position: 0.1,
    rotation: (Math.PI/4) / 2,
    scale: 0.1
};

(function(){
    //Keyboard keys
    
    window.addEventListener("keydown",function(e)
    {
        keyHandler(e.keyCode,true);
    });

    window.addEventListener("keyup",function(e)
    {
        keyHandler(e.keyCode,false);
    });

    function keyHandler(key,state)
    {
        if((key == 87 || key == 69 || key == 82) && state)
        {
            switch(key)
            {
                case 87: setTransformationType("translate"); break;    
                case 69: setTransformationType("scale"); break;    
                case 82: setTransformationType("rotate"); break;    
            }
        }
        else
        {
            switch(key)
            {
                case 88: keys.x = state; break;
                case 67: keys.c = state; break;
                case 17: keys.ctrl = state; break;
                case 16: keys.shift = state; break;
            }
        }
    }
    
    //Mouse Buttons
    document.getElementById("display").oncontextmenu = function(e)
    {
        return false;
    }
    
    document.getElementById("display").addEventListener("mousemove",function(e)
    {
        mouse.position.set(e.clientX, e.clientY);
        if(mouse.right)rotateCamera(mouse.position);
        mouse.lastPosition.copy(mouse.position);
    });
    
    document.getElementById("display").addEventListener("mousedown",function(e)
    {
        mouseButtonHandler(e.button,true);
        
        //Part Selection
        if(e.button == 0)
        {
            var normalizedMousePosition = new THREE.Vector2();

            normalizedMousePosition.x = (mouse.position.x / window.innerWidth) * 2 - 1;
            normalizedMousePosition.y = -(mouse.position.y / window.innerHeight) * 2 + 1;

            getSelectableAt(normalizedMousePosition);
        }
    });
    
    document.getElementById("display").addEventListener("mouseup",function(e)
    {
        mouseButtonHandler(e.button,false);
    });
    
    function mouseButtonHandler(button,state)
    {
        switch(button)
        {
            case 0:mouse.left = state; break;
            case 2:mouse.right = state; break;
        }
    }
    
    document.getElementById("btn-add").addEventListener("click",function(e)
    {
        model.addPart();
    });
    
    document.getElementById("btn-clone").addEventListener("click",function(e)
    {
        for(var i in selection)
        {
            var part = selection[i];
            model.addPart(part.position,part.scale,part.rotation,part.material.color);
        }
    });
    
    document.getElementById("btn-delete").addEventListener("click",function(e)
    {
        var l = selection.length;
        for(var i = 0; i < l; i++)
        {
            var part = selection[0];
            model.removePart(part);
            selection.splice(0,1);
        }
        
        updateCameraCenterDest();
    });
    
    //Interface buttons
    
    //Axis-based functions
    
    for(var i = 0; i < 3; i++)//Type
    {
        for(var j = 0; j < 3; j++)//axis index
        {
            for(var k = 0; k < 2; k++)//Direction index
            {
                var btnType = ['p','r','s'][i];//Position, rotation, scale
                var axis = ['x','y','z'][j];//Axis ssign
                var btnDir = ['m','p'][k];//Minus, plus
                
                document.getElementById(btnType + axis + btnDir).addEventListener('click',function(e)//Assign an event to the buttons
                {
                    var id = e.target.id;
                    var type = ['p','r','s'].indexOf(id[0]);
                    var typeString = ["position","rotation","scale"][type];
                    var axis = id[1];
                    var orientation = (id[2] == "m")?-1:1;
                    var operation = ['movePart','rotatePart','scalePart'][type];
                    for(var partIndex in selection)
                    {
                        var part = selection[partIndex];
                        var amount = orientation * ratio[typeString];
                        model[operation](part,axis,amount);
                    }
                    for(var partIndex in overlayModel.parts)
                    {
                        var part = overlayModel.parts[partIndex];
                        var amount = orientation * ratio[typeString];
                        overlayModel[operation](part,axis,amount);
                    }
                });
            }
        }
    }
    
    //Global scaling
    
    for(var j = 0; j < 2; j++)//Direction index
    {
        var btnDir = ['m','p'][j];//Directoin assign
           
        document.getElementById('sg' + btnDir).addEventListener('click',function(e)//Assign an event to the buttons
        {
            var id = e.target.id;
            var type = ['p','r','s'].indexOf(id[0]);
            var typeString = ["position","rotation","scale"][type];
            var orientation = (id[2] == "m")?-1:1;
            var operation = [model.movePart,model.rotatePart,model.scalePart][type];
            for(var partIndex in selection)
            {
                var part = selection[partIndex];
                var amount = orientation * ratio[typeString];
                for(var a = 0; a < 3; a++)
                { 
                    var axis = ['x','y','z'][a];
                    operation(part,axis,amount);
                }
            }
        });
    }
    
    for(var i = 0; i < 3; i++)
    {
        var btnType = ['Pos','Rot','Sca'][i];//Position, rotation, scale
        
        document.getElementById('reset' + btnType).addEventListener('click',function(e)//Assign an event to the buttons
        {
            var id = e.target.id;
            for(var partIndex in selection)
            {
                var part = selection[partIndex];
            
                switch(id)
                {
                    case "resetPos": part.position.set(0,0,0); break;
                    case "resetRot": part.quaternion.set(0,0,0,1); break;
                    case "resetSca": part.scale.set(1,1,1); break;
                }
                
                updateCameraCenterDest();
            }
        });
    }
})();