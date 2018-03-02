var DISPLAY_LENGTH = 7;

var metric;

var age = 30;
var height = 180;
var weight = 70;
var bpm = 70;
var runBpm = 150;
var dist = 1000;
var h = 0;
var m = 5;
var s = 45;

var currType = 0;

var pedometer;
var startSteps = 0;
var currPedoInfo;
var timerId;
var startTime;
var exercise = false;

var scoreboard;

function Scoreboard() 
{
	this.list = [];
}

function Score(recordDate, bmi, maxBpm, intensity, speedN, cal, fatRatio, fat, carbo, distanceN, h, m, s) 
{
	this.recordDate = recordDate;
	this.bmi = bmi;
	this.maxBpm = maxBpm;
	this.intensity = intensity;
	this.speedN = speedN;
	this.cal = cal;
	this.fatRatio = fatRatio;
	this.fat = fat;
	this.carbo = carbo;
	this.distanceN = distanceN;
	this.h = h;
	this.m = m;
	this.s = s;
}

//	var person1 = new Person('Alice');

function init()
{
	if (window.localStorage["scoreboard"] == undefined)
	{
		scoreboard = new Scoreboard();
		window.localStorage.setItem("scoreboard", JSON.stringify(scoreboard));
	}
	else
	{
		scoreboard = JSON.parse(window.localStorage.getItem("scoreboard"));
	}
	
	if (window.localStorage["metric"] == undefined)
	{
		window.localStorage.setItem("metric", "true");
		metric = true;
	}
	else
	{
		metric = window.localStorage.getItem("metric") == "true" ? true: false;
	}

	if (window.localStorage["age"] == undefined)
	{
		window.localStorage.setItem("age", age);
	}
	else
	{
		age = parseInt(window.localStorage.getItem("age"));
	}
	document.getElementById("ageField").innerHTML = "Age: " + age + " years";

	if (window.localStorage["weight"] == undefined)
	{
		window.localStorage.setItem("weight", weight);
	}
	else
	{
		weight = parseInt(window.localStorage.getItem("weight"));
	}
	document.getElementById("weightField").innerHTML = "Weight: " + weight + (metric ? " kg" : " lb");

	if (window.localStorage["height"] == undefined)
	{
		window.localStorage.setItem("height", height);
	}
	else
	{
		height = parseInt(window.localStorage.getItem("height"));
	}
	document.getElementById("heightField").innerHTML = "Height: " + height + (metric ? " cm" : " in");

	if (window.localStorage["bpm"] == undefined)
	{
		window.localStorage.setItem("bpm", bpm);
	}
	else
	{
		bpm = parseInt(window.localStorage.getItem("bpm"));
	}
	document.getElementById("bpmField").innerHTML = "Rest BPM: " + bpm;

	if (window.localStorage["runBpm"] == undefined)
	{
		window.localStorage.setItem("runBpm", runBpm);
	}
	else
	{
		runBpm = parseInt(window.localStorage.getItem("runBpm"));
	}
	document.getElementById("runBpmField").innerHTML = "Run BPM: " + runBpm;

	if (window.localStorage["dist"] == undefined)
	{
		window.localStorage.setItem("dist", dist);
	}
	else
	{
		dist = parseInt(window.localStorage.getItem("dist"));
	}
	document.getElementById("distField").innerHTML = "Dist.: " + dist + (metric ? " m" : " ft");

	if (window.localStorage["h"] == undefined)
	{
		window.localStorage.setItem("h", h);
	}
	else
	{
		h = parseInt(window.localStorage.getItem("h"));
	}

	if (window.localStorage["m"] == undefined)
	{
		window.localStorage.setItem("m", m);
	}
	else
	{
		m = parseInt(window.localStorage.getItem("m"));
	}

	if (window.localStorage["s"] == undefined)
	{
		window.localStorage.setItem("s", s);
	}
	else
	{
		s = parseInt(window.localStorage.getItem("s"));
	}
	document.getElementById("timeField").innerHTML = "Time: " + h + ":" + (m < 10 ? ("0" + m) : ("" + m)) + 
		":" + (s < 10 ? ("0" + s) : ("" + s));

	if (metric === true)
	{
		document.getElementById("radio-m").setAttribute("checked", "true");
	}
	else
	{
		document.getElementById("radio-i").setAttribute("checked", "true");
	}
	
	if (window.webapis && window.webapis.motion !== undefined) 
	{
		pedometer = window.webapis.motion;
	}
	
}

function handlePedoInfo(pedoInfo)
{
//	console.log(JSON.stringify(pedoInfo));
	currPedoInfo = pedoInfo;
	document.getElementById("stepsDisp").innerHTML = "" + pedoInfo.cumulativeTotalStepCount;
	document.getElementById("distDisp").innerHTML = metric ? parseInt(pedoInfo.cumulativeDistance) + " m" : parseInt(pedoInfo.cumulativeDistance * 3.2808399) + " ft";
;
	if (pedoInfo.stepStatus === "RUNNING")
	{
		exercise = true;
		document.getElementById("modeDisp").innerHTML = "RUN";
	}
	else if (pedoInfo.stepStatus === "WALKING")
	{
		exercise = true;
		document.getElementById("modeDisp").innerHTML = "WALK";
	}
	else
	{
		exercise = false;
		document.getElementById("modeDisp").innerHTML = "-";
	}
}

function doTime()
{
	if (exercise)
	{
		startTime++;
	}
	var display = "";
	var h = parseInt(startTime / 3600.0);
	display += (h < 10 ? "0" : "") + h + ":";
	var m = parseInt((startTime - h * 3600.0) / 60.0);
	display += (m < 10 ? "0" : "") + m + ":";
	var s = parseInt(startTime - h * 3600.0 - m * 60.0);
	display += (s < 10 ? "0" : "") + s;
	document.getElementById("timeDisp").innerHTML = display;
}

function startPedo()
{
	pedometer.start("PEDOMETER", handlePedoInfo);
	document.getElementById("stepsDisp").innerHTML = "0";
	document.getElementById("distDisp").innerHTML = "0 " + (metric ? "m" : "ft");
	document.getElementById("timeDisp").innerHTML = "00:00:00";
	document.getElementById("modeDisp").innerHTML = "-";
	startTime = 0;
	exercise = false;
	timerId = setInterval("doTime()", 1000);
}

function stopPedo()
{
	pedometer.stop("PEDOMETER");
	clearInterval(timerId);
	exercise = false;
	if (currPedoInfo)
	{
		dist = currPedoInfo.cumulativeDistance;
		if (!metric)
		{
			dist = parseInt(dist * 3.2808399)
		}
		else
		{
			dist = parseInt(dist);
		}
		window.localStorage.setItem("dist", dist);
		document.getElementById("distField").innerHTML = "Dist.: " + dist + (metric ? " m" : " ft");

		h = parseInt(startTime / 3600.0);
		m = parseInt((startTime - h * 3600.0) / 60.0);
		s = parseInt(startTime - h * 3600.0 - m * 60.0);	
		window.localStorage.setItem("h", h);
		window.localStorage.setItem("m", m);
		window.localStorage.setItem("s", s);
		document.getElementById("timeField").innerHTML = "Time: " +  + h + ":" + (m < 10 ? ("0" + m) : ("" + m)) + 
		":" + (s < 10 ? ("0" + s) : ("" + s));
	}
	tau.back();
}

function storeSettings(isMetric)
{
	metric = isMetric;
	window.localStorage["metric"] = isMetric ? "true" : "false";
	document.getElementById("weightField").innerHTML = "Weight: " + weight + (metric ? " kg" : " lb");
	document.getElementById("heightField").innerHTML = "Height: " + height + (metric ? " cm" : " in");
	document.getElementById("distField").innerHTML = "Dist.: " + dist + (metric ? " m" : " ft");
}

function openInputDialog(type)
{
	if (type == 0)
	{
		document.getElementById("display").innerHTML = "" + age;
		currType = 0;
	}
	else if (type == 1)
	{
		document.getElementById("display").innerHTML = "" + height; 
		currType = 1;
	}
	else if (type == 2)
	{
		document.getElementById("display").innerHTML = "" + weight; 
		currType = 2;
	}
	else if (type == 3)
	{
		document.getElementById("display").innerHTML = "" + bpm; 
		currType = 3;
	}
	else if (type == 4)
	{
		document.getElementById("display").innerHTML = "" + runBpm;
		currType = 4;
	}
	else if (type == 5)
	{
		document.getElementById("display").innerHTML = "" + dist; 
		currType = 5;
	}
	else if (type == 6)
	{
		document.getElementById("display").innerHTML = "" + h + ":" + (m < 10 ? ("0" + m) : ("" + m)) + 
			":" + (s < 10 ? ("0" + s) : ("" + s)); 
		currType = 6;
	}
}

function doKey(key)
{
	document.getElementById("clickSound").load();
	document.getElementById("clickSound").play();
	var A = document.getElementById("display").innerHTML;
	
	if (key === "k1")
	{
		if (A === "0")
		{
			A = "1";
		}
		else if (A.length >= DISPLAY_LENGTH)
		{
			// DO NOTHING
		}
		else
		{
			A = A + "1";
			if (currType === 6 && (A.length === 1 || A.length === 4))
			{
				A = A + ":";
			}
		}
		document.getElementById("display").innerHTML = A;
	}
	else if (key === "k2")
	{
		if (A === "0")
		{
			A = "2";
		}
		else if (A.length >= DISPLAY_LENGTH)
		{
			// DO NOTHING
		}
		else
		{
			A = A + "2";
			if (currType === 6 && (A.length === 1 || A.length === 4))
			{
				A = A + ":";
			}
		}
		document.getElementById("display").innerHTML = A;
	}
	else if (key === "k3")
	{
		if (A === "0")
		{
			A = "3";
		}
		else if (A.length >= DISPLAY_LENGTH)
		{
			// DO NOTHING
		}
		else
		{
			A = A + "3";
			if (currType === 6 && (A.length === 1 || A.length === 4))
			{
				A = A + ":";
			}
		}
		document.getElementById("display").innerHTML = A;
	}
	else if (key === "k4")
	{
		if (A === "0")
		{
			A = "4";
		}
		else if (A.length >= DISPLAY_LENGTH)
		{
			// DO NOTHING
		}
		else
		{
			A = A + "4";
			if (currType === 6 && (A.length === 1 || A.length === 4))
			{
				A = A + ":";
			}
		}
		document.getElementById("display").innerHTML = A;
	}
	else if (key === "k5")
	{
		if (A === "0")
		{
			A = "5";
		}
		else if (A.length >= DISPLAY_LENGTH)
		{
			// DO NOTHING
		}
		else
		{
			A = A + "5";
			if (currType === 6 && (A.length === 1 || A.length === 4))
			{
				A = A + ":";
			}
		}
		document.getElementById("display").innerHTML = A;
	}
	else if (key === "k6")
	{
		if (A === "0")
		{
			A = "6";
		}
		else if (A.length >= DISPLAY_LENGTH)
		{
			// DO NOTHING
		}
		else
		{
			A = A + "6";
			if (currType === 6 && (A.length === 1 || A.length === 4))
			{
				A = A + ":";
			}
		}
		document.getElementById("display").innerHTML = A;
	}
	else if (key === "k7")
	{
		if (A === "0")
		{
			A = "7";
		}
		else if (A.length >= DISPLAY_LENGTH)
		{
			// DO NOTHING
		}
		else
		{
			A = A + "7";
			if (currType === 6 && (A.length === 1 || A.length === 4))
			{
				A = A + ":";
			}
		}
		document.getElementById("display").innerHTML = A;
	}
	else if (key === "k8")
	{
		if (A === "0")
		{
			A = "8";
		}
		else if (A.length >= DISPLAY_LENGTH)
		{
			// DO NOTHING
		}
		else
		{
			A = A + "8";
			if (currType === 6 && (A.length === 1 || A.length === 4))
			{
				A = A + ":";
			}
		}
		document.getElementById("display").innerHTML = A;
	}
	else if (key === "k9")
	{
		if (A === "0")
		{
			A = "9";
		}
		else if (A.length >= DISPLAY_LENGTH)
		{
			// DO NOTHING
		}
		else
		{
			A = A + "9";
			if (currType === 6 && (A.length === 1 || A.length === 4))
			{
				A = A + ":";
			}
		}
		document.getElementById("display").innerHTML = A;
	}
	else if (key === "k0")
	{
		if (A === "0")
		{
			A = "0";
		}
		else if (A.length >= DISPLAY_LENGTH)
		{
			// DO NOTHING
		}
		else
		{
			A = A + "0";
			if (currType === 6 && (A.length === 1 || A.length === 4))
			{
				A = A + ":";
			}
		}
		document.getElementById("display").innerHTML = A;
	}
	else if (key === "kDOT")
	{
		if (A.length >= DISPLAY_LENGTH || currType === 6)
		{
			// DO NOTHING
		}
		else if (A === "0")
		{
			A = "0.";
		}
		else if (A.indexOf(".", 0) > -1)
		{
			// DO NOTHING
		}
		else
		{
			A = A + ".";
		}
		document.getElementById("display").innerHTML = A;
	}
	else if (key === "del")
	{
		if (A === "0")
		{
			// DO NOTHING
		}
		else
		{
			A = A.substring(0, A.length - 1);
			if (currType === 6 && (A.length == 4 || A.length == 1))
			{
				A = A.substring(0, A.length - 1);
			}
		}
		if (A ==="" && currType < 6)
		{
			A = "0";
		}
		document.getElementById("display").innerHTML = A;
	}
	else if (key === "ok")
	{
		if (currType == 0)
		{
			age = parseFloat(document.getElementById("display").innerHTML); 
			window.localStorage.setItem("age", age);
			document.getElementById("ageField").innerHTML = "Age: " + age + " years";
			tau.back();
		}
		else if (currType == 1)
		{
			height = parseFloat(document.getElementById("display").innerHTML); 
			window.localStorage.setItem("height", height);		
			document.getElementById("heightField").innerHTML = "Height: " + height + (metric ? " cm" : " in");
			tau.back();
		}
		else if (currType == 2)
		{
			weight = parseFloat(document.getElementById("display").innerHTML); 
			window.localStorage.setItem("weight", weight);		
			document.getElementById("weightField").innerHTML = "Weight: " + weight + (metric ? " kg" : " lb");
			tau.back();
		}
		else if (currType == 3)
		{
			bpm = parseFloat(document.getElementById("display").innerHTML); 
			window.localStorage.setItem("bpm", bpm);		
			document.getElementById("bpmField").innerHTML = "Rest BPM: " + bpm;
			tau.back();
		}
		else if (currType == 4)
		{
			runBpm = parseFloat(document.getElementById("display").innerHTML); 
			window.localStorage.setItem("runBpm", runBpm);		
			document.getElementById("runBpmField").innerHTML = "Run BPM: " + runBpm;
			tau.back();
		}
		else if (currType == 5)
		{
			dist = parseFloat(document.getElementById("display").innerHTML); 
			window.localStorage.setItem("dist", dist);
			document.getElementById("distField").innerHTML = "Dist.: " + dist + (metric ? " m" : " ft");
			tau.back();
		}
		else if (currType == 6)
		{
			if (document.getElementById("display").innerHTML.length === DISPLAY_LENGTH)
			{
				h = parseInt(document.getElementById("display").innerHTML.substring(0, 1)); 
				m = parseInt(document.getElementById("display").innerHTML.substring(2, 4)); 
				s = parseInt(document.getElementById("display").innerHTML.substring(5, 7)); 
				if (m < 60 && s < 60)
				{
					window.localStorage.setItem("h", h);
					window.localStorage.setItem("m", m);
					window.localStorage.setItem("s", s);
					document.getElementById("timeField").innerHTML = "Time: " +  + h + ":" + (m < 10 ? ("0" + m) : ("" + m)) + 
					":" + (s < 10 ? ("0" + s) : ("" + s));
					tau.back();
				}
			}
		}
	}
}

var bmi = 0.0;
var maxBpm = 0;
var intensity = 0;
var speed = 0.0;
var pace = 0.0;
var paceH = 0;
var paceM = 0;
var paceS = 0;
var cal = 0;
var fat = 0.0;
var carbo = 0.0;

function doCalc()
{
	var x = metric ? height / 100.0 : height / 254.0;
	bmi = parseInt(10.0 * weight / Math.pow(x, 2)) / 10;
	maxBpm = parseInt(205.8 - age * 0.685);
	intensity = 100.0 * (runBpm - bpm) / (maxBpm - bpm);
	speed = metric ? parseInt(100 * dist / 1000.0 / (h + m / 60.0 + s / 3600.0)) / 100 : 
		parseInt(100.0 * dist / 5280.0 / (h + m / 60.0 + s / 3600.0)) / 100;
	pace = metric ? (h + m / 60.0 + s / 3600.0) / (dist / 1000.0) :
		(h + m / 60.0 + s / 3600.0) / (dist / 5280.0);
	paceH = Math.floor(pace);
	paceM = Math.floor((pace - paceH) * 60.0);
	paceS = Math.floor(((pace - paceH) * 60.0 - paceM) * 60.0);
	var speed1 = metric ? speed : speed * 1.609344;
	var weight1 = metric ? weight : weight / 0.45359237;
	cal = parseInt((speed1 * 1000.0 / 60.0 + 17.5) * (60.0 * h + m + s / 60.0) * weight1 / 1000.0);
	var fatRatio = 100.0;
	if (intensity > 100)
	{
		fatRatio = 0.0;
	}
	else if (intensity > 80)
	{
		fatRatio = 10.0 - (intensity - 80.0) * 0.5;
	}
	else if (intensity > 45)
	{
		fatRatio = 100.0 - (intensity - 45.0) * (90.0 / 35.0);
	}
	
	fat = parseInt(10.0 * fatRatio / 100.0 * cal / 9.4) / 10.0;
	carbo = parseInt(10.0 * (100.0 - fatRatio) / 100.0 * cal / 4.2) / 10.0;
	
	var resultText = "";
    if (bmi < 16)
    {
    	resultText = "Your BMI (Body Mass Index) is <b style='color: #ce2302;'>" + bmi + 
    		"</b> and you are severely underweight.<br/><br/>You must start eating food high in calories.<br/><br/>";
	}
	else if (bmi >= 16 && bmi < 18.5)
	{
		resultText = "Your BMI (Body Mass Index) is <b style='color: #ed8600;'>" + bmi + 
			"</b> and you are underweight.<br/><br/>You must eat food high in calories to reach the normal BMI.<br/><br/>";
	}
	else if (bmi >= 18.5 && bmi < 25)
	{
		resultText = "Your BMI (Body Mass Index) is <b style='color: #64a323;'>" + bmi + 
			"</b> and your BMI is normal.<br/><br/>Congratulations! Maintain your weight.<br/><br/>";
	}
	else if (bmi >= 25 && bmi < 30)
	{
		resultText = "Your BMI (Body Mass Index) is <b style='color: #ed8600;'>" + bmi + 
			"</b> and you are overweight.<br/><br/>It's time to start losing weight.<br/><br/>";
	}
	else if (bmi >= 30)
	{
		resultText = "Your BMI (Body Mass Index) is <b style='color: #ce2302;'>" + bmi + 
			"</b> and you are obese.<br/><br/>You must eat healthier food and start losing weight.<br/><br/>";
	}
	
    resultText += "Your maximum HR (Heart Rate) is <b style='color: #00efef;'>" + maxBpm + " BPM</b> (Beats Per Minute), based on your age.<br/><br/>";

    resultText += "You were running with ";
    if (intensity <= 60.0)
    {
        resultText += "<b style='color: #64a323;'>";
    }
    else if (intensity <= 80.0)
    {
        resultText += "<b style='color: #ed8600;'>";
    }
    else
    {
        resultText += "<b style='color: #ce2302;'>";
    }
    resultText += parseInt(intensity) + "%</b> of your maximum intensity.<br/><br/>";

    resultText += "Your running speed was <b style='color: #00efef;'>" + speed;
    if (metric)
    {
    	resultText += " kph</b> (kilometers per hour).<br/><br/>Your running pace was <b style='color: #00efef;'>";
    }
    else
    {
    	resultText += " mph</b> (miles per hour).<br/><br/>Your running pace was <b style='color: #00efef;'>";
    }
    
	if (paceM > 1)
	{
		resultText = resultText + paceM + " minutes "
	}
	else
	{
		resultText = resultText + paceM + " minute "
	}
	if (paceS > 1)
	{
		resultText = resultText + paceS + " seconds "
	}
	else
	{
		resultText = resultText + paceS + " second "
	}
	if (metric)
	{
		resultText = resultText + "</b>per kilometer.<br/><br/>";
	}
	else
	{
		resultText = resultText + "</b>per mile.<br/><br/>";
	}
	
	resultText += "During your run, you burnt <b style='color: #00efef;'>" + cal + " kcal</b>.<br/><br/>";

	resultText += "During your run, ";
	if (fatRatio > 50.0)
    {
        resultText += "<b style='color: #64a323;'>";
    }
    else if (fatRatio > 5.0)
    {
        resultText += "<b style='color: #ed8600;'>";
    }
    else
    {
        resultText += "<b style='color: #ce2302;'>";
    }
	resultText += (parseInt(10 * fatRatio) / 10.0) + "%</b> of your energy came from burning body fat.<br/><br/>" +
        "You lost <b style='color: #00efef;'>" + (fat == 0 ? "0.0" : fat) + " grams</b> of body fat and burnt <b style='color: #00efef;'>" + 
        (carbo == 0 ? "0.0" : carbo) + " grams</b> of carbohydrates.";
	
	document.getElementById("textValue").innerHTML = resultText;
	
	var score = new Score(tizen.time.getCurrentDateTime().toDateString(), bmi, maxBpm, parseInt(intensity), speed1, cal, fatRatio, fat, carbo, 
			(metric ? parseInt(dist) : parseInt(dist / 3.2808399)), h, m, s);
	scoreboard.list.splice(0, 0, score);
	window.localStorage.setItem("scoreboard", JSON.stringify(scoreboard));
}

function fillHistory()
{
	var text = "";
	if (scoreboard.list.length > 0)
	{
		for (var i = 0; i < scoreboard.list.length; i++)
		{
			var score = scoreboard.list[i];
			text += "<li><a id=\"score" + i + "\" href=\"#\" onclick=\"deleteScore(" + i + 
				")\" style=\"font-size: large; text-align: left;\">" + score.recordDate + " - " + score.cal + 
				" kcal<br/>" + (metric ? score.distanceN + " m" : parseInt(score.distanceN * 3.2808399) + " ft") + " - " +
				 + score.h + ":" + (score.m < 10 ? ("0" + score.m) : ("" + score.m)) + 
					":" + (score.s < 10 ? ("0" + score.s) : ("" + score.s)) + " - Int.: " + score.intensity + "%<br/>" +
				(metric ? score.speedN + "kph" : (parseInt(score.speedN / 1.609344 * 10) / 10.0) + " mph") + " - Fat: " + 
				score.fat + " g - Carbo: " + score.carbo + " g</a></li>";
		}
	}
	else
	{
		text += "<li><a href=\"#\" align=\"center\" width=\"100%\">Empty list!</a></li>";
	}
	document.getElementById("historyList").innerHTML = text;
}

function deleteScore(pos)
{
	var r = confirm("Do you want to delete this record?");
	if (r == true) 
	{
		scoreboard.list.splice(pos, 1);
		window.localStorage.setItem("scoreboard", JSON.stringify(scoreboard));
		fillHistory();
	}
}

( function () {
	window.addEventListener( 'tizenhwkey', function( ev ) {
		if( ev.keyName == "back" ) {
			var page = document.getElementsByClassName( 'ui-page-active' )[0],
				pageid = page ? page.id : "";
			if( pageid === "main" ) {
				tizen.application.getCurrentApplication().exit();
			} else {
				window.history.back();
			}
		}
	} );
} () );
