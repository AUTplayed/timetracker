var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);

var tzo = 3600000;
var jiraurl = "https://$1$2$3"; // $1 = task | $2 = date (yyyyMMddHHmm) | $3 = timeSeconds
var tturl = "https://$1$2"; // $1 = startTime (yyyyMMddHHmm) | $2 = endtime (yyyyMMddHHmm)
var today = new Date();

var begin = $("#begin");
var end = $("#end");
var duration = $("#duration");
var link = $("#link");
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
	$$("#times > .taskrow").forEach(t => times.removeChild(t));
	restore();
}

restore();

function calcDuration() {
	var _time = new Date(end.valueAsNumber - begin.valueAsNumber - tzo);
	_time = _time.getMinutes() / 60 + _time.getHours();
	if (_time > 6) _time -= 0.5;
	duration.innerHTML = _time + "h";
	save();
	if (!begin.value || !end.value) return;
	link.innerHTML = `<a href="${buildLink(tturl, formatDate(new Date(begin.valueAsNumber - tzo)), formatDate(new Date(end.valueAsNumber - tzo)))}">timetracking</a>`;
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
	if (parseFloat(_duration.value) > getHours(new Date(end.valueAsNumber - begin.valueAsNumber - tzo))) {
		_end.valueAsDate = end.valueAsDate;
	} else {
		if (e.target.className == "end" || e.target.className == "begin") {
			_duration.value = getHours(new Date(_end.valueAsNumber - _begin.valueAsNumber - tzo));
		}
		var _tempdate = new Date(_begin.valueAsNumber - tzo);
		if (_duration.value != "")
			setHours(_tempdate, getHours(_tempdate) + parseFloat(_duration.value));
		_end.valueAsDate = new Date(_tempdate.getTime() + tzo);
	}
	_duration.value = getHours(new Date(_end.valueAsNumber - _begin.valueAsNumber - tzo));
	calcTaskLink(_link, _task, parseFloat(_duration.value));
	save();
}

var tasktime = [];

function calcTaskLink(_link, _task, _duration) {
	if (!_link || !_task.value || !_duration) return;
	if (_task.value.startsWith("http")) {
		_task.value = _task.value.split("/").pop().split("\?").shift();
	}
	_link.innerHTML = `<a href="${buildLink(jiraurl, _task.value, formatDate(today), _duration * 60 * 60)}">jira</a>`;
}

function addTask(data) {
	var _row = document.createElement("tr");
	_row.className = "taskrow";
	_row.appendChild(addTd("time", "begin", data.begin));
	_row.appendChild(addTd("time", "end", data.end));
	_row.appendChild(addTd("text", "task", data.task));
	_row.appendChild(addTd("number", "duration", "", 0.25));
	var _link = document.createElement("td");
	_link.className = "link";
	_row.appendChild(_link);
	times.insertBefore(_row, insb);
	$$(".task,.duration").forEach(e => e.onchange = calcTask);
	$$(".begin,.end").forEach(e => e.onblur = calcTask);
	calcTask({ row: _row, target: { className: "begin" } });
}

function addTd(_type, _class, value, step) {
	var _td = document.createElement("td");
	var _input = document.createElement("input");
	_input.type = _type;
	_input.className = _class;
	_input.value = value ? value : "";
	step ? _input.step = step : undefined;
	_td.appendChild(_input);
	return _td;
}

function rmTd() {
	rows = $$("#times > tr");
	times.removeChild(rows[rows.length - 3]);
}

function save() {
	var data = {};
	data.begin = begin.value;
	data.end = end.value;
	data.tasks = [];
	var _tasks = $$("#times > .taskrow");
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
	var data = {};
	try {
		data = JSON.parse(document.cookie);
	} catch (e) {
	}
	begin.value = data.begin ? data.begin : "";
	end.value = data.end ? data.end : "";
	if (data.tasks) {
		data.tasks.forEach(task => {
			addTask(task);
		});
	} else {
		addTask({});
	}
	calcDuration();
}

function getHours(_date) {
	return _date.getMinutes() / 60 + _date.getHours();
}

function setHours(_date, _hours) {
	var _minutes = (_hours % 1);
	var _hours = _hours - _minutes;
	_date.setMinutes(_minutes * 60);
	_date.setHours(_hours);
}

function buildLink(template) {
	for (var i = 1; i < arguments.length; i++) {
		template = template.replace("\$" + i, arguments[i]);
	}
	return template;
}

function formatDate(date) {
	return `${pad(today.getFullYear(), 4)}${pad(today.getMonth() + 1, 2)}${pad(today.getDate(), 2)}${pad(date.getHours(), 2)}${pad(date.getMinutes(), 2)}`;
}

function pad(value, digits) {
	value = Math.round(value).toString();
	var _length = value.length;
	for (var i = _length; i < digits; i++) {
		value = "0" + value;
	}
	return value;
}
