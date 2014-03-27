
function toRadians (angle) {
    return angle * (Math.PI / 180);
}

function toDegrees (angle) {
    return angle * (180 / Math.PI);
}
var simplecase = simplecase || {};
simplecase.run = (function(){
    var canvas = null;
    var context = null;
    var hit = false;
    var tx, ty, mx, my, tv, mvx, mvy, dx, dy, mmax;
    var linepoints = [];
    var errorpoints = [];
    tx = 50000;
    ty = 60000;
    mx = 10;
    my = 10;
    tv = -1000;
    mmax = 2000;
    mvx = Math.sqrt(mmax*mmax/2);
    mvy = mvx;
    dx=tx-mx;
    dy=ty-my;
    var scale = 0.006;
    var time = gettime();


    function gettime(){
        var now = new Date();
        return now.getTime();
    }

    function cart2screen(x,y){
        return [x, canvas.height-y];
    }
    function distance(){
        return Math.sqrt(dx*dx+dy*dy);
    }
    function update()
    {
        var ctime=gettime();
        var dt = (ctime-time)/1000.;
        if ( !hit ){
            doguidance();
            ty=ty+tv*dt;
            mx=mx+mvx*dt;
            my=my+mvy*dt;
        }
        time=ctime;
        draw();
        setTimeout(update, 50);
    }

    function doguidance(){
        dx = tx-mx;
        dy = ty-my;
        if ( distance() < 50 ){
            hit=true;
            console.log("hit");
            return;
        }
        var thetaT = tv/mmax+dy/dx;
        // terminal guidance
        if ( Math.abs(dy) <= 60 && Math.abs(thetaT) <= 1 ){
            //console.log("terminal guidance " + dy);
            var theta = Math.PI/2.;
            if ( dx != 0 )
                theta = toDegrees(Math.asin(thetaT));
            if ( isNaN(theta) ){
                hit=true;
                console.log("errror");
                return;
            }
            mvx = mmax*Math.cos(toRadians(theta));
            mvy = Math.sqrt(mmax*mmax-mvx*mvx);
            if ( isNaN(mvx) || isNaN(mvy) ){
                console.log("nan error " + theta);
                hit=true;
                return;
            }
            if ( dx < 0 )
                mvx=-mvx;
            if ( dy < 0 )
                mvy=-mvy;
        }
        // distant
        else{
            //console.log("distant guidance " + tx + " " + ty);
            var ratio = 1.;
            if ( dx != 0)
                ratio = Math.abs(dy/dx);
            mvy=ratio*mmax;
            if ( mvy > mmax )
                mvy = mmax;
            mvx=Math.sqrt(mmax*mmax-mvy*mvy);
            if ( dx < 0 )
                mvx=-mvx;
            if ( dy < 0 )
                mvy=-mvy;
        }
       // console.log(mvx + " " + mvy + " " + Math.sqrt(mvx*mvx+mvy*mvy));
    }
    function draw()
    {
        context.clearRect(0,0,canvas.width,canvas.height);
        var coords = cart2screen(tx*scale, ty*scale);
        var tpx = coords[0];
        var tpy = coords[1];
        var tep = 0;
        context.strokeText("T", coords[0], coords[1]);
        coords = cart2screen(mx*scale, my*scale);
        context.strokeText("M", coords[0], coords[1]);
        context.strokeText(mvx + " " + mvy + " " + Math.sqrt(mvx*mvx+mvy*mvy) + " " + my, 10, 10);
        linepoints[linepoints.length] = [coords[0], coords[1]];
        errorpoints[errorpoints.length] = cart2screen(coords[0], distance()*scale)[1];
        context.beginPath();
        context.moveTo(linepoints[0][0], linepoints[0][1]);
        for(var i = 1; i < linepoints.length; i++ )
            context.lineTo(linepoints[i][0], linepoints[i][1]);
        context.stroke();
        // error
        context.beginPath();
        context.strokeStyle="red";
        context.moveTo(linepoints[0][0], errorpoints[0]);
        for(var i = 1; i < errorpoints.length; i++)
            context.lineTo(linepoints[i][0], errorpoints[i]);
        context.stroke();

        context.strokeStyle="black";
        context.beginPath();
        context.moveTo(tpx,tpy);
        if ( tv >= 0 )
            tep = cart2screen(tx*scale, 0)[1];
        context.lineTo(tx*scale,tep);
        context.stroke();
    }
    function mouseMove(e)
    {
    }

    function mouseDown()
    {

    }

    function init()
    {
        canvas = document.getElementById("canvas");
        context = canvas.getContext("2d");
        context.fillStyle="red";
        jQuery("#canvas").mousemove(mouseMove);
        jQuery("#canvas").click(mouseDown);
        context.moveTo(mx,my);
        update();
    }

    init();

    return function(itx,ity, imx, imy, itv, imv){
        tx=parseFloat(itx);
        ty=parseFloat(ity);
        mx=parseFloat(imx);
        my=parseFloat(imy);
        tv=parseFloat(itv);
        mmax=parseFloat(imv);
        dx=tx-mx;
        dy=ty-my;
        hit=false;
        linepoints=[];
        errorpoints = [];
    };
});

var reinit = simplecase.run();
function restartSim(){
    var itx, ity, imx, imy, itv, imv;
    var ele = document.getElementById("itx");
    itx=ele.value;
    ele = document.getElementById("ity");
    ity=ele.value;
    ele = document.getElementById("imx");
    imx=ele.value;
    ele = document.getElementById("imy");
    imy=ele.value;
    ele = document.getElementById("itv");
    itv=ele.value;
    ele = document.getElementById("imv");
    imv=ele.value;
    reinit(itx,ity,imx,imy,itv,imv);
}
//reinit(4);