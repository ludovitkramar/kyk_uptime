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
            function cleanLOGs(txt) {
                txt = txt.replaceAll('\r\n', ',')
                txt = txt.slice(0, txt.lastIndexOf(',')) + "]"
                return JSON.parse(txt);
            }
            s.log = cleanLOGs(`[${logs}]`);
            function makeSummary(log, interval) {
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
                            summary.push([timeStamp, 4])
                        }                       
                        summary.push(e);
                        lastState = e[1];
                    }
                    lastTime = e[0];
                }
                summary.push(log[log.length - 1]);
                return summary
            }
            s.summary = makeSummary(s.log, s.interval); //create a summary
            // var pSVGelement = document.createElement("SVG"); //create the preview
            // pSVGelement.innerHTML = s.genPreviewSVG(s.summary);
            // document.getElementById('test1').appendChild(pSVGelement);
        }
        getLog(this);
        //console.log(`${this.testName} cTest object created.`);
        console.log(this);
    }

    // genPreviewSVG(smry) {
    //     //console.log(`Generating SVG preview for ${this.testName}`);
    //     var svg = '';
    //     var rm = 0; //right most position, adds width of every created rectangle
    //     const lngth = smry.length
    //     for (key in smry) {
    //         if (key < lngth - 1) {
    //             const e = smry[key]; //this element
    //             const n = smry[key * 1 + 1]; //next element
    //             var r = smry[key][1] //current state(color), 0, 1, 2 or 3
    //             if (r != 0 && r != 1 && r != 2 && r != 4) { // 0=down, 1=up, 2=test was partially succesful, 3=mysterious error, 4=no data
    //                 r = 3;
    //             }
    //             const t = n[0] - e[0] //time difference (width of rectangle)
    //             const l = rm; //x position of rectangle
    //             rm += t;
    //             //console.log(r, l, t);
    //             var color = '';
    //             switch (r) {
    //                 case 0:
    //                     color = 'rgb(180, 0, 0)'
    //                     break;
    //                 case 1:
    //                     color = 'rgb(0, 180, 0)'
    //                     break;
    //                 case 2:
    //                     color = 'rgb(240, 200, 0)'
    //                     break;
    //                 case 4:
    //                     color = 'rgb(120, 120, 120)'
    //                 default:
    //                     color = 'black'
    //                     break;
    //             }
    //             svg += '<rect x="'+l+'" y="40" width="'+t+'" height="10" style="fill: '+color+'; stroke: rgb(180, 40, 100); stroke-width:0; fill-opacity: 1; stroke-opacity: 1;"></rect>';
    //         }
    //     }
    //     //console.log(svg);
    //     return svg
    // };
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
        var str = `<span>There are ${testNames.length} tests being performed every ${Math.round(interval / 1000)} seconds:</span><ol>`;
        for (key in testNames) {
            //console.log(eval(`${testNames[key] + "Test"}`));
            str += `<li>${testNames[key]}</li>`
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
            str += `<span>${element}</span>
            <ul>
                <li>Test command: <code>${lc["COMMAND"]} ${args} </code></li>
                <li>Response should contain:</li>
                <ul>
                    ${expct}
                </ul>
            </ul>`;

        });
        document.getElementById('details').innerHTML += str;
    }

    populateDetails(testNames, lConf);
}
main()