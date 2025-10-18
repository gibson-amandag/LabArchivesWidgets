"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initEstrousWidget = void 0;
const widgetHtml_1 = require("./widgetHtml");
const shim_1 = require("./legacy/shim");
const scriptEditorRaw_1 = require("./legacy/scriptEditorRaw");
async function initEstrousWidget(opts) {
    const container = opts.container;
    // Inject original widget HTML into container (first small step of verbatim port)
    container.innerHTML = widgetHtml_1.widgetHtml;
    // Inject shim script into the DOM so global functions expected by the widget exist
    try {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.innerHTML = shim_1.shimScript;
        document.head.appendChild(s);
    }
    catch (e) {
        console.error('Failed to inject shim script', e);
    }
    // Inject minimal embedded widget script so my_widget_script is available
    try {
        const s2 = document.createElement('script');
        s2.type = 'text/javascript';
        s2.innerHTML = scriptEditorRaw_1.scriptEditorCode;
        document.head.appendChild(s2);
    }
    catch (e) {
        console.error('Failed to inject embedded widget script', e);
    }
    // After a short delay, initialize the embedded widget with the first saved instance (if any)
    setTimeout(async () => {
        try {
            // @ts-ignore
            const widget = window.my_widget_script;
            if (!widget) {
                console.warn('my_widget_script not present in pane');
                return;
            }
            // Ensure shim's parent_class is present
            // @ts-ignore
            widget.parent_class = window.parent_class || {};
            const loaded = await opts.loadInstances();
            if (loaded && loaded.length > 0) {
                const first = loaded[0];
                // call init with the saved JSON structure
                // @ts-ignore
                widget.init('edit', JSON.stringify(first));
            }
            else {
                // no saved data - initialize with empty object
                // @ts-ignore
                widget.init('edit', JSON.stringify({}));
            }
        }
        catch (err) {
            console.error('Error initializing embedded widget:', err);
        }
    }, 300);
    // The widget HTML includes its own containers; use `widgetRoot` to place our controls below it
    const widgetRoot = document.createElement('div');
    widgetRoot.id = 'estrous-widget-host';
    container.appendChild(widgetRoot);
    const header = document.createElement('h3');
    header.textContent = 'Estrous Cycle Widget (pane)';
    widgetRoot.appendChild(header);
    const controls = document.createElement('div');
    const addInstanceBtn = document.createElement('button');
    addInstanceBtn.textContent = 'Add instance';
    controls.appendChild(addInstanceBtn);
    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Reload from frontmatter';
    controls.appendChild(loadBtn);
    container.appendChild(controls);
    const main = document.createElement('div');
    main.style.marginTop = '8px';
    container.appendChild(main);
    let instances = [];
    let activeIndex = 0;
    async function renderInstancesList() {
        main.innerHTML = '';
        const list = document.createElement('div');
        list.style.marginBottom = '8px';
        instances.forEach((inst, idx) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.gap = '8px';
            const title = document.createElement('strong');
            title.textContent = inst.name || `Instance ${idx + 1}`;
            row.appendChild(title);
            const edit = document.createElement('button');
            edit.textContent = 'Open';
            edit.onclick = () => { activeIndex = idx; renderActiveInstance(); };
            row.appendChild(edit);
            const del = document.createElement('button');
            del.textContent = 'Delete';
            del.onclick = async () => { instances.splice(idx, 1); await opts.saveInstances(instances); renderInstancesList(); };
            row.appendChild(del);
            list.appendChild(row);
        });
        main.appendChild(list);
    }
    function formatDateInput(val) { return val || ''; }
    async function renderActiveInstance() {
        // Clear and show instance editor
        main.innerHTML = '';
        if (!instances[activeIndex])
            return;
        const inst = instances[activeIndex];
        const title = document.createElement('h4');
        title.textContent = inst.name || `Instance ${activeIndex + 1}`;
        main.appendChild(title);
        // Name field
        const nameRow = document.createElement('div');
        nameRow.appendChild(document.createTextNode('Name: '));
        const nameIn = document.createElement('input');
        nameIn.value = inst.name || '';
        nameIn.oninput = () => { inst.name = nameIn.value; opts.saveInstances(instances); };
        nameRow.appendChild(nameIn);
        main.appendChild(nameRow);
        // Mice container
        const miceDiv = document.createElement('div');
        miceDiv.style.marginTop = '10px';
        const miceTitle = document.createElement('h5');
        miceTitle.textContent = 'Mice:';
        miceDiv.appendChild(miceTitle);
        const mouseList = document.createElement('div');
        const renderMouseList = () => {
            mouseList.innerHTML = '';
            (inst.mouseNums || []).forEach((mNum) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.gap = '8px';
                row.style.alignItems = 'center';
                row.appendChild(document.createTextNode(`Mouse ${mNum}: `));
                const idIn = document.createElement('input');
                idIn.value = ((_b = (_a = inst.mice) === null || _a === void 0 ? void 0 : _a[mNum]) === null || _b === void 0 ? void 0 : _b.id) || '';
                idIn.placeholder = 'ID';
                idIn.oninput = () => { inst.mice[mNum].id = idIn.value; opts.saveInstances(instances); };
                row.appendChild(idIn);
                const cycleIn = document.createElement('input');
                cycleIn.value = String((_e = (_d = (_c = inst.mice) === null || _c === void 0 ? void 0 : _c[mNum]) === null || _d === void 0 ? void 0 : _d.cycleNum) !== null && _e !== void 0 ? _e : '');
                cycleIn.placeholder = 'Cycle #';
                cycleIn.oninput = () => { inst.mice[mNum].cycleNum = cycleIn.value; opts.saveInstances(instances); };
                row.appendChild(cycleIn);
                const startIn = document.createElement('input');
                startIn.type = 'date';
                startIn.value = ((_g = (_f = inst.mice) === null || _f === void 0 ? void 0 : _f[mNum]) === null || _g === void 0 ? void 0 : _g.startDate) || '';
                startIn.onchange = () => { inst.mice[mNum].startDate = startIn.value; adjustScoringRowsForMouse(mNum); opts.saveInstances(instances); };
                row.appendChild(startIn);
                const endIn = document.createElement('input');
                endIn.type = 'date';
                endIn.value = ((_j = (_h = inst.mice) === null || _h === void 0 ? void 0 : _h[mNum]) === null || _j === void 0 ? void 0 : _j.endDate) || '';
                endIn.onchange = () => { inst.mice[mNum].endDate = endIn.value; adjustScoringRowsForMouse(mNum); opts.saveInstances(instances); };
                row.appendChild(endIn);
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Delete';
                delBtn.onclick = async () => { delete inst.mice[mNum]; inst.mouseNums = inst.mouseNums.filter(x => x !== mNum); await opts.saveInstances(instances); renderActiveInstance(); };
                row.appendChild(delBtn);
                mouseList.appendChild(row);
            });
        };
        miceDiv.appendChild(mouseList);
        const addMouseBtn = document.createElement('button');
        addMouseBtn.textContent = 'Add mouse';
        addMouseBtn.onclick = async () => { let next = 1; if (inst.mouseNums && inst.mouseNums.length)
            next = Math.max(...inst.mouseNums) + 1; inst.mouseNums = inst.mouseNums || []; inst.mouseNums.push(next); inst.mice[next] = { id: '', cycleNum: '', startDate: '', endDate: '' }; await opts.saveInstances(instances); renderActiveInstance(); };
        miceDiv.appendChild(addMouseBtn);
        main.appendChild(miceDiv);
        renderMouseList();
        // Card container (simple)
        const cardContainer = document.createElement('div');
        cardContainer.style.marginTop = '12px';
        main.appendChild(cardContainer);
        cardContainer.appendChild(document.createTextNode('Scoring cards (per date):'));
        // Build dates index from mice
        rebuildDatesIndex();
        function rebuildDatesIndex() {
            inst.dates = inst.dates || {};
            inst.mouseNums.forEach((m) => {
                const mObj = inst.mice[m];
                if (!mObj)
                    return;
                if (mObj.startDate && mObj.endDate) {
                    const s = new Date(mObj.startDate);
                    const e = new Date(mObj.endDate);
                    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
                        const iso = d.toISOString().slice(0, 10);
                        inst.dates[iso] = inst.dates[iso] || {};
                        if (!inst.dates[iso][m])
                            inst.dates[iso][m] = 1; // placeholder day numbering not strictly accurate here
                    }
                }
            });
        }
        function adjustScoringRowsForMouse(mNum) {
            // rebuild dates index and ensure scores exist (we'll store scores under inst.mice[mNum].scores)
            rebuildDatesIndex();
            if (!inst.mice[mNum].dates)
                inst.mice[mNum].dates = [];
            inst.mice[mNum].dates = [];
            for (const date of Object.keys(inst.dates || {})) {
                if (inst.dates && inst.dates[date] && inst.dates[date].hasOwnProperty(mNum)) {
                    if (!inst.mice)
                        inst.mice = {};
                    if (!inst.mice[mNum])
                        inst.mice[mNum] = { id: '', cycleNum: '', startDate: '', endDate: '', dates: [] };
                    if (!inst.mice[mNum].dates)
                        inst.mice[mNum].dates = [];
                    inst.mice[mNum].dates.push(date);
                }
            }
        }
        // Render basic table
        const tableDiv = document.createElement('div');
        tableDiv.style.marginTop = '12px';
        main.appendChild(tableDiv);
        const table = document.createElement('table');
        table.border = '1';
        table.style.borderCollapse = 'collapse';
        tableDiv.appendChild(table);
        function renderTable() {
            table.innerHTML = '';
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            ['mouseID', 'cycleID', 'startDate'].forEach(h => { const th = document.createElement('th'); th.textContent = h; headerRow.appendChild(th); });
            // compute days max
            const maxDays = Math.max(...(inst.mouseNums.map(m => (inst.mice && inst.mice[m] && inst.mice[m].dates) ? inst.mice[m].dates.length : 0)), 0);
            for (let i = 1; i <= maxDays; i++) {
                const th = document.createElement('th');
                th.textContent = 'Day' + i;
                headerRow.appendChild(th);
            }
            thead.appendChild(headerRow);
            table.appendChild(thead);
            const tbody = document.createElement('tbody');
            inst.mouseNums.forEach((m) => {
                const tr = document.createElement('tr');
                const tdId = document.createElement('td');
                tdId.textContent = inst.mice[m].id || `Mouse ${m}`;
                tr.appendChild(tdId);
                const tdCycle = document.createElement('td');
                tdCycle.textContent = String(inst.mice[m].cycleNum || '');
                tr.appendChild(tdCycle);
                const tdStart = document.createElement('td');
                tdStart.textContent = inst.mice[m].startDate || '';
                tr.appendChild(tdStart);
                const days = inst.mice[m].dates || [];
                for (let i = 0; i < maxDays; i++) {
                    const td = document.createElement('td');
                    const dayDate = days[i];
                    const input = document.createElement('input');
                    input.style.width = '60px';
                    input.value = inst.mice[m][`day_${i + 1}`] || '';
                    input.oninput = () => { inst.mice[m][`day_${i + 1}`] = input.value; opts.saveInstances(instances); };
                    td.appendChild(input);
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
        }
        renderTable();
        const chartBtn = document.createElement('button');
        chartBtn.textContent = 'Update Charts';
        chartBtn.onclick = () => { makeCharts(); };
        main.appendChild(chartBtn);
        const chartDiv = document.createElement('div');
        chartDiv.id = 'chartDiv';
        chartDiv.style.marginTop = '8px';
        main.appendChild(chartDiv);
        async function makeCharts() {
            chartDiv.innerHTML = '';
            // load Google Charts
            if (!window.google || !window.google.charts) {
                await loadGoogleCharts();
            }
            for (const m of inst.mouseNums) {
                const id = inst.mice[m].id || `Mouse ${m}`;
                const rowArray = [];
                const days = inst.mice[m].dates || [];
                for (let i = 0; i < days.length; i++) {
                    const val = parseInt(String(inst.mice[m][`day_${i + 1}`])) || NaN;
                    rowArray.push([i + 1, val]);
                }
                const div = document.createElement('div');
                div.style.height = '200px';
                div.id = 'chart_' + m;
                chartDiv.appendChild(div);
                drawGoogleChart(rowArray, id, m, div.id);
            }
        }
        async function loadGoogleCharts() {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://www.gstatic.com/charts/loader.js';
                script.onload = () => { window.google.charts.load('current', { packages: ['corechart', 'line'], callback: () => resolve() }); };
                document.head.appendChild(script);
            });
        }
        function drawGoogleChart(rowArray, mouseID, mouseNum, elementId) {
            const google = window.google;
            if (!google || !google.visualization)
                return;
            const data = new google.visualization.DataTable();
            data.addColumn('number', 'Day');
            data.addColumn('number', 'Stage');
            data.addRows(rowArray);
            const options = { title: mouseID, hAxis: { title: 'Day' }, vAxis: { title: 'Stage', ticks: [{ v: 1, f: 'E' }, { v: 2, f: 'D' }, { v: 3, f: 'P' }], minValue: 0, maxValue: 4 }, legend: 'none' };
            const chart = new google.visualization.LineChart(document.getElementById(elementId));
            chart.draw(data, options);
        }
    }
    addInstanceBtn.onclick = async () => {
        const inst = { name: 'New instance', mouseNums: [], mice: {}, dates: {} };
        instances.push(inst);
        await opts.saveInstances(instances);
        await renderInstancesList();
    };
    loadBtn.onclick = async () => { instances = await opts.loadInstances(); await renderInstancesList(); };
    // initial load
    instances = await opts.loadInstances();
    await renderInstancesList();
}
exports.initEstrousWidget = initEstrousWidget;
