import React from 'react';
import "./editor.css";

const image = new Image();
image.src = "http://localhost:9000/dp/8420595895.jpg";

var drawCanvas, imageCanvas, drawContext, imageContext, canvasWidth, canvasHeight, canvasStartX, canvasStartY;
var mask, maskContainer, maskWidth, maskHeight, startX, startY;
//CONTROL VARIABLES
var isMove=false, isResize = false, resizeState = "";

//DRAW VARIABLES
var colorIndicator, drawMode = false, lastDrawX = 0, lastDrawY = 0, mousePressed = false;
//AVAILIABLE IF PATH2D API WORKS ON BROWSER
var drawPath, pathArr = [];

export default class Editor extends React.Component{
    constructor(props){
        super(props);
        this.state={
            filePath : "",
            canvasMode : "none"
        }
    }
    renderImage(){
        imageCanvas = document.getElementById("imageCanvas");
        drawCanvas = document.getElementById("drawCanvas")
        imageContext = imageCanvas.getContext("2d");
        drawContext = drawCanvas.getContext("2d");
        maskContainer = document.getElementById("maskContainer");
        mask = document.getElementById("mask");

        colorIndicator = document.getElementById("colorIndicator");

        var containerWidth = window.innerWidth * 0.48;
        var containerHeight = window.innerHeight * 0.8;
        var canvasContainerAR = containerWidth/containerHeight;
        var imageAR = image.width/ image.height;


        if(canvasContainerAR > imageAR){
            //vertical alignment
            canvasHeight = containerHeight;
            canvasWidth = containerHeight * imageAR;
        }
        else{
            //horizontal alignment
            canvasWidth = containerWidth;
            canvasHeight = canvasWidth / imageAR;
        }

        imageCanvas.width = canvasWidth;
        imageCanvas.height = canvasHeight;
        drawCanvas.width = canvasWidth;
        drawCanvas.height = canvasHeight;
        canvasStartX = (containerWidth - canvasWidth) / 2;
        canvasStartY = (containerHeight - canvasHeight) / 2;
        if(imageAR === 1){
            canvasStartX = 0;
            canvasStartY = 0;
        }
        imageCanvas.style.top = canvasStartY.toString() + "px";
        imageCanvas.style.left = canvasStartX.toString() + "px";
        drawCanvas.style.top = canvasStartY.toString() + "px";
        drawCanvas.style.left = canvasStartX.toString() + "px";
        
        imageContext.drawImage(image, 0, 0, canvasWidth, canvasHeight);
        drawContext.globalAlpha="0.6";
        imageContext.strokeStyle = "hsl(0, 100%, 50%)";
        imageContext.lineWidth = 10;
        imageContext.lineJoin = "round";
        imageContext.lineCap = "round";
    }
    drawMask(){
        drawContext.clearRect(0, 0, canvasWidth, canvasHeight);

        maskContainer.style.top = (canvasStartY + startY - 3).toString() + "px";
        maskContainer.style.left = (canvasStartX + startX - 3).toString() + "px";
        maskContainer.style.width = (maskWidth).toString() + "px";
        maskContainer.style.height = (maskHeight).toString() + "px";

        mask.style.width = (maskWidth - 20).toString() + "px";
        mask.style.height = (maskHeight - 20).toString() + "px";
        
        drawContext.beginPath();
        drawContext.moveTo(0, 0);
        drawContext.lineTo(canvasWidth, 0);
        drawContext.lineTo(canvasWidth, canvasHeight);
        drawContext.lineTo(0, canvasHeight);
        drawContext.lineTo(0, 0);
        drawContext.closePath();

        drawContext.moveTo(startX, startY);
        drawContext.lineTo(startX, startY + maskHeight);
        drawContext.lineTo(startX + maskWidth, startY + maskHeight);
        drawContext.lineTo(startX + maskWidth, startY);
        drawContext.closePath();
        drawContext.fill();
    }
    controlMovement(event){
        //sets the current state of operation
        var cursor = event.target.style.cursor;
        if(cursor === "move") isMove =true;
        else{
            isResize = true;
            if(cursor === "n-resize") resizeState = "n";
            else if(cursor === "e-resize") resizeState = "e";
            else if(cursor === "s-resize") resizeState = "s";
            else if(cursor === "w-resize") resizeState = "w";
            else if(cursor === "nw-resize") resizeState = "nw";
            else if(cursor === "ne-resize") resizeState = "ne";
            else if(cursor === "se-resize") resizeState = "se";
            else if(cursor === "sw-resize") resizeState = "sw";
        }
    }
    continuity(event){
        //maintains the continuity of the current process even if cursor goes outside control point region
        if(resizeState === "e") this.eastResize(event);
        else if(resizeState === "n") this.northResize(event);
        else if(resizeState === "s") this.southResize(event);
        else if(resizeState === "w") this.westResize(event);
        else if(resizeState === "nw") this.northwestResize(event);
        else if(resizeState === "ne") this.northeastResize(event);
        else if(resizeState === "se") this.southeastResize(event);
        else if(resizeState === "sw") this.southwestResize(event);
    }
    relocateMask(event){
        event.preventDefault();
        if(isMove === true){
            startX += event.movementX;
            startY += event.movementY;
            if(startX >= 0 && startY >= 0 && startX <= (canvasWidth - maskWidth) && startY <= (canvasHeight - maskHeight)) this.drawMask();
        }
    }
    northResize(event){
        event.preventDefault();
        if(isResize === true){
            startY += event.movementY;
            maskHeight -= event.movementY;
            if(startY >= 0) this.drawMask();
        }
    }
    eastResize(event){
        event.preventDefault();
        if(isResize === true){
            maskWidth += event.movementX;
            if((startX + maskWidth) <= canvasWidth){
                this.drawMask();
            }
        }
    }
    southResize(event){
        event.preventDefault();
        if(isResize === true){
            maskHeight += event.movementY;
            if((startY + maskHeight) <= canvasHeight) this.drawMask();
        }
    }
    westResize(event){
        event.preventDefault()
        if(isResize === true){
            startX += event.movementX;
            maskWidth -= event.movementX;
            if(startX >= 0) this.drawMask();
        }
    }
    northwestResize(event){
        event.preventDefault();
        if(isResize === true){
            startX += event.movementX;
            startY += event.movementY;
            maskWidth -= event.movementX;
            maskHeight -= event.movementY;
            if(startX >= 0 && startY >= 0) this.drawMask();
        }
    }
    northeastResize(event){
        event.preventDefault();
        if(isResize === true){
            startY += event.movementY;
            maskWidth += event.movementX;
            maskHeight -= event.movementY;
            if((startX + maskWidth) <= canvasWidth && startY >= 0) this.drawMask();
        }
    }
    southeastResize(event){
        event.preventDefault();
        if(isResize === true){
            maskWidth += event.movementX;
            maskHeight += event.movementY;
            if((startX + maskWidth) <= canvasWidth && (startY + maskHeight) <= canvasHeight) this.drawMask();
        }
    }
    southwestResize(event){
        event.preventDefault();
        if(isResize === true){
            startX += event.movementX;
            maskWidth -= event.movementX;
            maskHeight += event.movementY;
            if(startX >= 0 && (startY + maskHeight) <= canvasHeight) this.drawMask();
        }
    }

    changeStrokeColor(event){
        var index = parseInt(event.target.id);
        var color = "hsl(" + index.toString() + ", 100%, 50%)"
        colorIndicator.style.backgroundColor = color;
        colorIndicator.style.left = (index -10).toString() + "px";
        imageContext.strokeStyle = color;
    }
    changeStrokeWidth(event){
        imageContext.lineWidth = event.target.value;
    }
    drawOnImage(event){
        event.preventDefault();
        if(mousePressed === true && drawMode === true){
            drawPath.moveTo(lastDrawX, lastDrawY);
            lastDrawX += event.movementX;
            lastDrawY += event.movementY;
            drawPath.lineTo(lastDrawX, lastDrawY);
            imageContext.stroke(drawPath);
        }
    }
    undoStroke(){
        imageContext.drawImage(image, 0, 0, canvasWidth, canvasHeight);
        pathArr.pop();
        console.log(pathArr)
        for(var i = 0; i < pathArr.length; i++){
            imageContext.stroke(pathArr[i]);
        }
    }
    componentDidMount(){
        this.renderImage();
        startX = canvasWidth / 4;
        startY = canvasHeight / 4;
        maskHeight = canvasHeight / 2;
        maskWidth = canvasWidth / 2;
    }
    render(){
        var rows = [];
        for(var i = 0; i < 360; i++){
            rows.push(
            <td 
                key = {i}
                id={i} 
                onClick={this.changeStrokeColor.bind(this)}
                style={{backgroundColor: "hsl(" + i.toString() + ", 100%, 50%)", width: "1px", height: "10px", padding: "0px"}} 
            />
            )
        }
        return(
            <div id="editorContainer">
                <div 
                    id="canvasContainer" 
                    onMouseUp={function(){isResize = false; isMove=false;}} 
                    onMouseMove={this.continuity.bind(this)}
                >
                    <canvas 
                        id="imageCanvas" 
                        onMouseDown={(event) => {
                            imageContext.beginPath();
                            mousePressed = true; 
                            lastDrawX = event.nativeEvent.offsetX;
                            lastDrawY = event.nativeEvent.offsetY;
                            drawPath = new Path2D();
                        }}
                        onMouseMove = {this.drawOnImage.bind(this)}
                        onMouseUp={() => {
                            mousePressed = false;
                            imageContext.closePath();
                            pathArr.push(drawPath);
                            console.log(pathArr);
                        }}
                    />
                    <canvas id="drawCanvas" />
                    <div id="maskContainer" >
                        <div 
                            id="mask" 
                            onMouseDown={this.controlMovement.bind(this)} 
                            onMouseMove={this.relocateMask.bind(this)} 
                            style={{cursor: "move"}} />
                        <div id="verticalSpanner" />
                        <div id="horizontalSpanner" />
                        <div 
                            id="ncp" 
                            onMouseDown={this.controlMovement.bind(this)} 
                            onMouseMove={this.northResize.bind(this)}
                            style={{cursor: "n-resize"}}
                        />
                        <div 
                            id="ecp" 
                            onMouseDown={this.controlMovement.bind(this)}
                            onMouseMove={this.eastResize.bind(this)}
                            style={{cursor: "e-resize"}} 
                        />
                        <div 
                            id="scp" 
                            onMouseDown={this.controlMovement.bind(this)} 
                            onMouseMove={this.southResize.bind(this)}
                            style={{cursor: "s-resize"}} 
                        />
                        <div 
                            id="wcp" 
                            onMouseDown={this.controlMovement.bind(this)} 
                            onMouseMove={this.westResize.bind(this)}
                            style={{cursor: "w-resize"}} 
                        />
                        <div 
                            id="nwcp" 
                            onMouseDown={this.controlMovement.bind(this)} 
                            onMouseMove={this.northwestResize.bind(this)}
                            style={{cursor: "nw-resize"}} 
                        />
                        <div 
                            id="necp" 
                            onMouseDown={this.controlMovement.bind(this)} 
                            onMouseMove={this.northeastResize.bind(this)}
                            style={{cursor: "ne-resize"}} 
                        />
                        <div 
                            id="secp" 
                            onMouseDown={this.controlMovement.bind(this)} 
                            onMouseMove={this.southeastResize.bind(this)}
                            style={{cursor: "se-resize"}} 
                        />
                        <div 
                            id="swcp" 
                            onMouseDown={this.controlMovement.bind(this)} 
                            onMouseMove={this.southwestResize.bind(this)}
                            style={{cursor: "sw-resize"}} 
                        />
                    </div>
                </div>
                <div id="controlContainer">
                    <div id="controlButtonWrapper">
                        <button 
                            onClick={() => {
                                this.drawMask();
                                maskContainer.style.display = "block";
                                drawCanvas.style.display = "block";
                                this.setState({canvasState: "crop"});
                                drawMode = false;
                            }}>
                                <i className="fa fa-crop"></i> CROP
                        </button>
                        <button 
                            onClick={() => {
                                //imageContext.drawImage(image, 0, 0, canvasWidth, canvasHeight);
                                maskContainer.style.display = "none";
                                drawCanvas.style.display = "none";
                                this.setState({canvasState: "draw"})
                                drawMode = true;
                            }}
                        >
                            <i className="fa fa-pencil"></i> DRAW
                        </button>
                    </div>
                    <div title="stroke color" id="colorPickerWrapper">
                        <span 
                            id="colorIndicator" 
                        />
                        <table>
                            <tbody id="colorPicker">
                                <tr style={{width: "360px"}}>                                
                                    {rows}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <input title="line width" id="strokeWidthSlider" step="1" min="2" max="30" defaultValue="10" type="range" onChange={this.changeStrokeWidth.bind(this)} />
                    <div id="stateControlWrapper">
                        <button 
                            onClick={() => {this.undoStroke()}}
                            style={drawMode === true ? {visibility: "visible"} : {visibility: "hidden"}}
                        >
                            <i className="fa fa-undo"></i>UNDO
                        </button>
                        <button><i className="fa fa-check"></i> SAVE</button>
                    </div>
                </div>
            </div>
        )
    }
}