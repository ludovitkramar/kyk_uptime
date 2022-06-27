class cTest {
    constructor(testName, test, expected, interval) {
        this.testName = testName;
        this.interval = interval;
        this.test = test;
        this.expected = expected;
        //this.log = [];
        async function getLog(s) {
            const res = await fetch(`/${testName}.log`, {
                method: "GET",
                headers: { "Content-Type": "text/plain" }
            });
            const logs = await res.text();
            //console.log(logs);
            function cleanLOGs(txt) {
                txt = txt.replaceAll('\r\n', ',')
                txt = txt.slice(0, txt.lastIndexOf(',')) + "]"
                return JSON.parse(txt);
            }
            s.log = cleanLOGs(`[${logs}]`);
            //console.log(s.log);

            function makeSummary(log, interval) { //this function produces bad result, s.summary should not be used, BUT it modifies the original s.log object and THAT is needed
                var lastState = 999;
                var lastTime = log[0][0];
                const timeAllowance = interval * 1.1;
                var summary = [];
                //console.log(`making summary for ${s.testName}, interval = ${interval}`);
                //console.log(log);
                for (key in log) {
                    const e = log[key];
                    const loggerWasDown = e[0] - lastTime > timeAllowance;
                    // console.log(loggerWasDown, e, lastTime);
                    if (e[1] != lastState || loggerWasDown) {
                        if (loggerWasDown) {
                            const timeStamp = log[key * 1 - 1][0]
                            //summary.push([timeStamp, 4])
                            const dataObj = { 'time': timeStamp, 'state': 4, }
                            summary.push(dataObj);
                        }
                        const r = e[1]
                        if (r != 0 && r != 1 && r != 2 && r != 4) { // 0=down, 1=up, 2=test was partially succesful, 3=mysterious error, 4=no data
                            e[1] = 3; //set to three if input was something else
                        }
                        const dataObj = { 'time': e[0], 'state': e[1], }
                        summary.push(dataObj);
                        lastState = e[1];
                    }
                    lastTime = e[0];
                }
                const e = log[log.length - 1];
                summary.push({ 'time': e[0], 'state': e[1], });
                return summary
            }
            s.summary = makeSummary(s.log, s.interval); //create a summary

            var graphsCode = `
            <div id="${s.testName}graphBox">
                <span class="text-md block m-0.5 text-slate-800">${s.testName}</span>
                <svg class="" id="${s.testName}graph" viewbox="0 0 800 80"></svg>
            </div>`
            document.getElementById('graphsBox').innerHTML += graphsCode;

            const svgNS = 'http://www.w3.org/2000/svg';
            const graphEle = document.getElementById(`${s.testName}graph`);

            //console.log(graphEle);

            //console.log(d3)

            //const xScale = d3.scaleBand().domain(s.log.map(dataPoint => dataPoint[0])).rangeRound([0, 800]).padding(0);
            const xDomain = [s.log[0][0], s.log[s.log.length - 1][0]]
            const xScale = d3.scaleLinear().domain(xDomain).range([0, 800]);
            //const yScale = d3.scaleLinear().domain(s.log.map(dataPoint => dataPoint[0])).range([0, 800]);

            const container = d3.select(`#${s.testName}graph`)
                .classed('shadow', true)
                .classed('shadow-slate-400', true)
                .style('border-radius', '3px')
                .style('padding', '2px');

            function getColor(v) {
                switch (v) {
                    case 0:
                        return '#ff2000'
                    case 1:
                        return '#20a070'
                    case 2:
                        return '#dddd22'
                    case 3:
                        return '#dd3322'
                    default:
                        return '#000000'
                }
            }

            container
                .selectAll('.bar')
                .data(s.log)
                .enter()
                .append('rect')
                .style('fill', data => getColor(data[1]))
                .classed('bar', true)
                .attr('width', '1')
                .attr('height', '80px')
                .attr('y', 0)
                .attr('x', data => xScale(data[0]));

            // d3.select(`#${s.testName}graph`)
            //     .selectAll('p')
            //     .data(s.log)
            //     .enter()
            //     .append('p')
            //     .text(dta => [dta[1],dta[0],new Date(dta[0])]);

            // d3.select(`#${s.testName}graph`)
            //     .selectAll('p')
            //     .data(s.summary)
            //     .enter()
            //     .append('p')
            //     .text(dta => [dta.state,dta.time,new Date(dta.time)]);

            // function genSVG(psum) {
            //     for (key in psum) {
            //         const e = psum[key]; //this element
            //         var r = psum[key][1] //current state(color), 0, 1, 2 or 3
            //         //console.log(e);
            //         if (r != 0 && r != 1 && r != 2 && r != 4) { // 0=down, 1=up, 2=test was partially succesful, 3=mysterious error, 4=no data
            //             r = 3;
            //         }
            //         //console.log(r);
            //         var color = '';
            //         switch (r) {
            //             case 0:
            //                 color = 'rgb(180, 0, 0)'
            //                 break;
            //             case 1:
            //                 color = 'rgb(0, 180, 0)'
            //                 break;
            //             case 2:
            //                 color = 'rgb(240, 200, 0)'
            //                 break;
            //             case 3:
            //                 color = 'rgb(0, 0, 0)'
            //                 break;
            //             case 4:
            //                 color = 'rgb(230, 230, 230)'
            //                 break;
            //             default:
            //                 color = 'rgb(0, 180, 0)'
            //                 break;
            //         }
            //         let newRect = document.createElementNS(svgNS, 'rect');
            //         newRect.setAttribute("x", `${e[0]*100}%`);
            //         newRect.setAttribute("y", "0");
            //         newRect.setAttribute("width", "100%");
            //         newRect.setAttribute("height", "100%");
            //         newRect.setAttribute("fill", `${color}`);
            //         mainSVG.appendChild(newRect);
            //     }
            // }
            // genSVG(s.psummary)
        }
        getLog(this);
        //console.log(`${this.testName} cTest object created.`);
        console.log(this);
    }
};

async function main() {
    const res = await fetch("/logger.conf", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    let lConf = await res.json();
    let testNames = [];

    for (key in lConf) { //create the objects
        if (key.indexOf("Test") != -1) {
            const interval = lConf["INTERVAL"];
            const test = lConf[key]; // array of arguments for curl
            const testName = key.slice(0, key.indexOf("Test")); //name of the test
            const expected = lConf[`${testName}Expected`]; //array of strings that should be found in the output of curl.
            eval(`var ${key} = new cTest(testName, test, expected, interval)`); //create cTest object with the name it was given in the definitions (lConf) object.
            testNames.push(testName);
        }
    }

    function populateOverview(testNames, interval) {
        var str = `<span class="">There are <span class="bg-cyan-700 text-cyan-100 pl-1 pr-1">${testNames.length}</span> tests being performed every <span class="bg-cyan-700 text-cyan-100 pl-1 pr-1">${Math.round(interval / 1000)}</span> seconds:</span><ol class="list-decimal ml-8">`;
        for (key in testNames) {
            //console.log(eval(`${testNames[key] + "Test"}`));
            str += `<li class="m-0.5">${testNames[key]}</li>`
        }
        str += `</ol>`
        document.getElementById('overview').innerHTML += str;
    }

    populateOverview(testNames, lConf['INTERVAL']);

    function populateDetails(tn, lc) {
        var str = "";
        tn.forEach(element => {
            args = "";
            lc[`${element}Test`].forEach(e => { args += `${e} ` })
            expct = "";
            lc[`${element}Expected`].forEach(e => { expct += `<li><code>${e}</code></li>` })
            str += `<span class="text-lg block m-0.5 text-cyan-800">${element}</span>
            <ul class="list-disc ml-7">
                <li>Test command: <code class="rounded-md border border-slate-300 bg-slate-100 text-sm p-1 pb-0 text-slate-700">${lc["COMMAND"]} ${args} </code></li>
                <li>Response should contain:</li>
                <ul class="rounded-md shadow-sm shadow-slate-400 bg-slate-100 text-sm p-1 mb-1 text-slate-700">
                    ${expct}
                </ul>
            </ul>`;

        });
        document.getElementById('details').innerHTML += str;
    }

    populateDetails(testNames, lConf);
}
main()