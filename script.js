class cTest {
    constructor(testName, test, expected) {
        this.testName = testName;
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
            return
        }
        getLog(this);
        console.log(`${this.testName} cTest object created.`);
        console.log(this);
        console.log(this.log);

        function makeSummary(log) {
            var lastState = 0;
            var summary = [];
            console.log('making summary');
            console.log(log);
            log.forEach(e => {
                console.log(e);
            });

            return summary
        }

        //this.summary = makeSummary(this.log);
        //console.log(this.summary);
    }



}

async function main() {
    const res = await fetch("/logger.conf", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    let lConf = await res.json();
    let testNames = [];

    for (key in lConf) { //create the objects
        if (key.indexOf("Test") != -1) {
            const test = lConf[key]; // array of arguments for curl
            const testName = key.slice(0, key.indexOf("Test")); //name of the test
            const expected = lConf[`${testName}Expected`]; //array of strings that should be found in the output of curl.
            eval(`var ${key} = new cTest(testName, test, expected)`); //create cTest object with the name it was given in the definitions (lConf) object.
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