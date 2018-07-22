var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);

var tzo = 3600000;

var begin = $("#begin");
var end = $("#end");
var duration = $("#duration");
var add = $("#add");
var rm = $("#rm");
var clear = $("#clear");
var times = $("#times");
var insb = $("#insb");
var rows = $$("#times > tr");

begin.onchange = calcDuration;
end.onchange = calcDuration;

add.onclick = addTask;
rm.onclick = rmTd;
clear.onclick = () => {
	document.cookie = "{}";
	$$("#times > .task").forEach(t => times.removeChild(t));
	restore();
}

restore();

function calcDuration() {
	var _time = new Date(end.valueAsNumber - begin.valueAsNumber - tzo).getHours();
	if (_time > 6) _time -= 0.5;
	duration.innerHTML = _time + "h";
	save();
}

function calcTask(e) {
	rows = $$("#times > tr");
	var _tr = e.target.parentNode ? e.target.parentNode.parentNode : e.row;
	var _begin = _tr.querySelector(".begin");
	var _end = _tr.querySelector(".end");
	var _task = _tr.querySelector(".task");
	var _duration = _tr.querySelector(".duration");
	var _link = _tr.querySelector(".link");
	var _nextbegin, _lastend;
	var _trindex = Array.prototype.indexOf.call(rows, _tr);
	if (_trindex == rows.length - 3) _nextbegin = end;
	else _nextbegin = rows[_trindex + 1].querySelector(".begin");
	if (_trindex == 2) _lastend = begin;
	else _lastend = rows[_trindex - 1].querySelector(".end");

	if (_begin.value == "") {
		_begin.value = _lastend.value;
	}
	if (_end.value == "") {
		_end.value = _nextbegin.value;
	}
	if (parseFloat(_duration.value) > new Date(end.valueAsNumber - begin.valueAsNumber - tzo).getHours()) {
		_end.valueAsDate = end.valueAsDate;
	} else {
		if (e.target.className == "end" || e.target.className == "begin") {
			_duration.value = new Date(_end.valueAsNumber - _begin.valueAsNumber - tzo).getHours();
		}
		var _tempdate = new Date(_begin.valueAsNumber - tzo);
		if (_duration.value != "")
			_tempdate.setHours(_tempdate.getHours() + parseFloat(_duration.value));
		_end.valueAsDate = new Date(_tempdate.getTime() + tzo);
	}
	_duration.value = new Date(_end.valueAsNumber - _begin.valueAsNumber - tzo).getHours();
	save();
}

function addTask(data) {
	var _row = document.createElement("tr");
	_row.className = "task";
	_row.appendChild(addTd("time", "begin", data.begin));
	_row.appendChild(addTd("time", "end", data.end));
	_row.appendChild(addTd("text", "task", data.task));
	_row.appendChild(addTd("number", "duration", ""));
	var _link = document.createElement("td");
	_link.className = "link";
	_row.appendChild(_link);
	times.insertBefore(_row, insb);
	$$(".begin,.end,.duration").forEach(e => e.onchange = calcTask);
	calcTask({ row: _row, target: { className: "begin" } });
}

function addTd(_type, _class, value) {
	var _td = document.createElement("td");
	var _input = document.createElement("input");
	_input.type = _type;
	_input.className = _class;
	_input.value = value ? value : "";
	_td.appendChild(_input);
	return _td;
}

function rmTd() {
	rows = $$("#times > tr");
	times.removeChild(rows[rows.length - 3]);
}

function save() {
	var data = {};
	data.begin = begin.valueAsNumber;
	data.end = end.valueAsNumber;
	data.tasks = [];
	var _tasks = $$("#times > .task");
	for (var i = 0; i < _tasks.length; i++) {
		var _tr = _tasks[i];
		var _begin = _tr.querySelector(".begin").value;
		var _end = _tr.querySelector(".end").value;
		var _task = _tr.querySelector(".task").value;
		data.tasks.push({ begin: _begin, end: _end, task: _task });
	}
	document.cookie = JSON.stringify(data);
}

function restore() {
	try {
		JSON.parse(document.cookie);
	} catch (e) {
		document.cookie = "{}";
	}
	var data = JSON.parse(document.cookie);
	begin.valueAsNumber = data.begin ? data.begin : 0;
	end.valueAsNumber = data.end ? data.end : 0;
	if (data.tasks) {
		data.tasks.forEach(task => {
			addTask(task);
		});
	} else {
		addTask({});
	}
	calcDuration();
}