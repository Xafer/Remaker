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
})();